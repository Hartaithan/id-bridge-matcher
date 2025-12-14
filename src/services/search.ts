import { load } from "cheerio";
import Fuse, { Expression, IFuseOptions as Options } from "fuse.js";
import { getID, getLabel, getPlatforms, getRegion } from "../utils/parse";
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

const options: Options<SearchResult> = {
  keys: [
    { name: "label", weight: 0.5 },
    { name: "platforms", weight: 0.3 },
    { name: "region", weight: 0.2 },
  ],
  threshold: 0.3,
  distance: 100,
  ignoreLocation: true,
  useExtendedSearch: true,
  includeScore: true,
};

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
      const rawLabel = cheerio(element).text()?.trim();
      if (!rawLabel.startsWith("Jogo: ")) continue;
      const label = getLabel(rawLabel);

      const link = cheerio(element).attr("href")?.trim();
      const id = getID(link);
      if (!id) continue;

      const image = cheerio(images?.[index]).attr("src")?.trim();
      const platforms = getPlatforms(image);
      if (platforms.length === 0) continue;

      const region = getRegion(rawLabel);

      result.push({ id, label, platforms, region });
    }
    return result;
  }

  find(params: FindParams): string | null {
    const { query, platform, region, results: data } = params;

    const fuse = new Fuse(data, options);

    const pattern: Expression = { $and: [] };
    pattern.$and = pattern.$and ?? [];
    if (query) pattern.$and.push({ label: query });
    if (platform) pattern.$and.push({ platforms: `'${platform}` });
    if (region) pattern.$and.push({ region: `'${region}` });

    const results = fuse.search(pattern);
    if (results.length === 0) return null;
    return results[0].item.id;
  }
}

export default Search;
