import { Token } from "../LexicalAnalysis/Token";

export abstract class Expression {}

// Binary expression (e.g., `1 + 2`)
export class Binary extends Expression {
    left: Expression;
    operator: Token;
    right: Expression;

    constructor(left: Expression, operator: Token, right: Expression) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

// Unary expression (e.g., `-5`)
export class Unary extends Expression {
    operator: Token;
    right: Expression;

    constructor(operator: Token, right: Expression) {
        super();
        this.operator = operator;
        this.right = right;
    }
}

// Literal expression (e.g., numbers, strings)
export class Literal extends Expression {
    value: any;

    constructor(value: any) {
        super();
        this.value = value;
    }
}

// Grouping expression (e.g., `(1 + 2)`)
export class Grouping extends Expression {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }
}
