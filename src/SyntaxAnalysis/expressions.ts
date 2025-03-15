import { Token } from "../LexicalAnalysis/Token";

export abstract class Expression {
    static Literal: any;
    static Grouping: any;
    static Binary: any;
    static Unary: any;
}

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

export class Unary extends Expression {
    operator: Token;
    right: Expression;

    constructor(operator: Token, right: Expression) {
        super();
        this.operator = operator;
        this.right = right;
    } 
}

export class Literal extends Expression {
    value: any;

    constructor(value: any) {
        super();
        this.value = value;
    }
}

export class Grouping extends Expression {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }
}