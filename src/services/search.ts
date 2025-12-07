import { load } from "cheerio";
import { regionsKeys } from "../constants/region";
import { normalizeQuery } from "../utils/normalize";
import { getID, getPlatforms, getRegion } from "../utils/parse";
import { generateSearchVariants } from "../utils/search";

const messages = {
  "env-not-found": "environment variable is not defined",
  "url-not-found": "url is not defined",
  "search-failed": "failed to search by query: ",
};

interface SearchResult {
  id: string;
  label: string;
  platforms: string[];
  region: string | undefined;
}

interface SearchParams {
  query: string;
  platform: string | undefined;
  region: string | undefined;
}

interface FetchParams {
  query: string;
}

interface FindParams extends SearchParams {
  results: SearchResult[];
}

class Search {
  private readonly url: string;

  constructor() {
    const url = process.env.TARGET_URL;
    if (!url) throw new Error(messages["env-not-found"]);
    this.url = url;
  }

  async search(params: SearchParams): Promise<string | null> {
    const { query, platform, region } = params;
    if (query?.trim().length === 0) return null;

    let id: string | null = null;
    const variants = generateSearchVariants(query);
    for (const variant of variants) {
      const content = await this.fetch({ query: variant });
      const results = this.parse(content);
      id = this.find({ query: variant, platform, region, results });
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

  parse(content: string): SearchResult[] {
    const result: SearchResult[] = [];
    const cheerio = load(content);
    const links = cheerio("a");
    const images = cheerio("img");
    for (let index = 0; index < links.length; index++) {
      const element = links[index];
      const label = cheerio(element).text()?.trim();
      if (!label.startsWith("Jogo: ")) continue;

      const link = cheerio(element).attr("href")?.trim();
      const id = getID(link);
      if (!id) continue;

      const image = cheerio(images?.[index]).attr("src")?.trim();
      const platforms = getPlatforms(image);
      if (platforms.length === 0) continue;

      const region = getRegion(label);

      result.push({ id, label, platforms, region });
    }
    return result;
  }

  find(params: FindParams): string | null {
    const { query, platform, region, results } = params;
    for (const item of results) {
      const labelSearch = normalizeQuery(query || "+++");
      if (!normalizeQuery(item.label).includes(labelSearch)) continue;
      const platformSearch = platform?.toUpperCase() || "+++";
      if (!item.platforms.includes(platformSearch)) continue;
      if (region === "NA" || !region) return item.id;
      if (region && !item.region) continue;
      const regionKey = item?.region ? regionsKeys[item.region] : undefined;
      if (regionKey !== region) continue;
      return item.id;
    }
    return null;
  }
}

export default Search;
