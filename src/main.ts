import "dotenv/config";
import { SourceDataArray } from "./models/source";
import { Logger } from "./services/logger";
import Mapping from "./services/mapping";
import Search from "./services/search";
import Source from "./services/source";
import { hasAsianChars } from "./utils/title";

let stop = false;

const handleShutdown = (signal: string) => {
  if (stop) return;
  stop = true;
  console.info(`\nreceived signal ${signal}, shutting down...`);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

const run = async () => {
  const logger = new Logger();
  const mapping = new Mapping();
  let data: SourceDataArray = [];

  try {
    const source = new Source();
    await source.fetchData();
    data = source.getArrayData();

    const search = new Search();
    logger.start(data.length);
    for (let i = 0; i < data.length; i++) {
      if (stop) break;
      const [key, item] = data[i];
      if (hasAsianChars(item.title)) {
        logger.error(`${item.title} | asian characters not supported`);
        continue;
      }
      const skip = mapping.has(key);
      logger.progress({ index: i, label: item.title, skip });
      if (skip) continue;
      try {
        const id = await search.search({
          query: item.title,
          platform: item.platforms[0],
          region: item?.region,
        });
        if (!id) throw new Error("unmatched");
        mapping.set(key, id);
      } catch (error) {
        logger.error(`${item.title} [${item.platforms}]`, error);
      }
    }
  } catch (error) {
    console.error("error", error);
  } finally {
    const { matched } = mapping.save(data);
    logger.complete(matched);
  }
};

if (require.main === module) {
  run();
}

export { run };
