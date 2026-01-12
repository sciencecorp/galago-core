interface _IStructValue {
  [key: string]: any;
}

interface _IValue {
  numberValue?: number;
  stringValue?: string;
  boolValue?: boolean;
  structValue?: _IStructValue;
  listValue?: _IListValue;
}

interface _IListValue {
  values: _IValue[];
}

export function buildGoogleStructValue(val: any, _sub: boolean = false): any {
  const typeofVal = typeof val;
  const baseValueTypes: { [key: string]: string } = {
    number: "numberValue",
    string: "stringValue",
    boolean: "boolValue",
  };

  if (Object.keys(baseValueTypes).includes(typeofVal)) {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((valItem: any) => buildGoogleStructValue(valItem, true));
  }

  if (typeofVal === "object") {
    const out: { [key: string]: any } = {};
    Object.keys(val).forEach((field: string) => {
      const fieldValue: any = buildGoogleStructValue(val[field], true);
      out[field] = fieldValue;
    });
    return out;
  }

  // If none of the above conditions are met, throw an error.
  throw new Error("Unsupported type: " + typeofVal);
}
