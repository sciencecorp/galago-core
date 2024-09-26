
export class ParserHelper {

  convertArrayToString(array: number[] | string[], maxLength: number): string {
    const stringArray = array.map((val) => val.toString());
    const commaSeparatedString = stringArray.join(", ");

    if (commaSeparatedString.length <= maxLength) {
      return commaSeparatedString;
    }

    return commaSeparatedString.slice(0, maxLength) + "...";
  }

}
