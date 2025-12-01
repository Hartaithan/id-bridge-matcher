import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const defaultDirectory = "result";

interface JSONParams<T> {
  value: T;
  filename: string;
  directory?: string;
}

export const json = <T>(params: JSONParams<T>): void => {
  const { value, filename: fn, directory = defaultDirectory } = params;
  const dir = path.join(process.cwd(), directory);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filename = fn.endsWith(".json") ? fn : `${fn}.json`;
  const filePath = path.join(dir, filename);
  writeFileSync(filePath, JSON.stringify(value, null, 2), "utf-8");
};

interface TextParams {
  value: string;
  filename: string;
  directory?: string;
}

export const text = (params: TextParams): void => {
  const { value, filename: fn, directory = defaultDirectory } = params;
  const dir = path.join(process.cwd(), directory);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filename = fn.endsWith(".txt") ? fn : `${fn}.txt`;
  const filePath = path.join(dir, filename);
  writeFileSync(filePath, value, "utf-8");
};

export const save = {
  json,
  txt: text,
};
