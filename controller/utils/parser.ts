export const convertArrayToString = (array: number[] | string[], maxLength: number): string => {
  const stringArray = array.map((val) => val.toString());
  const commaSeparatedString = stringArray.join(", ");

  if (commaSeparatedString.length <= maxLength) {
    return commaSeparatedString;
  }

  return commaSeparatedString.slice(0, maxLength) + "...";
};

export const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
export type NullToUndefined<T> = {
  [K in keyof T]: T[K] extends null ? undefined : T[K];
};

export function nullToUndefined<T extends Record<string, any>>(obj: T): NullToUndefined<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value]),
  ) as NullToUndefined<T>;
}
