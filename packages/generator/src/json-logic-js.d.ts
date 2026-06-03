declare module "json-logic-js" {
  interface JsonLogic {
    apply(logic: object, data?: Record<string, unknown>): unknown;
    add_operation(name: string, fn: (...args: unknown[]) => unknown): void;
  }
  const jsonLogic: JsonLogic;
  export default jsonLogic;
}
