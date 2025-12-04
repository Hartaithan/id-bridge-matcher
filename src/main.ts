import "dotenv/config";
import { Logger } from "./services/logger";
import Mapping from "./services/mapping";
import Matched from "./services/matched";
import Search from "./services/search";
import Source from "./services/source";

let shouldStop = false;

const handleShutdown = (signal: string) => {
  if (shouldStop) return;
  shouldStop = true;
  console.info(`\nreceived signal ${signal}, shutting down...`);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

const run = async () => {
  const logger = new Logger();
  const mapping = new Mapping();
  const matched = new Matched();

  try {
    const source = new Source();
    await source.fetchData();
    const data = source.getArrayData();

    const search = new Search();
    logger.start(data.length, matched);
    for (let i = 0; i < data.length; i++) {
      if (shouldStop) break;
      const [key, item] = data[i];
      const skip = mapping.has(key);
      logger.progress({ index: i, label: item.title, skip });
      if (skip) continue;
      try {
        const id = await search.search({
          query: item.title,
          platform: item.platforms[0],
        });
        if (!id) throw new Error("unmatched");
        mapping.set(key, id);
        matched.set("matched", id, item);
      } catch (error) {
        matched.set("unmatched", key, item);
        logger.error(`${item.title} [${item.platforms}]`, error);
      }
    }
  } catch (error) {
    console.error("error", error);
  } finally {
    logger.complete(matched);
    matched.save("matched");
    matched.save("unmatched");
    mapping.save();
  }
};

if (require.main === module) {
  run();
}

export { run };
