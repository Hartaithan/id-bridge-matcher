import { load } from "cheerio";

const messages = {
  "env-not-found": "environment variable is not defined",
  "url-not-found": "url is not defined",
  "search-failed": "failed to search by query: ",
};

interface SearchParams {
  query: string;
}

interface ParsedResult {
  label: string;
  link: string | undefined;
}

class Search {
  private readonly url: string;
  private current: string | null = null;

  constructor() {
    const url = process.env.TARGET_URL;
    if (!url) throw new Error(messages["env-not-found"]);
    this.url = url;
  }

  async search(params: SearchParams): Promise<string | null> {
    const { query } = params;
    if (query?.trim().length === 0) return null;
    this.current = query;

    const id: string | null = null;

    const content = await this.fetch(params);
    const parsed = this.parse(content);

    console.info("parsed", parsed);

    return id;
  }

  async fetch(params: SearchParams) {
    const { query } = params;
    try {
      if (!this.url) throw new Error(messages["url-not-found"]);
      const url = `${this.url}/search/${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(messages["search-failed"] + query);
      const content = await response.text();
      return content;
    } catch (_error) {
      throw new Error(messages["search-failed"] + query);
    }
  }

  parse(content: string): ParsedResult[] {
    const result: ParsedResult[] = [];

    const cheerio = load(content);
    const links = cheerio("a");
    links.each((_index, element) => {
      const text = cheerio(element).text();
      const href = cheerio(element).attr("href");
      result.push({ label: text, link: href });
    });

    return result;
  }
}

export default Search;
