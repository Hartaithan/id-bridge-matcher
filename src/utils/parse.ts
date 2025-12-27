import { regionMap } from "../constants/region";

export const getLabel = (value: string) => {
  if (!value) return value;
  return value
    .replace(/^Jogo:\s*/i, "")
    .replace(/\[.*?\]/g, "")
    .trim();
};

export const getID = (value: string | undefined): string | null => {
  if (!value) return null;
  const splitted = value.split("/");
  if (splitted.length !== 4) return null;
  return splitted?.at(-2) || null;
};

export const getPlatforms = (value: string | undefined): string[] => {
  if (!value) return [];
  const splitted = value.split("img/img");
  if (splitted.length !== 2) return [];
  const cleaned = splitted[1].slice(0, -4).toUpperCase();
  const result = cleaned.split("_");
  if (result.length === 0) return [];
  return result;
};

export const getRegion = (
  value: string | undefined,
  empty: string = "ANY",
): string => {
  if (!value) return empty;
  const match = value.match(/\[([A-Za-z]{3,4})\]/i);
  if (!match) return empty;
  const raw = match[1].toUpperCase();
  return raw ? regionMap?.[raw] : empty;
};
