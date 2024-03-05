import {
  BaseSource,
  Context,
  DdcOptions,
  Denops,
  fn,
  Item,
  SourceOptions,
} from "./deps.ts";
import { getNotes, getPropertyTags, isInVault } from "./common.ts";
import { Note, Vault } from "./types.ts";
import { ensureVaults } from "./helper.ts";

type Params = {
  vaults: Vault[];
};

function isTriggered(input: string) {
  const listPattern = /^\s*-\s.*/;
  const bracketPattern = /^tags:\s*\[\s*/;
  return listPattern.test(input) || bracketPattern.test(input);
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
    const currentFilePath = await fn.expand(denops, "%:p") as string;
    const notes: Note[] = [];
    const vaults = await ensureVaults(denops, sourceParams.vaults);
    if (!vaults.some((vault) => isInVault(currentFilePath, vault.path))) {
      return [];
    }
    if (!isTriggered(args.context.input)) {
      return [];
    }
    await Promise.all(vaults.map(async (vault) => {
      notes.push(...await getNotes(vault));
    }));
    const tags = getPropertyTags(notes);
    return tags.map((tag) => ({ word: tag }));
  }

  override params(): Params {
    return {
      vaults: [{ path: "~/obsidian", name: "default" }],
    };
  }
}
