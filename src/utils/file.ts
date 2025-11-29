import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

interface JSONParams<T> {
  value: T;
  filename: string;
  directory?: string;
}

export const saveToJSON = <T>(params: JSONParams<T>): void => {
  const { value, filename, directory = "dist" } = params;
  const distDir = path.join(process.cwd(), directory);
  if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
  const filePath = path.join(distDir, filename);
  const data = JSON.stringify(value, null, 2);
  writeFileSync(filePath, data, "utf-8");
};
