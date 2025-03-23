import { Expression } from "./Expressions";
import { Token } from "../LexicalAnalysis/Token";

export abstract class Statement {}

export class Print extends Statement {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }
}

export class ExpressionStatement extends Statement {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }
}

export class VariableDeclaration extends Statement {
    name: Token;
    initializer: Expression | null;

    constructor(name: Token, initializer: Expression | null) {
        super();
        this.name = name;
        this.initializer = initializer;
    }
}

export class Block extends Statement {
    statements: Statement[];

    constructor(statements: Statement[]) {
        super();
        this.statements = statements;
    }
}