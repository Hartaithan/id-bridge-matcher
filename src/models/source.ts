export interface SourceItem {
  title: string;
  platforms: string[];
  submitter: string;
  note: string;
  trophies: number[];
}

export interface SourceData {
  version: number;
  list: Record<string, SourceItem>;
}
