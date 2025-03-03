import { 
    Statement, 
    Program, 
    Expression, 
    BinaryExpression, 
    NumericLiteral, 
    Identifier 
} from "./ast";
import { Lexer, Token } from "./lexer";
import { TokenType } from "../utils/TokenType";


export default class Parser {

    private tokens: Token[] = [];
    private position: number = 0;

    constructor(sourceCode: string) {
        const lexer = new Lexer(sourceCode);
        this.tokens = lexer.tokenize();
    }

    private peek(): Token {
        return this.tokens[this.position];
    }

    private consume(): Token {
        return this.tokens[this.position++];
    }

    public produceAST(): Program {
        return {
            kind: "Program",
            body: this.parseStatements(),
        }
    }

    private parseStatements(): Statement[] {

        let statements: Statement[] = []

        while(this.peek().type != TokenType.EOF) {
            statements.push(this.parseExpression(this.consume()));
        }

        return statements;
    }

    private parseExpression(token: Token): Expression {
        if (token.type === TokenType.Identifier) {
            return { kind: "Identifier", symbol: token.value } as Identifier;
        }
        if (token.type === TokenType.Number) {
            return { kind: "NumericLiteral", value: Number(token.value) } as NumericLiteral;
        }
        throw new Error("Unexpected token");
    }

}