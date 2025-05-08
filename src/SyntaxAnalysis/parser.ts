import { ParseError } from "../../utils/ParseError";
import { TokenType } from "../../utils/TokenType";
import { Token } from "../LexicalAnalysis/Token";
import { Binary, Unary, Literal, Grouping, Expression, Variable, Assign, SpecialValue, Postfix} from "./Expressions";
import { Statement, Print, ExpressionStatement, VariableDeclaration, Block, WhileStatement, DawatStatement, IfElseIfElseStatement, IfStatement } from "./Statements";

export class Parser {
    tokens: Token[];
    current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): Statement[] {
        const statements: Statement[] = [];
    
        if (!this.match(TokenType.SUGOD)) {
            throw this.error(this.peek(), "DAPAT MAGUNA SA SUGOD");
        }
    
        while (!this.check(TokenType.KATAPUSAN) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        
        return statements;
    }
    

    private declaration(): Statement {
        try {
            if (this.match(TokenType.MUGNA)) {
                const typa: Token = this.peek();
                if (
                    typa.type === TokenType.NUMERO ||
                    typa.type === TokenType.LETRA ||
                    typa.type === TokenType.TIPIK ||
                    typa.type === TokenType.TINUOD
                ) {
                    return this.varDeclaration(false);
                }
                throw this.error(typa, "Invalid variable declaration. Please check your types!");
            }
            return this.statement();
        } catch (error) {
            console.error(`Parsing Error at token: ${this.peek().type} (${this.peek().lexeme}), position ${this.current}`);
            throw new Error(`Parsing failed at token ${this.peek().type} with lexeme '${this.peek().lexeme}' at position ${this.current}`);
        }
    }

    private statement(): Statement {

        if (this.match(TokenType.IPAKITA)) return this.printStatement();
        if (this.match(TokenType.SUGOD)) return this.blockStatement();
        if (this.match(TokenType.DAWAT)) return this.dawatStatement();
        if (this.match(TokenType.MUGNA)) return this.varDeclaration(false);
        if (this.match(TokenType.KATAPUSAN)) return this.expressionStatement();
        if (this.match(TokenType.KUNG)) return this.ifStatement();
        if (this.match(TokenType.SAMTANG)) return this.whileStatement();
        if (this.match(TokenType.ALANGSA)) return this.loopStatement();

        return this.expressionStatement();
    }

    private whileStatement(): Statement {
        try {
            this.consume(TokenType.OpenParen, "Expect '(' after 'SAMTANG'.");
        
            const condition: Expression = this.expression();
            
            this.consume(TokenType.CloseParen, "Expect ')' after condition.");
            
            this.consume(TokenType.PUNDOK, "Expect 'PUNDOK' after while condition.");
            this.consume(TokenType.LeftBracket, "Expect '{' after 'PUNDOK'.");
            
            const statements: Statement[] = [];
            while (!this.check(TokenType.RightBracket) && !this.isAtEnd()) {
                statements.push(this.declaration());
            }
            
            this.consume(TokenType.RightBracket, "Expect '}' after block.");
            
            return new WhileStatement(condition, new Block(statements));
        } catch (e) {
            console.error("While loop parsing error:", e);
            throw e;
        }
    }
    

    private loopStatement(): Statement {
        this.consume(TokenType.OpenParen, "Expect '(' after 'ALANG SA'.");
    
        let initializer: Statement | null;
    
        if (this.check(TokenType.MUGNA)) {
            this.advance();
            initializer = this.varDeclaration(true);
        } else if (this.check(TokenType.Identifier) && this.checkNext(TokenType.Assign)) {
            initializer = new ExpressionStatement(this.expression());
        } else if (!this.check(TokenType.Comma)) {
            initializer = new ExpressionStatement(this.expression());
        } else {
            initializer = null;
        }
    
        this.consume(TokenType.Comma, "Expect ',' after loop initializer.");
    
        let condition: Expression | null = null;
        if (!this.check(TokenType.Comma)) {
            condition = this.expression();
        }
        this.consume(TokenType.Comma, "Expect ',' after loop condition.");
    
        let increment: Expression | null = null;
        if (!this.check(TokenType.CloseParen)) {
            increment = this.expression();
        }
        this.consume(TokenType.CloseParen, "Expect ')' after for clauses.");
    
        this.consume(TokenType.PUNDOK, "Expect 'PUNDOK' to start the block.");
    
        let body = this.blockStatement();
    
        if (increment !== null) {
            body = new Block([
                body,
                new ExpressionStatement(increment)
            ]);
        }
    
        if (condition === null) {
            condition = new Literal(true);
        }
    
        body = new WhileStatement(condition, body);
    
        if (initializer !== null) {
            body = new Block([
                initializer,
                body
            ]);
        }
        return body;
    }
    
    private ifStatement(): Statement {
        this.consume(TokenType.OpenParen, "Expect '(' after 'KUNG'.");
        const condition: Expression = this.expression();
        this.consume(TokenType.CloseParen, "Expect ')' after condition.");
    
        this.consume(TokenType.PUNDOK, "Expect 'PUNDOK' to start the block.");
        const thenBranch: Statement = this.blockStatement();
    
        const elseIfBranches: { condition: Expression, block: Statement }[] = [];
        let elseBranch: Statement | null = null;
    
        while (this.match(TokenType.KUNGDILI)) {
            this.consume(TokenType.OpenParen, "Expect '(' after 'KUNG DILI'.");
            const elseifCondition = this.expression();
            this.consume(TokenType.CloseParen, "Expect ')' after condition.");
    
            this.consume(TokenType.PUNDOK, "Expect 'PUNDOK' to start the block.");
            const elseifBlock = this.blockStatement();
    
            elseIfBranches.push({ condition: elseifCondition, block: elseifBlock });
        }
    
        if (this.match(TokenType.KUNGWALA)) {
            this.consume(TokenType.PUNDOK, "Expect 'PUNDOK' to start the else block.");
            elseBranch = this.blockStatement();
        }
    
        return new IfElseIfElseStatement(condition, thenBranch, elseIfBranches, elseBranch);
    }

    
    
    
    
    private printStatement(): Statement {
        const values: Expression[] = [];
        
        do {
            if (this.match(TokenType.LeftBracket)) {
                if (this.match(TokenType.Hash)) {
                    this.consume(TokenType.RightBracket, "Expect ']' to close special value.");
                    values.push(new SpecialValue('#'));
                } else {
                    throw this.error(this.peek(), "Expect '#' inside brackets.");
                }
            } else {
                values.push(this.expression());
            }
        } while (this.match(TokenType.And));         
        return new Print(values);
    }

    private dawatStatement(): Statement {
        const names: Token[] = []
        
        do {
            const name = this.consume(TokenType.Identifier, "Dapat naay identifier human sa dawat.");
            names.push(name);
        } while (this.match(TokenType.Comma));
        

        return new DawatStatement(names);
    }

    private expressionStatement(): Statement {
        const expr: Expression = this.expression();
    
        return new ExpressionStatement(expr);
    }

    private checkNext(type: TokenType): boolean {
        if (this.current + 1 >= this.tokens.length) return false;
        return this.tokens[this.current + 1].type === type;
    }
    

    private varDeclaration(isLoop: boolean): Statement {
        let type: Token | null = null;

        if(!isLoop) {
            type = this.consumes(
                [TokenType.NUMERO, TokenType.LETRA, TokenType.TIPIK, TokenType.TINUOD],
                "Expected type before variable name."
            );
        } else {
           type = new Token(TokenType.NUMERO, "NUMERO", null, this.current)
        }
        
        const declarations: { name: Token; initializer: Expression | null }[] = [];
    
        do {
            const name: Token = this.consume(TokenType.Identifier, "Expect variable name.");
            let initializer: Expression | null = null;
    
            if (this.match(TokenType.Assign)) {
                initializer = this.expression();

                if (initializer instanceof Grouping) {
                    initializer = initializer.expression;
                }
                
                if (initializer instanceof Binary) {
                    const result = this.evaluate(initializer);
                    initializer = new Literal(result);
                }

                if (initializer && !this.isValidInitializer(type, initializer)) {
                    throw this.error(type, `Type mismatch: Expected ${type.lexeme} but got ${initializer.constructor.name}`);
                }

                if (initializer instanceof Literal && typeof initializer.value === 'boolean') {
                    initializer = new Literal(initializer.value);
                }
            }
    
            declarations.push({ name, initializer });
    
        } while (this.match(TokenType.Comma));
    
        return new VariableDeclaration(type, declarations);
    }
    
    private evaluate(expression: Expression): boolean | string | number {
        if (expression instanceof Binary) {
            const leftValue = this.evaluate(expression.left);
            const rightValue = this.evaluate(expression.right);
    
            if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
                switch (expression.operator.lexeme) {
                    case "==":
                        return leftValue === rightValue;
                    case "<>":
                        return leftValue !== rightValue;
                }
            }
    
            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                switch (expression.operator.lexeme) {
                    case '<':
                        return leftValue < rightValue;
                    case '>':
                        return leftValue > rightValue;
                    case '==':
                        return leftValue === rightValue;
                    case '<>':
                        return leftValue !== rightValue;
                    case '+':
                        return leftValue + rightValue;
                    case '-':
                        return leftValue - rightValue;
                    case '*':
                        return leftValue * rightValue;
                    case '/':
                        return leftValue / rightValue;
                }
            }
    
            if (expression.operator.lexeme === '+') {
                if (typeof leftValue === 'string' || typeof rightValue === 'string') {
                    return String(leftValue) + String(rightValue);
                }
            }
        }
    
        if (expression instanceof Literal) {
            return expression.value;
        }
    
        if (expression instanceof Grouping) {
            return this.evaluate(expression.expression);
        }
    
        return false;
    }
    
    
    
    private isValidInitializer(type: Token, initializer: Expression): boolean {
        if (initializer instanceof Literal) {
            const value = initializer.value;

            switch (type.type) {
                case TokenType.NUMERO:
                    return typeof value === "number";
                case TokenType.LETRA:
                    return typeof value === "string";
                case TokenType.TIPIK:
                    return typeof value === "number";
                case TokenType.TINUOD:
                    return typeof value === "boolean";
                default:
                    return false;
            }
        }
    
        return false;
    }

    private or(): Expression {
        let expr: Expression = this.and();

        while (this.match(TokenType.O)) {
            const operator: Token = this.previous();
            const right: Expression = this.and();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private and(): Expression {
        let expr: Expression = this.equality();

        while (this.match(TokenType.UG)) {
            const operator: Token = this.previous();
            const right: Expression = this.equality();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private evaluateLogicalExpression(expr: Binary): any {
        const leftValue = this.evaluate(expr.left);

        if (expr.operator.type === TokenType.O) {
            return leftValue || this.evaluate(expr.right);
        } else {
            if (!this.isTruthy(leftValue)) {
                return leftValue;
            }
        }
        return this.evaluate(expr.right);
    }

    private blockStatement(): Statement {
        if (this.match(TokenType.LeftBracket)) {
            const statements: Statement[] = [];
            while (!this.check(TokenType.RightBracket) && !this.isAtEnd()) {
                statements.push(this.declaration());
            }
            this.consume(TokenType.RightBracket, "Expect '}' after block.");
            return new Block(statements);
        } else if (this.match(TokenType.SUGOD)) {
            const statements: Statement[] = [];
            while (!this.check(TokenType.KATAPUSAN) && !this.isAtEnd()) {
                statements.push(this.declaration());
            }
            this.consume(TokenType.KATAPUSAN, "Expect 'KATAPUSAN' after block.");
            return new Block(statements);
        }
    
        throw this.error(this.peek(), "Expect '{' or 'SUGOD' to start a block.");
    }
    

    private expression(): Expression {
        return this.assignment();
    }

    private assignment(): Expression {
        const expr: Expression = this.equality();

        if (this.match(TokenType.Assign)) {
            const value: Expression = this.assignment();

            if (expr instanceof Variable) {
                const name: Token = (expr).name;
                return new Assign(name, value);
            }

            throw new Error("Invalid assignment target");
        }

        return expr;
    }


    private equality(): Expression {
        let expr: Expression = this.comparison();

        while(this.match(TokenType.NotEqual, TokenType.EqualEqual)) {
            let operator: Token = this.previous();
            let right: Expression = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private match(...types: TokenType[]): boolean {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;

        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.KATAPUSAN;
    }

    private peekNext(inc: number): Token {
        if (this.isAtEnd()) return this.peek();
        return this.tokens[this.current + inc];
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): any {
        return this.tokens[this.current - 1];
    }

    private comparison(): Expression {
       let expr: Expression = this.term();

       while(this.match(TokenType.Greater, TokenType.GreaterEqual, TokenType.Lesser, TokenType.LesserEqual)) {
        let operator: Token = this.previous();
        let right: Expression = this.term();
        expr = new Binary(expr, operator, right);
       }

       return expr;
    }

    private term(): Expression {
        let expr: Expression = this.factor();

        while (this.match(TokenType.Minus, TokenType.Plus)) {
            let operator: Token = this.previous();
            let right: Expression = this.factor();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private factor(): Expression {
        let expr: Expression = this.unary();

        while(this.match(TokenType.Slash, TokenType.Star)) {
            let operator: Token = this.previous();
            let right: Expression = this.unary();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expression {
        if (this.match(TokenType.Bang, TokenType.Minus)) {
            let operator: Token = this.previous();
            let right: Expression = this.unary();
            return new Unary(operator, right);
        }
    
        return this.postfix(); 
    }

    private postfix(): Expression {
        let expr = this.primary();
    
        // Check for one or more postfix operators after the primary expression
        while (this.match(TokenType.PlusPlus)) {
            const operator = this.previous();
            expr = new Postfix(operator, expr);
        }
    
        return expr;
    }
    
    

    private primary(): Expression {

        if (this.match(TokenType.Number, TokenType.String)) {
            return new Literal(this.previous().literal);
        }

    
        if (this.match(TokenType.BOOLEAN)) {
            return new Literal(this.previous().literal);
        }
        
        if (this.match(TokenType.Identifier)) {
            return new Variable(this.previous());
        }
    
        if (this.match(TokenType.TINUOD)) {
            return new Literal(this.previous().literal);
        }
        
        if (this.match(TokenType.OpenParen)) {
            const expr: Expression = this.expression();
            this.consume(TokenType.CloseParen, "Expect ')' after expression.");
            return new Grouping(expr);
        }
    
        if (this.match(TokenType.DOLLAR)) {
            return new Literal("\n");
        }

        if (this.match(TokenType.Whitespace)) {
            return new Literal(this.previous().literal);
        };

        if(this.match(TokenType.ESCAPECODE)){
            let value : string = this.previous().literal

            if(this.isIdentifier(value)){
                return new Variable(new Token(TokenType.Identifier, value, value, this.previous().literal));
            }

            if((value.startsWith("\"") && (value.endsWith("\""))) ||(value.startsWith("\'") && (value.endsWith("\'")))){
                value = value.substring(1, value.length - 1);
                return new Literal(value);
            } 
            return new Literal(this.previous().literal);
        }

        if (this.match(TokenType.And)) {
            return new Literal(this.previous().literal);
        }
        
        throw this.error(this.peek(), "Expect Expression");
    }

    private isIdentifier(value: string): boolean {
        const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        return identifierRegex.test(value);
    }
    
    
    private consumes(types: TokenType[], message: string): Token {
        for (const type of types) {
            if(this.check(type)) {
                return this.advance();
            }
        }
        throw this.error(this.peek(), message);
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) {
            const val = this.advance();
            return val
        }

        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): ParseError {
        console.error(`Error at token: ${token.type} (${token.lexeme}) at position ${this.current} - ${message}`);
        return new ParseError();
    }

    private isTruthy(leftValue: string | number | boolean): boolean {
        return !!leftValue;
    }
}


