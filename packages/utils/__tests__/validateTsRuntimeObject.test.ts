import {
  ArrayTsRuntimeObject,
  BigIntLiteralTsRuntimeObject,
  BigIntTsRuntimeObject,
  BooleanLiteralTsRuntimeObject,
  BooleanTsRuntimeObject,
  ConcreteTsRuntimeObject,
  CustomTsRuntimeObject,
  EnumTsRuntimeObject,
  GlobalTsRuntimeObjectKeys,
  InterfaceTsRuntimeObject,
  NumberLiteralTsRuntimeObject,
  NumberTsRuntimeObject,
  PropertySignatureTsRuntimeObject,
  StringLiteralTsRuntimeObject,
  StringTsRuntimeObject,
  SymbolTsRuntimeObject,
  TsRuntimeObject,
  TupleTsRuntimeObject,
  UnionTsRuntimeObject,
  UniqueSymbolTsRuntimeObject,
  validateTsRuntimeObject,
} from "../src";
import { InvalidLeaf, Reason, Valid, ValidityTree } from "../src/lib/helpers";

const VALIDATE_TSROBJ_TEST_ID = "test_id";

const invalidTest = (
  TSRObj: ConcreteTsRuntimeObject,
  data: any,
  expectedValue?: any
) => {
  const receivedObj = validateTsRuntimeObject(TSRObj, data);
  const expectedObj = new InvalidLeaf(
    TSRObj.type,
    new Reason(typeof data, data, expectedValue)
  );

  expect(receivedObj.valid).toBe(expectedObj.valid);
  if (!receivedObj.valid) {
    expect((receivedObj as InvalidLeaf).expectedType).toBe(
      expectedObj.expectedType
    );

    expect((receivedObj as InvalidLeaf).reason.receivedType).toBe(
      expectedObj.reason.receivedType
    );
    expect((receivedObj as InvalidLeaf).reason.receivedValue).toBe(
      expectedObj.reason.receivedValue
    );
    expect((receivedObj as InvalidLeaf).reason.expectedValue).toBe(
      expectedObj.reason.expectedValue
    );
  }
};

describe(validateTsRuntimeObject, () => {
  const GlobalTSRObj = {
    id: VALIDATE_TSROBJ_TEST_ID,
    generics: undefined,
    documentation: undefined,
  } as ConcreteTsRuntimeObject;
  type ConcreteTSR<T extends GlobalTsRuntimeObjectKeys> =
    ConcreteTsRuntimeObject & T;

  /*** Primitive tests ***/
  it("Validate data of type number", () => {
    const TSRObj: ConcreteTSR<NumberTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "number",
    };
    expect(validateTsRuntimeObject(TSRObj, 1)).toBeInstanceOf(Valid);
    invalidTest(TSRObj, "");
    invalidTest(TSRObj, undefined);
    invalidTest(TSRObj, null);
  });

  it("Validate data of type string", () => {
    const TSRObj: ConcreteTSR<StringTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "string",
    };

    expect(validateTsRuntimeObject(TSRObj, "text").valid).toBe(true);
    invalidTest(TSRObj, 1);
    invalidTest(TSRObj, undefined);
    invalidTest(TSRObj, null);
  });

  it("Validate data of type boolean", () => {
    const TSRObj: ConcreteTSR<BooleanTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "boolean",
    };

    expect(validateTsRuntimeObject(TSRObj, true)).toBeInstanceOf(Valid);
    expect(validateTsRuntimeObject(TSRObj, false)).toBeInstanceOf(Valid);
    invalidTest(TSRObj, "");
    invalidTest(TSRObj, undefined);
    invalidTest(TSRObj, null);
  });

  it("Validate data of type bigint", () => {
    const TSRObj: ConcreteTSR<BigIntTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "bigint",
    };

    expect(validateTsRuntimeObject(TSRObj, BigInt(1))).toBeInstanceOf(Valid);
    invalidTest(TSRObj, "");
    invalidTest(TSRObj, undefined);
    invalidTest(TSRObj, null);
  });

  it("Validate data of type symbol", () => {
    const TSRObj: ConcreteTSR<SymbolTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "symbol",
    };

    expect(validateTsRuntimeObject(TSRObj, Symbol(1))).toBeInstanceOf(Valid);
    invalidTest(TSRObj, "");
    invalidTest(TSRObj, undefined);
    invalidTest(TSRObj, null);
  });

  it("Validate data of type unique symbol", () => {
    const sym = Symbol("s");
    const sym1 = Symbol("s");
    const TSRObj: ConcreteTSR<UniqueSymbolTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "unique symbol",
      uniqueSymbolTypeId: sym,
    };

    expect(validateTsRuntimeObject(TSRObj, sym)).toBeInstanceOf(Valid);
    invalidTest(TSRObj, sym1, sym);
    invalidTest(TSRObj, undefined, sym);
    invalidTest(TSRObj, null, sym);
  });

  /*** Primitive literal tests ***/
  it("Validate data of type number literal", () => {
    const TSRObj: ConcreteTSR<NumberLiteralTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "literal",
      literalType: "number",
      value: 5,
    };

    expect(validateTsRuntimeObject(TSRObj, 5)).toBeInstanceOf(Valid);
    invalidTest(TSRObj, 1, 5);

    invalidTest(TSRObj, undefined, 5);
    invalidTest(TSRObj, null, 5);
  });

  it("Validate data of type string literal", () => {
    const TSRObj: ConcreteTSR<StringLiteralTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "literal",
      literalType: "string",
      value: "text",
    };

    expect(validateTsRuntimeObject(TSRObj, "text")).toBeInstanceOf(Valid);
    invalidTest(TSRObj, "other text", "text");

    invalidTest(TSRObj, undefined, "text");
    invalidTest(TSRObj, null, "text");
  });

  it("Validate data of type boolean literal", () => {
    const TSRObj: ConcreteTSR<BooleanLiteralTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "literal",
      literalType: "boolean",
      value: true,
    };

    expect(validateTsRuntimeObject(TSRObj, true)).toBeInstanceOf(Valid);
    invalidTest(TSRObj, false, true);

    invalidTest(TSRObj, undefined, true);
    invalidTest(TSRObj, null, true);
  });

  it("Validate data of type bigint literal", () => {
    const TSRObj: ConcreteTSR<BigIntLiteralTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "literal",
      literalType: "bigint",
      value: BigInt(5),
    };

    expect(validateTsRuntimeObject(TSRObj, BigInt(5))).toBeInstanceOf(Valid);
    invalidTest(TSRObj, BigInt(1), BigInt(5));

    invalidTest(TSRObj, undefined, BigInt(5));
    invalidTest(TSRObj, null, BigInt(5));
  });

  /*** List tests ***/
  it("Validate data of type array", () => {
    const TSRObj: ConcreteTSR<ArrayTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "array",
      items: {
        ...GlobalTSRObj,
        type: "string",
      },
      itemsAreReadOnly: false,
    };

    expect(validateTsRuntimeObject(TSRObj, ["text", "text"])).toBeInstanceOf(
      Valid
    );
    expect(validateTsRuntimeObject(TSRObj, [])).toBeInstanceOf(Valid);
    expect(validateTsRuntimeObject(TSRObj, ["text", 5]).valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  it("Validate data of type tuple - spread true: array", () => {
    type spreadTrue = {
      readonly spread: true;
      readonly optional: false;
      readonly tsRuntimeObject: ArrayTsRuntimeObject | TupleTsRuntimeObject;
    };
    const ArrayTSRObj: (type: string) => ConcreteTSR<ArrayTsRuntimeObject> = (
      type
    ) => {
      return {
        ...GlobalTSRObj,
        type: "array",
        items: {
          ...GlobalTSRObj,
          type,
        },
        itemsAreReadOnly: false,
      } as ConcreteTSR<ArrayTsRuntimeObject>;
    };

    const itemsSpreadTrue: (type: string) => spreadTrue = (type) => {
      return {
        spread: true,
        optional: false,
        tsRuntimeObject: ArrayTSRObj(type),
      };
    };

    const TSRObj: ConcreteTSR<TupleTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "tuple",
      items: [
        itemsSpreadTrue("string"),
        itemsSpreadTrue("number"),
        itemsSpreadTrue("boolean"),
      ],
      itemsAreReadOnly: false,
    };

    expect(
      validateTsRuntimeObject(TSRObj, [
        ["name", "age", "yes"],
        [2, 12, 3],
        [true, false],
      ] as [string[], number[], boolean[]])
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj, [["name"], 2, [true]] as [any, any, any])
        .valid
    ).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, [["name"]]).valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  it("Validate data of type tuple - spread true: tuple", () => {
    type spreadTrue = {
      readonly spread: true;
      readonly optional: false;
      readonly tsRuntimeObject: ArrayTsRuntimeObject | TupleTsRuntimeObject;
    };

    const TupleTSRObj: (
      types: string[]
    ) => ConcreteTSR<TupleTsRuntimeObject> = (types) => {
      return {
        ...GlobalTSRObj,
        type: "tuple",
        items: types.map((type) => {
          return {
            ...GlobalTSRObj,
            spread: false,
            optional: false,
            tsRuntimeObject: {
              ...GlobalTSRObj,
              type,
            },
          };
        }),
        itemsAreReadOnly: false,
      } as ConcreteTSR<TupleTsRuntimeObject>;
    };

    const itemsSpreadTrue: (types: string[]) => spreadTrue = (types) => {
      return {
        spread: true,
        optional: false,
        tsRuntimeObject: TupleTSRObj(types),
      };
    };

    const TSRObj: ConcreteTSR<TupleTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "tuple",
      items: [
        itemsSpreadTrue(["string", "boolean"]),
        itemsSpreadTrue(["number"]),
      ],
      itemsAreReadOnly: false,
    };

    expect(
      validateTsRuntimeObject(TSRObj, [["name", true], [2]] as [
        [string, boolean],
        [number]
      ])
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj, [[true], [2]] as [[boolean], [number]])
        .valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj, [["name", true], [""]]).valid
    ).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, "").valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  it("Validate data of type tuple - spread false", () => {
    type spreadFalse = {
      readonly spread: false;
      readonly optional: boolean;
      readonly tsRuntimeObject: TsRuntimeObject;
    };

    const tupleItems: (types: string[]) => spreadFalse[] = (types) =>
      types.map((type) => {
        return {
          spread: false,
          optional: false,
          tsRuntimeObject: {
            ...GlobalTSRObj,
            type,
          },
        } as spreadFalse;
      }) as spreadFalse[];

    const TSRObj: ConcreteTSR<TupleTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "tuple",
      items: tupleItems(["string", "number", "boolean"]),
      itemsAreReadOnly: false,
    };

    expect(
      validateTsRuntimeObject(TSRObj, ["name", 2, true] as [
        string,
        number,
        boolean
      ])
    ).toBeInstanceOf(Valid);
    expect(validateTsRuntimeObject(TSRObj, ["name", 2]).valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  /*** Object tests ***/
  it("Validate data of type object", () => {
    const TSRObj: ConcreteTSR<TsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "object",
      properties: {
        name: {
          ...GlobalTSRObj,
          type: "string",
        },
        details: {
          ...GlobalTSRObj,
          type: "object",
          properties: {
            age: {
              ...GlobalTSRObj,
              type: "number",
            },
          },
        },
      },
    };

    expect(
      validateTsRuntimeObject(TSRObj, {
        name: "Lorem ipsum",
        details: { age: 1 },
      })
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj, { name: "Lorem ipsum", details: {} })
        .valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj, { name: "Lorem ipsum", details: "" })
        .valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj, { name: "Lorem ipsum" }).valid
    ).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, {}).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, "").valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  it("Validate data of type enum", () => {
    enum Enum {
      A,
    }

    const TSRObj: ConcreteTSR<EnumTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "enum",
      enum: Enum,
    };

    // todo: determine how enums are stored on the front-end for validation
    expect(validateTsRuntimeObject(TSRObj, "A")).toBeInstanceOf(Valid);
    expect(validateTsRuntimeObject(TSRObj, "B").valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  it("Validate data of type interface", () => {
    const Person = {
      age: 5,
      isAdult: false,
      name: "jerry",
    };

    const Dog = {
      age: 5,
      name: "Henry VIII",
    };

    const TSRObj: ConcreteTSR<InterfaceTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "interface",
      members: {
        name: {
          ...GlobalTSRObj,
          type: "string",
        },
        age: {
          ...GlobalTSRObj,
          type: "number",
        },
        isAdult: {
          ...GlobalTSRObj,
          type: "boolean",
        },
      },
    };

    expect(validateTsRuntimeObject(TSRObj, Person)).toBeInstanceOf(Valid);
    expect(validateTsRuntimeObject(TSRObj, Dog).valid).toBeFalsy();

    expect(validateTsRuntimeObject(TSRObj, undefined).valid).toBeFalsy();
    expect(validateTsRuntimeObject(TSRObj, null).valid).toBeFalsy();
  });

  it("Validate data of type union", () => {
    const TSRObj: (
      types: ("string" | "number" | "boolean")[]
    ) => ConcreteTSR<UnionTsRuntimeObject> = (types) => {
      return {
        ...GlobalTSRObj,
        type: "union",
        members: types.map((type) => {
          return {
            ...GlobalTSRObj,
            type,
          } as TsRuntimeObject;
        }),
      };
    };

    expect(
      validateTsRuntimeObject(TSRObj(["string", "number"]), 2)
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj(["string", "number"]), "text")
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj(["boolean", "number"]), "text").valid
    ).toBeFalsy();

    expect(
      validateTsRuntimeObject(TSRObj(["boolean"]), undefined).valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj(["boolean"]), null).valid
    ).toBeFalsy();
  });

  it("Validate data of type property signature", () => {
    const TSRObj: (
      type: "string" | "number" | "boolean" | "object",
      optional: boolean
    ) => ConcreteTSR<PropertySignatureTsRuntimeObject> = (type, optional) => {
      return {
        ...GlobalTSRObj,
        type: "propertySignature",
        optional,
        tsRuntimeObject: {
          ...GlobalTSRObj,
          type,
        } as TsRuntimeObject,
      };
    };

    expect(
      validateTsRuntimeObject(TSRObj("string", false), "test")
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj("string", true), undefined)
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj("boolean", false), false)
    ).toBeInstanceOf(Valid);
    expect(
      validateTsRuntimeObject(TSRObj("string", false), undefined).valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj("string", false), null).valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj("string", false), 1).valid
    ).toBeFalsy();
  });

  it("Validate custom TSR objects", () => {
    const a = {
      name: "john",
      age: 15,
    };

    const b = {
      name: true,
      height: 130,
    };

    function customValidator(
      CustomTSRObj: ConcreteTSR<CustomTsRuntimeObject>,
      data: any
    ): ValidityTree {
      if (CustomTSRObj.type === "$object" && typeof data === "object") {
        data = data as object;
        if (
          typeof data["name"] === CustomTSRObj.schema["name"] &&
          typeof data["age"] === CustomTSRObj.schema["age"]
        ) {
          return new Valid();
        } else {
          return new InvalidLeaf(
            CustomTSRObj.type,
            new Reason("undefined", undefined)
          );
        }
      } else
        return new InvalidLeaf(
          CustomTSRObj.type,
          new Reason("undefined", undefined)
        );
    }

    const TSRObj: ConcreteTSR<CustomTsRuntimeObject> = {
      ...GlobalTSRObj,
      type: "$object",
      schema: { name: "string", age: "number" },
    };

    expect(
      validateTsRuntimeObject(TSRObj, a, { customValidator }).valid
    ).toBeTruthy();
    expect(
      validateTsRuntimeObject(TSRObj, b, { customValidator }).valid
    ).toBeFalsy();

    expect(
      validateTsRuntimeObject(TSRObj, undefined, { customValidator }).valid
    ).toBeFalsy();
    expect(
      validateTsRuntimeObject(TSRObj, null, { customValidator }).valid
    ).toBeFalsy();
  });

  test.todo(
    'Augment "object" tests so that they validate the correctness of invalid' +
      "stack traces produced by validateTSRObject - instead of solely validating invalid" +
      "stack traces (which is what is currently done)"
  );
});
