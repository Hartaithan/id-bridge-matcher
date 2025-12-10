export interface SourceItem {
  title: string;
  platforms: string[];
  submitter: string;
  note: string;
  trophies: number[];
  region?: string;
}

export interface SourceData {
  version: number;
  list: Record<string, SourceItem>;
}

export type SourceDataArray = [string, SourceItem][];
