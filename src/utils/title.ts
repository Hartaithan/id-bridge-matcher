const asianChar =
  /[\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;

export const hasAsianChars = (value: string) => {
  if (asianChar.test(value)) return true;
  return false;
};
