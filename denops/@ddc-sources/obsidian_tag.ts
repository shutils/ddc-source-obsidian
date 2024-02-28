import {
  BaseSource,
  Context,
  DdcOptions,
  Denops,
  fn,
  Item,
  SourceOptions,
} from "./deps.ts";
import { getNotes, getPropertyTags } from "./common.ts";
import { Note } from "./types.ts";

type Params = {
  vault: string;
};

export class Source extends BaseSource<Params> {
  override async gather(args: {
    denops: Denops;
    context: Context;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    let notes: Note[] = [];
    let vault: string;
    if (args.sourceParams?.vault) {
      vault = args.sourceParams.vault;
    } else {
      vault = await fn.expand(args.denops, "~/obsidian") as string;
    }
    notes = await getNotes(vault);
    const tags = getPropertyTags(notes);
    return tags.map((tag) => ({ word: tag }));
  }

  override params(): Params {
    return {
      vault: "~/obsidian",
    };
  }
}
