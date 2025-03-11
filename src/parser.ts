import { 
    Statement, 
    Program, 
    Expression, 
    BinaryExpression, 
    NumericLiteral, 
    Identifier,
    NullLiteral
} from "./ast";
import { Lexer, Token } from "./lexer";
import { TokenType } from "../utils/TokenType";


export default class Parser {

    public tokens: Token[] = [];
    private position: number = 0;

    constructor(sourceCode: string = "") {
        const lexer = new Lexer(sourceCode);
        this.tokens = lexer.tokenize();
    }

    private peek(): Token {
        return this.tokens[this.position];
    }

    private consume(): Token {
        return this.tokens[this.position++];
    }

    private expect(type: TokenType, errorMessage: string): Token{
        const prev = this.consume();
        if(!prev || prev.type !== type) {
            throw new Error(`Parser Error: \n ${errorMessage} ${prev} Expecting: ${type}`);
        }

        return prev;
    }

    public produceAST(): Program {
        return {
            kind: "Program",
            body: this.parseStatements(),
        }
    }

    private parseStatements(): Statement[] {

        let statements: Statement[] = [];

        while(this.peek().type !== TokenType.EOF) {
            statements.push(this.parseExpression());
        }

        return statements;
    }

    private parseExpression(): Expression {
        return this.parseAdditiveExpression();
    }

    // orders of presidence - 
    // assignment
    // member
    // function
    // logical
    // comparison
    // additive, 
    // multiplication, 
    // unary, 
    // primary 


    // 10 + 5 - 5
    private parseAdditiveExpression(): Expression {
        let left = this.parseMultiplicativeExpression();

        while(this.peek().value === "+" || this.peek().value === "-") {
            const operator = this.consume().value;
            const right = this.parseMultiplicativeExpression();
            left = {
                kind: "BinaryExpression",
                left,
                right, 
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    private parseMultiplicativeExpression(): Expression {
        let left = this.parsePrimaryExpression();

        while(this.peek().value === "*" || this.peek().value === "/" || this.peek().value === "%") {
            const operator = this.consume().value;
            const right = this.parsePrimaryExpression();
            left = {
                kind: "BinaryExpression",
                left,
                right, 
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    private parsePrimaryExpression(): Expression {
        const token = this.consume();

        switch (token.type) {
            case TokenType.Wala: {
                this.consume();
                return {
                    kind: "NullLiteral",
                    value: "wala"
                } as NullLiteral;
            }
            case TokenType.Identifier: {
                return { 
                    kind: "Identifier", 
                    symbol: token.value 
                } as Identifier;
            }
            case TokenType.Number: {
                return { 
                    kind: "NumericLiteral", 
                    value: Number(token.value) 
                } as NumericLiteral;
            }
            case TokenType.OpenParen: {
                const value = this.parseExpression();
                this.expect(TokenType.CloseParen, "Expected Closing Parenthesis!");
                return value
            }
                
            default: 
                console.error(`Unexpected token found during parsing! ${this.peek()}`);
        }     
    } 
}

