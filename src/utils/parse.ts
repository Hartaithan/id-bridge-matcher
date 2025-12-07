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

export const getRegion = (value: string | undefined): string | undefined => {
  if (!value) return;
  const match = value.match(/\[([A-Z]{3,4})\]/);
  return match?.[1];
};
