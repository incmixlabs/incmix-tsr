import ts from "typescript";

import { Visiter } from "../helpers/types";

export const visitSymbolKeyword: Visiter<ts.KeywordTypeNode> = () => {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createStringLiteral("symbol")
      ),
    ],
    true
  );
};
