import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SourceData, SourceItem } from "../models/source";
import { save } from "../utils/save";

type Target = "matched" | "unmatched";

const messages = {
  "matched-not-found": "matched data not found",
  "unmatched-not-found": "unmatched data not found",
};

const filenames: Record<Target, string> = {
  matched: "matched.json",
  unmatched: "unmatched.json",
};

const readFile = (filename: string) => {
  const path = join(process.cwd(), "result", filename);
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
};

class Matched {
  private matched: SourceData["list"] = {};
  private unmatched: SourceData["list"] = {};

  constructor() {
    try {
      this.matched = readFile(filenames.matched);
    } catch (_error) {
      console.info(messages["matched-not-found"]);
    }
    try {
      this.unmatched = readFile(filenames.unmatched);
    } catch (_error) {
      console.info(messages["unmatched-not-found"]);
    }
  }

  set(target: Target, id: string, value: SourceItem) {
    this[target][id] = value;
  }

  save(target: Target) {
    save.json({ value: this[target], filename: filenames[target] });
  }

  count(target: Target) {
    return Object.keys(this[target]).length;
  }
}

export default Matched;
