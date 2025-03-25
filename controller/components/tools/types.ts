type Field = {
  name: string;
  type: "text" | "number" | "text_array" | "boolean";
  defaultValue?: any;
};

type Command = {
  [command: string]: Field[];
};

type CommandFields = {
  [tool: string]: Command;
};

type CommandStatus = {
  [commandName: string]: "idle" | "success" | "error";
};

type FieldType = "text" | "number" | "text_array" | "boolean" | Field[];
