import * as prettier from "prettier";

import { getFullFilePath, transform } from "../src";
import { Id } from "../src/deps/Id";
import { Failable } from "../src/Failable";
import { setupTestDir, wrapInTestDir, writeTest } from "./helpers/testFileIO";

const TEST_ID_GENERATED = "the-id-is-here";

const testId: Id = {
  generateId() {
    return TEST_ID_GENERATED;
  },
};

const format = (code: string) =>
  prettier.format(code, { parser: "typescript" });

const basicTypeCheck = (name: string) => {
  genericTypeChecker({
    name: name,
    input: `export type Type = ${name};`,
    output: `export const Type_$TSR = { id: "${TEST_ID_GENERATED}", type: "${name}" } as const;`,
    prependTsCode: false,
  });
};

const genericTypeChecker = ({
  name,
  input,
  output,
  prependTsCode,
}: {
  name: string;
  input: string;
  output: string;
  prependTsCode: boolean;
}) => {
  it(`Properly handles the ${name} type`, () => {
    const filename = wrapInTestDir(`${name}.tsr.ts`);
    writeTest(filename, input);

    const transformResult = transform(
      {
        filename: getFullFilePath(filename),
        outputFilename: `${filename}.output.ts`,
        prependTsCode,
      },
      { id: testId }
    );

    expect(transformResult.type).toBe("success");
    const transformSuccess = transformResult as Failable.Success<string>;

    expect(format(transformSuccess.value.trim())).toBe(format(output));
  });
};

const basicTypeRefCheck = (name: string) => {
  genericTypeChecker({
    name: `Type Reference Primitive - ${name}`,
    input: `type A = ${name};\nexport type B = A`,
    output: `export const B_$TSR = { id: "${TEST_ID_GENERATED}", type: "${name}" } as const;`,
    prependTsCode: false,
  });
};

const basicTypeRefLiteralCheck = (name: string, literal: string) => {
  genericTypeChecker({
    name: `Type Reference Primitive Literal - ${name} ${literal}`,
    input: `type A = ${literal};\nexport type B = A`,
    output: `export const B_$TSR = { id: "${TEST_ID_GENERATED}", type: "literal", typeLiteral: "${name}", value: ${literal} } as const;`,
    prependTsCode: false,
  });
};

const runTests = () => {
  /*** Visitor Tests ***/
  basicTypeCheck("string");
  basicTypeCheck("number");
  basicTypeCheck("unknown");
  basicTypeCheck("any");
  basicTypeCheck("boolean");
  genericTypeChecker({
    name: "undefined",
    input: `export type T = undefined;`,
    output: `export const T_$TSR = {\n id: "${TEST_ID_GENERATED}",\n type: "undefined",\n} as const;`,
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "null",
    input: `export type T = null;`,
    output: `export const T_$TSR = {\n id: "${TEST_ID_GENERATED}",\n type: "null",\n} as const;`,
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "enum",
    input: `export enum Enum {A, B = 2}`,
    output: `export const Enum_$TSR = {\n id: "${TEST_ID_GENERATED}",\n type: "enum",\n enum: Enum, } as const;`,
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "optional - false",
    input: `export type T = {T: number};`,
    output:
      "export const T_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {\n" +
      "        T: {\n" +
      '            type: "propertySignature",\n' +
      "            optional: false,\n" +
      `            tsRuntimeObject: { id: "${TEST_ID_GENERATED}", type: "number" }\n` +
      "        }\n" +
      "    }\n" +
      "} as const;",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "optional - true",
    input: `export type T = {T?: number};`,
    output:
      "export const T_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {\n" +
      "        T: {\n" +
      '            type: "propertySignature",\n' +
      "            optional: true,\n" +
      "            tsRuntimeObject: {\n" +
      `                id: "${TEST_ID_GENERATED}",\n` +
      '                type: "union",\n' +
      "                members: [\n" +
      `                    { id: "${TEST_ID_GENERATED}", type: "number" },\n` +
      "                    {\n" +
      `                        id: "${TEST_ID_GENERATED}",\n` +
      '                        type: "undefined"\n' +
      "                    }\n" +
      "                ]\n" +
      "            }\n" +
      "        }\n" +
      "    }\n" +
      "} as const;\n",
    prependTsCode: false,
  });

  genericTypeChecker({
    name: "prepend - true",
    input: `export type X = 1;`,
    output:
      "export type X = 1;\n" +
      "export const X_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "literal",\n' +
      '    typeLiteral: "number",\n' +
      "    value: 1\n" +
      "} as const;",
    prependTsCode: true,
  });
  genericTypeChecker({
    name: "prepend - false",
    input: `export type X = 1;`,
    output:
      "export const X_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '        type: "literal",\n' +
      '        typeLiteral: "number",\n' +
      "        value: 1\n" +
      "    } as const;",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "unique symbol",
    input: `export type UniqueSymbol = { readonly A: unique symbol; }`,
    output:
      "export const UniqueSymbol_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {\n" +
      "        A: {\n" +
      '            type: "propertySignature",\n' +
      "            optional: false,\n" +
      "            tsRuntimeObject: {\n" +
      `                id: "${TEST_ID_GENERATED}",\n` +
      '                type: "unique symbol",\n' +
      "                uniqueSymbolTypeId: Symbol()\n" +
      "            }\n" +
      "        }\n" +
      "    }\n" +
      "} as const;\n",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "readonly tuple",
    input:
      "export type ReadOnlyTuple = {\n" + "    A: readonly [string];\n" + "};",
    output:
      "export const ReadOnlyTuple_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {\n" +
      "        A: {\n" +
      '            type: "propertySignature",\n' +
      "            optional: false,\n" +
      "            tsRuntimeObject: {\n" +
      `                id: "${TEST_ID_GENERATED}",\n` +
      '                type: "tuple",\n' +
      "                items: [\n" +
      "                    {\n" +
      "                        spread: false,\n" +
      "                        optional: false,\n" +
      `                        tsRuntimeObject: { id: "${TEST_ID_GENERATED}", type: "string" }\n` +
      "                    }\n" +
      "                ],\n" +
      "                itemsAreReadOnly: true\n" +
      "            }\n" +
      "        }\n" +
      "    }\n" +
      "} as const;",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "readonly array",
    input:
      "export type ReadOnlyArray = {\n" + "    A: readonly string[];\n" + "};",
    output:
      "export const ReadOnlyArray_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {\n" +
      "        A: {\n" +
      '            type: "propertySignature",\n' +
      "            optional: false,\n" +
      "            tsRuntimeObject: {\n" +
      `                id: "${TEST_ID_GENERATED}",\n` +
      '                type: "array",\n' +
      `                items: { id: "${TEST_ID_GENERATED}", type: "string" },\n` +
      "                itemsAreReadOnly: true\n" +
      "            }\n" +
      "        }\n" +
      "    }\n" +
      "} as const;",
    prependTsCode: false,
  });

  /*** Resolver Tests ***/
  basicTypeRefCheck("any");
  basicTypeRefCheck("unknown");
  basicTypeRefCheck("string");
  basicTypeRefCheck("number");
  basicTypeRefCheck("boolean");
  basicTypeRefLiteralCheck("string", '"text"');
  basicTypeRefLiteralCheck("number", "5");
  basicTypeRefLiteralCheck("boolean", "true");
  genericTypeChecker({
    name: "Type Reference - union",
    input: `type A = number | string;\nexport type T = A;`,
    output:
      `export const T_$TSR = {\n id: "${TEST_ID_GENERATED}",\n` +
      ' type: "union",\n members: [\n' +
      ` { id: "${TEST_ID_GENERATED}", type: "string" },\n` +
      ` { id: "${TEST_ID_GENERATED}", type: "number" },\n],\n} as const;`,
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "Type Reference - intersection",
    input: `type A = {} & {a: ""};\nexport type T = A;`,
    output:
      "export const T_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {\n" +
      "        a: {\n" +
      '            type: "propertySignature",\n' +
      "            optional: false,\n" +
      "            tsRuntimeObject: {\n" +
      `                id: "${TEST_ID_GENERATED}",\n` +
      '                type: "literal",\n' +
      '                typeLiteral: "string",\n' +
      '                value: ""\n' +
      "            }\n" +
      "        }\n" +
      "    }\n" +
      "} as const;",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "Type Reference - anonymous object",
    input: `type A = {};\nexport type T = A;`,
    output:
      "export const T_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "object",\n' +
      "    properties: {}\n" +
      "} as const;",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "Type Reference - typeof",
    input: `let A: string;\nexport type T = typeof A;`,
    output: `export const T_$TSR = { id: "${TEST_ID_GENERATED}", type: "string" } as const;`,
    prependTsCode: false,
  });

  genericTypeChecker({
    name: "JSDoc prepend",
    input: `\n/**\n * Comment\n */\nexport type T = 1;`,
    output:
      "/**\n" +
      " * Comment */\n" +
      "export const T_$TSR = {\n" +
      `    id: "${TEST_ID_GENERATED}",\n` +
      '    type: "literal",\n' +
      '    typeLiteral: "number",\n' +
      "    value: 1\n" +
      "} as const;",
    prependTsCode: false,
  });

  /*** Exclusion tests */
  genericTypeChecker({
    name: "exclusion - if statement",
    input: "if (true) {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - try-catch statement",
    input: "try {} catch (e) { }",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - throw statement",
    input: "throw {};",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - switch statement",
    input: "switch (0) {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - var statement",
    input: "var a;",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - let statement",
    input: "let a;",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - const statement",
    input: "const a = 0;",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - function",
    input: "function f() {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "inclusion - class",
    input: "class C {}",
    output: "class C {}",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - while",
    input: "while (true) {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - do-while",
    input: "do {} while (true);",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - for",
    input: "for (;;) {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - for-of",
    input: "for (let a of []) {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - for-in",
    input: "for (let a in []) {}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - block",
    input: "{}",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - debugger",
    input: "debugger;",
    output: "",
    prependTsCode: false,
  });
  genericTypeChecker({
    name: "exclusion - with",
    input: "with ({}) {}",
    output: "",
    prependTsCode: false,
  });
};

describe(transform, () => {
  setupTestDir();
  runTests();
  // teardownTestDir(); TODO include this
});
