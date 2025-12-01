import "dotenv/config";
import { SourceData } from "./models/source";
import { Logger } from "./services/logger";
import Search from "./services/search";
import Source from "./services/source";
import { save } from "./utils/save";

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
  const matched: SourceData["list"] = {};
  const unmatched: SourceData["list"] = {};

  try {
    const source = new Source();
    await source.fetchData();
    const data = source.getArrayData();

    const search = new Search();
    logger.start(data.length);
    for (let i = 0; i < data.length; i++) {
      if (shouldStop) break;
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
    save.json({ value: matched, filename: "matched" });
    save.json({ value: unmatched, filename: "unmatched" });
  }
};

if (require.main === module) {
  run();
}

export { run };
