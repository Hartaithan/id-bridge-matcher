import "dotenv/config";
import { SourceData } from "./models/source";
import Search from "./services/search";
import Source from "./services/source";
import { saveToJSON } from "./utils/file";

const run = async () => {
  const result: SourceData["list"] = {};

  try {
    const source = new Source();
    await source.fetchData();
    const data = source.getArrayData();

    const search = new Search();
    for (const [_key, item] of data) {
      const id = await search.search({
        query: item.title,
        platform: item.platforms[0],
      });
      if (id) {
        result[id] = item;
      } else {
        console.info(`id for ${item.title}, ${item.platforms} not found`);
      }
    }
  } catch (error) {
    console.error("error", error);
  } finally {
    saveToJSON({ value: result, filename: "result.json" });
  }
};

if (require.main === module) {
  run();
}

export { run };
