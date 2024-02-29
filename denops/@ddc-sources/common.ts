import { front_matter, path, unknownutil as u } from "./deps.ts";

import { isNote, Note } from "./types.ts";

export async function getProperties(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  try {
    return front_matter.extract(content).attrs;
  } catch {
    return {};
  }
}

export async function getNotes(vault: string) {
  const result = new Deno.Command("rg", {
    args: ["--files", vault, "--glob", "**/*\\.md"],
  });
  const { success, stdout } = result.outputSync();
  if (!success) {
    return [];
  } else {
    const notes: Note[] = [];
    const notePaths = new TextDecoder().decode(stdout)
      .split("\n")
      .filter((line) => line.length > 0);
    await Promise.all(notePaths.map(async (notePath) => {
      const name = path.parse(notePath).name;
      const properties = await getProperties(notePath);
      const note: Note = {
        path: notePath,
        name,
        vault,
        properties,
      };
      notes.push(note);
    }));
    return notes;
  }
}

export function getPropertyTags(notes: Note[]): string[] {
  const tags = new Set<string>();
  notes.forEach((note) => {
    if (isNote(note)) {
      if (
        u.isObjectOf({ tags: u.isArrayOf(u.isString), ...u.isUnknown })(
          note.properties,
        )
      ) {
        note.properties.tags.forEach((tag) => tags.add(tag));
      }
    }
  });
  return Array.from(tags);
}

export function isInVault(filePath: string, vault: string) {
  const common = path.common([filePath, vault]);
  return vault == common || vault + path.SEPARATOR == common;
}
