import "dotenv/config";
import Source from "./services/source";

const run = async () => {
  try {
    const source = new Source();
    await source.fetchData();
    const data = source.getData();
    console.info("data", data);
  } catch (error) {
    console.error("error", error);
  }
};

if (require.main === module) {
  run();
}

export { run };
