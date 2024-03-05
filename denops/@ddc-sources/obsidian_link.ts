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
import { Note, Vault } from "./types.ts";
import { ensureVaults } from "./helper.ts";

type Params = {
  vaults: Vault[];
};

function isTriggered(input: string) {
  const regex = /.*\[.*/;
  return regex.test(input);
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
    const { denops, sourceParams } = args;
    if (!isTriggered(args.context.input)) {
      return [];
    }
    const currentFilePath = await fn.expand(args.denops, "%:p") as string;
    const currentFileDir = path.dirname(currentFilePath);
    const vaults = await ensureVaults(denops, sourceParams.vaults);
    if (!vaults.some((vault) => isInVault(currentFilePath, vault.path))) {
      return [];
    }
    const notes: Note[] = [];
    await Promise.all(vaults.map(async (vault) => {
      notes.push(...await getNotes(vault));
    }));
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
      vaults: [{ path: "~/obsidian", name: "default" }],
    };
  }
}
