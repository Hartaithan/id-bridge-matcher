import { readFileSync } from "node:fs";
import { join } from "node:path";
import { save } from "../utils/save";

const messages = {
  "mapping-not-found": "mapping not found",
};

const filename = "mapping.json";

class Mapping {
  private value: Record<string, string> = {};

  constructor() {
    try {
      const path = join(process.cwd(), "result", filename);
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

  save() {
    save.json({ value: this.value, filename });
  }
}

export default Mapping;
