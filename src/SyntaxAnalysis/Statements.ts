import { Expression } from "./Expressions";
import { Token } from "../LexicalAnalysis/Token";

export abstract class Statement {}

export class Print extends Statement {
    constructor(public values: Expression[]) {
        super();
    }
}

export class DawatStatement extends Statement {
    names: Token[];

    constructor(names: Token[]) {
        super();
        this.names = names;
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
    names: Token[];
    type: Token;
    initializer: Expression | null;

    constructor(names: Token[], type: Token, initializer: Expression | null) {
        super();
        this.names = names;
        this.type = type;
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