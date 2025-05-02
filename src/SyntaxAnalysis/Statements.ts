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

    constructor(names: Token[], ) {
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
    type: Token;
    declarations: { name: Token; initializer: Expression | null }[];

    constructor(type: Token, declarations: { name: Token; initializer: Expression | null }[]) {
        super();
        this.type = type;
        this.declarations = declarations;
    }
}

export class Block extends Statement {
    statements: Statement[];

    constructor(statements: Statement[]) {
        super();
        this.statements = statements;
    }
}

export class IfStatement extends Statement {
    condition: Expression;
    thenBranch: Statement;
    elseBranch: Statement | null;

    constructor(condition: Expression, thenBranch: Statement, elseBranch: Statement | null) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
}

export class IfElseIfElseStatement extends Statement {
    condition: Expression;
    thenBranch: Statement;
    elseIfBranches: { condition: Expression, block: Statement }[];
    elseBranch: Statement | null;

    constructor(
        condition: Expression,
        thenBranch: Statement,
        elseIfBranches: { condition: Expression, block: Statement }[],
        elseBranch: Statement | null
    ) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseIfBranches = elseIfBranches;
        this.elseBranch = elseBranch;
    }
}

export class WhileStatement implements Statement {
    condition: Expression;
    body: Statement;

    constructor(condition: Expression, body: Statement) {
        this.condition = condition;
        this.body = body;
    }
}
