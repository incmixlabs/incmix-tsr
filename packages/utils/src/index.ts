import { InvalidLeaf, Reason, TSRObjValidator } from "./lib/helpers";
import { validateArray } from "./lib/validators/validateArray";
import { validateEnum } from "./lib/validators/validateEnum";
import { validateLiteral } from "./lib/validators/validateLiteral";
import { validateObjectOrInterface } from "./lib/validators/validateObjectOrInterface";
import { validatePrimitive } from "./lib/validators/validatePrimitive";
import { validatePropertySignature } from "./lib/validators/validatePropertySignature";
import { validateTuple } from "./lib/validators/validateTuple";
import { validateUnion } from "./lib/validators/validateUnion";
import { validateUniqueSymbol } from "./lib/validators/validateUniqueSymbol";

export type TsRuntimeObjectGeneric = {
  readonly name: string;
  readonly extends: ConcreteTsRuntimeObject;
};

export type GlobalTsRuntimeObjectKeys = {
  readonly generics?: TsRuntimeObjectGeneric[];
  readonly id: string;
  readonly documentation?: string;
};

export type CanBeReadOnly = {
  readonly itemsAreReadOnly: boolean;
} & GlobalTsRuntimeObjectKeys;

export type FunctionTsRuntimeObject = {
  readonly type: "function";
  readonly functionGenerics?: TsRuntimeObjectGeneric[];
  readonly parameters: TupleTsRuntimeObject["items"];
  readonly returns: TsRuntimeObject;
} & GlobalTsRuntimeObjectKeys;

export type InterfaceTsRuntimeObject = {
  readonly type: "interface";
  readonly members: {
    [key: string]: TsRuntimeObject;
  };
} & GlobalTsRuntimeObjectKeys;

export type ObjectTsRuntimeObject = {
  readonly type: "object";
  readonly properties: {
    [key: string]: TsRuntimeObject;
  };
} & GlobalTsRuntimeObjectKeys;

export type ArrayTsRuntimeObject = {
  readonly type: "array";
  readonly items: TsRuntimeObject;
} & CanBeReadOnly &
  GlobalTsRuntimeObjectKeys;

export type TupleTsRuntimeObject = {
  readonly type: "tuple";
  readonly items: (
    | {
        readonly spread: true;
        readonly optional: false;
        readonly tsRuntimeObject: ArrayTsRuntimeObject | TupleTsRuntimeObject;
      }
    | {
        readonly spread: false;
        readonly optional: boolean;
        readonly tsRuntimeObject: TsRuntimeObject;
      }
  )[];
} & CanBeReadOnly &
  GlobalTsRuntimeObjectKeys;

export type NumberLiteralTsRuntimeObject = {
  readonly type: "literal";
  readonly literalType: "number";
  readonly value: number;
} & GlobalTsRuntimeObjectKeys;

export type StringLiteralTsRuntimeObject = {
  readonly type: "literal";
  readonly literalType: "string";
  readonly value: string;
} & GlobalTsRuntimeObjectKeys;

export type BooleanLiteralTsRuntimeObject = {
  readonly type: "literal";
  readonly literalType: "boolean";
  readonly value: boolean;
} & GlobalTsRuntimeObjectKeys;

export type BigIntLiteralTsRuntimeObject = {
  readonly type: "literal";
  readonly literalType: "bigint";
  readonly value: bigint;
} & GlobalTsRuntimeObjectKeys;

export type UniqueSymbolTsRuntimeObject = {
  readonly type: "unique symbol";
  readonly uniqueSymbolTypeId: symbol;
} & GlobalTsRuntimeObjectKeys;

export type NumberTsRuntimeObject = {
  readonly type: "number";
} & GlobalTsRuntimeObjectKeys;

export type StringTsRuntimeObject = {
  readonly type: "string";
} & GlobalTsRuntimeObjectKeys;

export type BooleanTsRuntimeObject = {
  readonly type: "boolean";
} & GlobalTsRuntimeObjectKeys;

export type BigIntTsRuntimeObject = {
  readonly type: "bigint";
} & GlobalTsRuntimeObjectKeys;

export type SymbolTsRuntimeObject = {
  readonly type: "symbol";
} & GlobalTsRuntimeObjectKeys;

export type GenericTsRuntimeObjectValue = {
  readonly type: "generic";
  readonly name: string;
} & GlobalTsRuntimeObjectKeys;

export type EnumTsRuntimeObject = {
  readonly type: "enum";
  readonly enum: object;
} & GlobalTsRuntimeObjectKeys;

export type CustomTsRuntimeObject = {
  readonly type: `$${string}`;
  readonly schema: any;
} & GlobalTsRuntimeObjectKeys;

export type UnionTsRuntimeObject = {
  readonly type: "union";
  readonly members: TsRuntimeObject[];
} & GlobalTsRuntimeObjectKeys;

export type PropertySignatureTsRuntimeObject = {
  readonly type: "propertySignature";
  readonly optional: boolean;
  readonly tsRuntimeObject: TsRuntimeObject;
} & GlobalTsRuntimeObjectKeys;

export type UndefinedTsRuntimeObject = {
  readonly type: "undefined";
} & GlobalTsRuntimeObjectKeys;

export type NullTsRuntimeObject = {
  readonly type: "null";
} & GlobalTsRuntimeObjectKeys;

export type NeverTsRuntimeObject = {
  readonly type: "never";
} & GlobalTsRuntimeObjectKeys;

export type TsRuntimeObject =
  | FunctionTsRuntimeObject
  | ObjectTsRuntimeObject
  | ArrayTsRuntimeObject
  | TupleTsRuntimeObject
  | NumberLiteralTsRuntimeObject
  | StringLiteralTsRuntimeObject
  | BooleanLiteralTsRuntimeObject
  | BigIntLiteralTsRuntimeObject
  | UniqueSymbolTsRuntimeObject
  | NumberTsRuntimeObject
  | StringTsRuntimeObject
  | BooleanTsRuntimeObject
  | BigIntTsRuntimeObject
  | SymbolTsRuntimeObject
  | GenericTsRuntimeObjectValue
  | EnumTsRuntimeObject
  | InterfaceTsRuntimeObject
  | CustomTsRuntimeObject
  | UnionTsRuntimeObject
  | PropertySignatureTsRuntimeObject
  | UndefinedTsRuntimeObject
  | NullTsRuntimeObject
  | NeverTsRuntimeObject;

export type GenericTsRuntimeObject = TsRuntimeObject & {
  generics: TsRuntimeObjectGeneric[];
};

export type ConcreteTsRuntimeObject = TsRuntimeObject & {
  generics: undefined;
};

export const validateTsRuntimeObject: TSRObjValidator = (
  tsRuntimeObject,
  data,
  params
) => {
  const validator: Partial<
    Record<TsRuntimeObject["type"], TSRObjValidator<any>>
  > = {
    literal: validateLiteral,
    number: validatePrimitive,
    string: validatePrimitive,
    boolean: validatePrimitive,
    bigint: validatePrimitive,
    symbol: validatePrimitive,
    "unique symbol": validateUniqueSymbol,
    object: validateObjectOrInterface,
    array: validateArray,
    tuple: validateTuple,
    interface: validateObjectOrInterface,
    enum: validateEnum,
    union: validateUnion,
    propertySignature: validatePropertySignature,
  };

  if (validator[tsRuntimeObject.type])
    return validator[tsRuntimeObject.type]!(tsRuntimeObject, data);
  else if (
    tsRuntimeObject.type.startsWith("$") &&
    typeof tsRuntimeObject.type.slice(1) === "string"
  ) {
    if (!params || !params.customValidator)
      throw new Error("Special TSR objects require a custom validator");
    else if (data === undefined || data === null)
      return new InvalidLeaf(
        tsRuntimeObject.type,
        new Reason(typeof data, data)
      );
    else
      return params.customValidator(
        tsRuntimeObject as CustomTsRuntimeObject & ConcreteTsRuntimeObject,
        data
      );
  } else
    throw new Error(
      `Validation for ${tsRuntimeObject.type} isn't supported yet!`
    );
};

export const validateExtendsTsRuntimeObject = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tsRuntimeObject: ConcreteTsRuntimeObject,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extendsTsRuntimeObject: ConcreteTsRuntimeObject
): boolean => {
  return false;
};

export class TsRuntime<T extends TsRuntimeObject> {
  tsRuntimeObject: T;

  constructor(tsRuntimeObject: T) {
    this.tsRuntimeObject = tsRuntimeObject;
  }

  static fromTsRuntimeObject<T extends TsRuntimeObject>(tsRuntimeObject: T) {
    const generics = tsRuntimeObject.generics;
    if (generics) {
      return new GenericTsRuntime({ ...tsRuntimeObject, generics });
    }

    return new ConcreteTsRuntime({
      ...tsRuntimeObject,
      generics,
    });
  }
}

export class ConcreteTsRuntime<
  T extends ConcreteTsRuntimeObject
> extends TsRuntime<T> {
  validate(data: any) {
    return validateTsRuntimeObject(this.tsRuntimeObject, data);
  }

  validateExtends(tsRuntime: ConcreteTsRuntime<any>) {
    return validateExtendsTsRuntimeObject(
      this.tsRuntimeObject,
      tsRuntime.tsRuntimeObject
    );
  }
}

export class GenericTsRuntime<
  T extends GenericTsRuntimeObject
> extends TsRuntime<T> {
  // TODO: In theory these types don't need any and could be ultra good however, I'm not sure it's worth the time especially right now.
  toConcrete(
    ...filledGenerics: ConcreteTsRuntime<ConcreteTsRuntimeObject>[]
  ): ConcreteTsRuntime<any> {
    // TODO: GET ACTUAL Array of Generics

    if (this.tsRuntimeObject.generics.length !== filledGenerics.length) {
      throw new Error(
        `This GenericTsRuntime requires ${this.tsRuntimeObject.generics.length} generics whereas you provided ${filledGenerics.length}`
      );
    }

    for (let index = 0; index < filledGenerics.length; index++) {
      const generic = this.tsRuntimeObject.generics[index];
      const param = filledGenerics[index];

      if (!new ConcreteTsRuntime(generic.extends).validateExtends(param)) {
        throw new Error(
          `Param at index ${index} doesn't extend the generic at the corresponding index`
        );
      }
    }

    // TODO: I have determined that the input data is valid. Now it is time to search the type and replace the generics!

    return new ConcreteTsRuntime(
      transformTsRuntimeObject({
        tsRuntimeObject: this.tsRuntimeObject,
        shouldApply: (tsr) => tsr.type === "generic",
        transform: (_tsr) => {
          const tsr = _tsr as GenericTsRuntimeObjectValue;
          const genericIndex = this.tsRuntimeObject.generics.findIndex(
            (generic) => {
              return generic.name === tsr.name;
            }
          );
          const genericType = filledGenerics[genericIndex];

          if (!genericType) {
            console.error(`
            You have a generic named ${tsr.name} but no corresponding filler
          `);
            return tsr;
          }

          return genericType.tsRuntimeObject;
        },
      }) as ConcreteTsRuntimeObject
    );
  }
}

export const transformTsRuntimeObject = (params: {
  tsRuntimeObject: TsRuntimeObject;
  shouldApply: (tsr: TsRuntimeObject) => boolean;
  transform: (tsr: TsRuntimeObject) => TsRuntimeObject;
}): TsRuntimeObject => {
  const { tsRuntimeObject, transform, shouldApply } = params;
  const shouldApplyValue = shouldApply(tsRuntimeObject);

  if (shouldApplyValue) {
    return transform(tsRuntimeObject);
  }

  if (tsRuntimeObject.type === "object") {
    const keys = Object.keys(tsRuntimeObject.properties);

    return {
      ...tsRuntimeObject,
      properties: Object.fromEntries(
        keys.map((key) => [
          key,
          transformTsRuntimeObject({
            ...params,
            tsRuntimeObject: tsRuntimeObject.properties[key],
          }),
        ])
      ),
    };
  }

  if (tsRuntimeObject.type === "array") {
    return {
      ...tsRuntimeObject,
      items: transformTsRuntimeObject({
        ...params,
        tsRuntimeObject: tsRuntimeObject.items,
      }),
    };
  }

  if (tsRuntimeObject.type === "tuple") {
    return {
      ...tsRuntimeObject,
      items: tsRuntimeObject.items.map((item) => ({
        ...item,

        // TODO: Figure out how to remove the `as ArrayTsRuntimeObject`
        // TODO: this is actually a potential edge case. If the user were to process arrays and return a non array it would break the fact that this is spread
        tsRuntimeObject: transformTsRuntimeObject({
          shouldApply,
          transform,
          tsRuntimeObject: item.tsRuntimeObject,
        }) as ArrayTsRuntimeObject,
      })),
    };
  }

  // TODO: WRAP ENUMS AND OTHER DATASTRUCTURES

  return tsRuntimeObject;
};
