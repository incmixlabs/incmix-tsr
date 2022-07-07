import ts from "typescript";
import { mapNodeChildren } from "../helpers/mapNodeChildren";
import { Visiter } from "../helpers/types";
import { visit } from "./visit";

export const visitIntersectionType: Visiter<ts.IntersectionTypeNode> = (
  node, metadata
) => {
  return ts.factory.createObjectLiteralExpression(
    [
      ...(metadata ?? []),
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createStringLiteral("intersection")
      ),
      ts.factory.createPropertyAssignment(
        "values",
        ts.factory.createArrayLiteralExpression(
          mapNodeChildren(node, visit) as ts.Expression[],
          true
        )
      ),
    ],
    true
  );
};