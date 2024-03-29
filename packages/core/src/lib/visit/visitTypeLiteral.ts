import ts, { ObjectLiteralElementLike } from "typescript";

import { mapNodeChildren } from "../helpers/mapNodeChildren";
import { Visiter } from "../helpers/types";
import { visit } from "./visit";

export const visitTypeLiteral: Visiter<ts.TypeLiteralNode> = ({
  node,
  metadata,
  deps,
}) => {
  return ts.factory.createObjectLiteralExpression(
    [
      ...(metadata ?? []),
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createStringLiteral("object")
      ),
      ts.factory.createPropertyAssignment(
        "properties",
        ts.factory.createObjectLiteralExpression(
          mapNodeChildren(node, (n) =>
            visit({ node: n, deps })
          ) as ObjectLiteralElementLike[],
          true
        )
      ),
    ],
    true
  );
};
