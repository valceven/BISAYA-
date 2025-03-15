import { ParseError } from "../../utils/ParseError";
import { TokenType } from "../../utils/TokenType";
import { Token } from "../LexicalAnalysis/Token";
import { Binary, Unary, Literal, Grouping } from "./expressions";
import { Expression } from "./expressions";

export class Parser {
    tokens: Token[];
    current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): Expression {
        try {
            return this.expression();
        } catch (error: any) {
            return null;
        }
    }

    private expression(): Expression {
        return this.equality();
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
        return this.peek().type === TokenType.EOF;
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
    
        if (this.match(TokenType.OpenParen)) {
            let expr: Expression = this.expression();
            this.consume(TokenType.CloseParen, "Expect ')' after expression.");
            return new Grouping(expr);
        }

        throw this.error(this.peek(), "Expect Expression");
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): ParseError {
        console.error(token, message);
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