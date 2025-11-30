import "dotenv/config";
import { SourceData } from "./models/source";
import { Logger } from "./services/logger";
import Search from "./services/search";
import Source from "./services/source";
import { saveToJSON } from "./utils/file";

const run = async () => {
  const logger = new Logger();
  const matched: SourceData["list"] = {};
  const unmatched: SourceData["list"] = {};

  try {
    const source = new Source();
    await source.fetchData();
    const data = source.getArrayData();

    const search = new Search();
    logger.start(data.length);
    for (let i = 0; i < data.length; i++) {
      const [key, item] = data[i];
      logger.progress(i, item.title);
      try {
        const id = await search.search({
          query: item.title,
          platform: item.platforms[0],
        });
        if (!id) throw new Error("unmatched");
        matched[id] = item;
      } catch (error) {
        unmatched[key] = item;
        logger.error(`${item.title} [${item.platforms}]`, error);
      }
    }
  } catch (error) {
    console.error("error", error);
  } finally {
    logger.complete(Object.keys(matched).length);
    saveToJSON({ value: matched, filename: "matched.json" });
    saveToJSON({ value: unmatched, filename: "unmatched.json" });
  }
};

if (require.main === module) {
  run();
}

export { run };
