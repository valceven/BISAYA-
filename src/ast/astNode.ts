export type NodeType = 
    "Program" | 
    "NumericLiteral" | 
    "Identifier" | 
    "BinaryExpression" |
    "CallExpression" |
    "UnaryExpression" |
    "FunctionDeclaration";

export interface ASTNode {
    kind: NodeType;
}

export interface Statement extends ASTNode {}

export interface Expression extends Statement {}

