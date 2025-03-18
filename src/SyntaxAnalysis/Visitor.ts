import { Binary, Grouping, Literal, Unary } from "./Expressions";

export interface Visitor<T> {
    visitBinaryExpr(expr: Binary): T;
    visitUnaryExpr(expr: Unary): T;
    visitLiteralExpr(expr: Literal): T;
    visitGroupingExpr(expr: Grouping): T;
}
