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

export const capitalizeAll = (str: string) => {
  if (!str) return str;
  const withSpaces = str.replace(/_/g, " ");

  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
