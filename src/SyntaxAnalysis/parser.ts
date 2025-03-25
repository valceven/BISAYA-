import { ParseError } from "../../utils/ParseError";
import { TokenType } from "../../utils/TokenType";
import { Token } from "../LexicalAnalysis/Token";
import { Binary, Unary, Literal, Grouping, Expression, Variable, Assign} from "./Expressions";
import { Statement, Print, ExpressionStatement, VariableDeclaration, Block } from "./Statements";

export class Parser {
    tokens: Token[];
    current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): Statement[] {
        const statements: Statement[] = []
        
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    private declaration(): Statement {
        try {
            if (this.match(TokenType.MUGNA)) return this.varDeclaration();
            return this.statement();
        } catch (error) {
            console.error(`Parsing Error at token: ${this.peek().type} (${this.peek().lexeme}), position ${this.current}`);
            throw new Error(`Parsing failed at token ${this.peek().type} with lexeme '${this.peek().lexeme}' at position ${this.current}`);
        }
    }

    private statement(): Statement {
        if (this.match(TokenType.IPAKITA)) return this.printStatement();
        if (this.match(TokenType.SUGOD)) return this.blockStatement();

        return this.expressionStatement();
    }

    private printStatement(): Statement {
        const value: Expression = this.expression();
        //this.consume(TokenType.NEWLINE, "Expect '\n' after expression");

        return new Print(value);
    }

    private expressionStatement(): Statement {
        const expr: Expression = this.expression();
        //this.consume(TokenType.NEWLINE, "Expect '\n' after expression");
    
        return new ExpressionStatement(expr);
    }

    private varDeclaration(): Statement {
        const type: Token = this.consumes(
            [TokenType.NUMERO, TokenType.LETRA, TokenType.TIPIK, TokenType.TINOUD],
            "Expected type before variable name."
        );

        let names: Token[] = []; 

        do {
            names.push(this.consume(TokenType.Identifier, "Expect variable name."))
        } while (this.match(TokenType.Comma));
        
        let initializer: Expression | null = null;
        if (this.match(TokenType.Assign)) {
            initializer = this.expression();
        }

        //this.consume(TokenType.NEWLINE, "Expected '\n' after variable declaration.");
        return new VariableDeclaration(names, type, initializer);
    }

    private blockStatement(): Statement {
        const statements: Statement[] = [];

        while(!this.check(TokenType.KATAPUSAN) && !this.isAtEnd()) {
            statements.push(this.statement());
        }

        this.consume(TokenType.KATAPUSAN, "Expected 'KATAPUSAN' after block");
        return new Block(statements);
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

        return this.primary();
    }

    private primary(): Expression {
        if (this.match(TokenType.DILI)) return new Literal(false);
        if (this.match(TokenType.NAA)) return new Literal(true);
        if (this.match(TokenType.WALA)) return new Literal(null);
    
        if (this.match(TokenType.Number, TokenType.String)) {
            return new Literal(this.previous().literal);
        }

        if (this.match(TokenType.Identifier)) {
            return new Variable(this.previous());
        }
    
        if (this.match(TokenType.OpenParen)) {
            let expr: Expression = this.expression();
            this.consume(TokenType.CloseParen, "Expect ')' after expression.");
            return new Grouping(expr);
        }

        throw this.error(this.peek(), "Expect Expression");
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
            console.log(val);
            return val
        }

        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): ParseError {
        console.error(`Error at token: ${token.type} (${token.lexeme}) at position ${this.current} - ${message}`);
        return new ParseError();
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.NEWLINE) return;

            switch(this.peek().type) {
                case TokenType.MUGNA:
                case TokenType.SUGOD:
                case TokenType.KATAPUSAN:
                case TokenType.IPAKITA:
                case TokenType.DAWAT:
                case TokenType.PUNDOK:
                case TokenType.KUNG:
                case TokenType.KUNGWALA:
                case TokenType.KUNGDILI:
                case TokenType.ALANGSA:
                    return;
            }

            this.advance();
        }
    }
}