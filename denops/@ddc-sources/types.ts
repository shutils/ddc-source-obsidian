import { unknownutil as u } from "./deps.ts";

export const isVault = u.isObjectOf({
  path: u.isString,
  name: u.isString,
});

export const isNote = u.isObjectOf({
  path: u.isString,
  name: u.isString,
  vault: isVault,
  properties: u.isOptionalOf(u.isObjectOf({ ...u.isUnknown })),
});

export type Vault = u.PredicateType<typeof isVault>;

export type Note = u.PredicateType<typeof isNote>;
