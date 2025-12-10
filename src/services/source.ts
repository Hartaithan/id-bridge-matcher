import { SourceData, SourceDataArray } from "../models/source";

const messages = {
  "env-not-found": "environment variable is not defined",
  "url-not-found": "url is not defined",
  "fetch-data-failed": "failed to fetch data from source",
  "no-data": "no data available",
};

class Source {
  private readonly url: string;
  private data: SourceData | null = null;

  constructor() {
    const url = process.env.SOURCE_URL;
    if (!url) throw new Error(messages["env-not-found"]);
    this.url = url;
  }

  async fetchData(): Promise<void> {
    try {
      if (!this.url) throw new Error(messages["url-not-found"]);
      const response = await fetch(this.url);
      if (!response.ok) throw new Error(messages["fetch-data-failed"]);
      this.data = (await response.json()) as SourceData;
    } catch (_error) {
      throw new Error(messages["fetch-data-failed"]);
    }
  }

  getData(): SourceData {
    if (!this.data) throw new Error(messages["no-data"]);
    return this.data;
  }

  getArrayData(): SourceDataArray {
    if (!this.data) throw new Error(messages["no-data"]);
    return Object.entries(this.data.list);
  }
}

export default Source;
