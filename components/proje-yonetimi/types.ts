export interface NodeMeta {
  assignee?: string;
  startDate?: string;
  dueDate?: string;
}

export interface DefinitionEntry {
  id: string;
  type: "tanim" | "kisaltma";
  term: string;
  desc: string;
}

export interface NodeContent {
  html?: string;
  form?: Record<string, string>;
  tables?: Record<string, Record<string, string>>;
  meta?: NodeMeta;
}

export type Contents = Record<string, NodeContent | DefinitionEntry[]>;
