const romanToArabic: Record<string, string> = {
  I: "1",
  II: "2",
  III: "3",
  IV: "4",
  V: "5",
  VI: "6",
  VII: "7",
  VIII: "8",
  IX: "9",
  X: "10",
  XI: "11",
  XII: "12",
  XIII: "13",
  XIV: "14",
  XV: "15",
};

const arabicToRoman: Record<string, string> = Object.fromEntries(
  Object.entries(romanToArabic).map(([k, v]) => [v, k]),
);

const romanPatterns = Object.keys(romanToArabic).map((roman) => ({
  regex: new RegExp(`\\b${roman}\\b`, "gi"),
  replacement: romanToArabic[roman],
}));

const arabicPatterns = Object.keys(arabicToRoman).map((arabic) => ({
  regex: new RegExp(`\\b${arabic}\\b`, "g"),
  replacement: arabicToRoman[arabic].toLowerCase(),
}));

export const generateSearchVariants = (query: string) => {
  const normalized = query.replace(/\s+/g, " ").trim();
  const variants = new Set<string>([query.toLowerCase(), normalized]);

  for (const { regex, replacement } of romanPatterns) {
    if (regex.test(normalized)) {
      regex.lastIndex = 0;
      variants.add(normalized.replace(regex, replacement));
    }
  }

  for (const { regex, replacement } of arabicPatterns) {
    if (regex.test(normalized)) {
      regex.lastIndex = 0;
      variants.add(normalized.replace(regex, replacement));
    }
  }

  return Array.from(variants);
};
