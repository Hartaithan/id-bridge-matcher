import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SourceData, SourceDataArray } from "../models/source";
import { save } from "../utils/save";

const messages = {
  "mapping-not-found": "mapping not found",
};

const filenames = {
  mapping: "mapping.json",
  matched: "matched.json",
  unmatched: "unmatched.json",
};

class Mapping {
  private value: Record<string, string> = {};

  constructor() {
    try {
      const path = join(process.cwd(), "result", filenames.mapping);
      const content = readFileSync(path, "utf-8");
      this.value = JSON.parse(content);
    } catch (_error) {
      console.info(messages["mapping-not-found"]);
    }
  }

  has(id: string) {
    return !!this.value?.[id];
  }

  set(id: string, value: string) {
    this.value[id] = value;
  }

  save(data: SourceDataArray) {
    const matched: SourceData["list"] = {};
    const unmatched: SourceData["list"] = {};

    for (let i = 0; i < data.length; i++) {
      const [key, item] = data[i];
      if (this.has(key)) {
        const id = this.value[key];
        matched[id] = item;
      } else {
        unmatched[key] = item;
      }
    }

    save.json({ value: this.value, filename: filenames.mapping });
    save.json({ value: matched, filename: filenames.matched });
    save.json({ value: unmatched, filename: filenames.unmatched });

    return {
      matched: Object.keys(matched).length,
      unmatched: Object.keys(unmatched).length,
    };
  }
}

export default Mapping;
