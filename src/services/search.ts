import { load } from "cheerio";
import { normalizeQuery } from "../utils/normalize";
import { generateSearchVariants } from "../utils/search";

const messages = {
  "env-not-found": "environment variable is not defined",
  "url-not-found": "url is not defined",
  "search-failed": "failed to search by query: ",
};

interface ParsedResult {
  label: string;
  link: string | undefined;
  image: string | undefined;
}

interface SearchParams {
  query: string;
  platform: string | undefined;
}

interface FetchParams {
  query: string;
}

interface FindParams extends SearchParams {
  parsed: ParsedResult[];
}

class Search {
  private readonly url: string;

  constructor() {
    const url = process.env.TARGET_URL;
    if (!url) throw new Error(messages["env-not-found"]);
    this.url = url;
  }

  async search(params: SearchParams): Promise<string | null> {
    const { query, platform } = params;
    if (query?.trim().length === 0) return null;

    let id: string | null = null;
    const variants = generateSearchVariants(query);
    for (const variant of variants) {
      const content = await this.fetch({ query: variant });
      const parsed = this.parse(content);
      id = this.find({ query, platform, parsed });
      if (!id) continue;
      break;
    }

    return id;
  }

  async fetch(params: FetchParams) {
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
    const images = cheerio("img");
    links.each((index, element) => {
      const label = cheerio(element).text();
      const link = cheerio(element).attr("href");
      const image = cheerio(images?.[index]).attr("src");
      result.push({ label, link, image });
    });

    return result;
  }

  find(params: FindParams): string | null {
    const { query, platform, parsed } = params;
    let id: string | null = null;
    for (const item of parsed) {
      if (!item.label.includes("Jogo: ")) continue;
      const labelSearch = normalizeQuery(query || "+++");
      if (!normalizeQuery(item.label).includes(labelSearch)) continue;
      const platformSearch = platform?.toLocaleLowerCase() || "+++";
      if (!item.image?.toLocaleLowerCase().includes(platformSearch)) continue;
      const splitted = item.link?.split("/");
      id = splitted?.at(-2) || null;
      if (id) break;
    }
    return id;
  }
}

export default Search;
