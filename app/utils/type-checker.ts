type ValueType =
  | "null"
  | "array"
  | "object"
  | "function"
  | "string"
  | "number"
  | "boolean"
  | "undefined"
  | "symbol"
  | "bigint";

const getType = (value: unknown): ValueType => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as ValueType;
};
