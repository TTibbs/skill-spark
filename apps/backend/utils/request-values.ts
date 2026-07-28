type RequestValues = Record<string, unknown>;

export const getStringValue = (
  values: RequestValues,
  key: string
): string | undefined => {
  const value = values[key];
  return typeof value === "string" ? value : undefined;
};

export const getNumericId = (
  values: RequestValues,
  key: string
): number | undefined => {
  const value = getStringValue(values, key);
  if (value === undefined) return undefined;

  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};
