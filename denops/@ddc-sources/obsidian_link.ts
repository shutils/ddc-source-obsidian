import {
  BaseSource,
  Context,
  DdcOptions,
  Denops,
  fn,
  Item,
  path,
  SourceOptions,
  unknownutil as u,
} from "./deps.ts";
import { getNotes, isInVault } from "./common.ts";
import { Note } from "./types.ts";

type Params = {
  vault: string;
};

function isTriggered(input: string) {
  const regex = /.*\[.*/
  return regex.test(input)
}

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    context: Context;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    if (!isTriggered(args.context.input)) {
      return []
    }
    const currentFilePath = await fn.expand(args.denops, "%:p") as string;
    if (!isInVault(currentFilePath, args.sourceParams.vault)) {
      return [];
    }
    const currentFileDir = path.dirname(currentFilePath);
    let vault: string;
    if (args.sourceParams?.vault) {
      vault = args.sourceParams.vault;
    } else {
      vault = await fn.expand(args.denops, "~/obsidian") as string;
    }
    const notes: Note[] = await getNotes(vault);
    const links: Item[] = [];
    notes.map((note) => {
      let display: string;
      if (
        u.isObjectOf({ title: u.isString, ...u.isUnknown })(note.properties)
      ) {
        display = note.properties.title;
      } else {
        display = path.basename(note.path);
      }
      let linkPath: string;
      const noteDir = path.dirname(note.path);
      if (currentFileDir === noteDir) {
        linkPath = path.basename(note.path);
      } else {
        linkPath = path.relative(currentFileDir, note.path);
      }
      const word = `${display}](${linkPath})`;
      links.push({
        word,
      });
    });

    return links;
  }

  override params(): Params {
    return {
      vault: "~/obsidian",
    };
  }
}
