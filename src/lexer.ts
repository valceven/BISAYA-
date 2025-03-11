import { TokenType } from "../utils/TokenType";

const RESERVED_KEYWORDS = ["NUMERO", "LETRA", "TIPIK", "TINOUD", "WALA"];

export interface Token {
    value: string,
    type: TokenType;
}

export class Lexer {
    private input: string;
    private position: number = 0;
    private tokens: Token[] = [];

    constructor(input: string = "") {
        this.input = input;
    }

    public setInput(input: string) {
        this.input = input;
        this.position = 0;
    }

    public tokenize() : Token[] {
        while(this.position < this.input.length) {
            const char = this.input[this.position];

            // regex for whitespace
            if (/\s/.test(char)) {
                this.position++;
                continue;
            }

            // check for comma
            if (char === ",") {
                this.tokens.push({ type: TokenType.Comma, value: ","});
                this.position++;
                continue;
            }

            if (char === "=") {
                this.tokens.push({ type: TokenType.Assign, value: "="});
                this.position++;
                continue;
            }

            if (char === "(") {
                this.tokens.push({ type: TokenType.OpenParen, value: "(" });
                this.position++;
                continue;
            }

            if (char === ")") {
                this.tokens.push({ type: TokenType.CloseParen, value: ")" });
                this.position++;
                continue;
            }

            if (/[a-zA-Z]/.test(char)) {
                let identifier = "";
                while (this.position < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.position])) {
                    identifier += this.input[this.position];
                    this.position++;
                }
                
                if (identifier === "MUGNA") {
                    this.tokens.push({ type: TokenType.Mugna, value: identifier });
                } else if (RESERVED_KEYWORDS.indexOf(identifier) !== -1) {
                    this.tokens.push({ type: TokenType.TypeName, value: identifier });
                } else {
                    this.tokens.push({ type: TokenType.Identifier, value: identifier });
                }
                continue;
            }

            // regex for digits [0-9]
            if (/\d/.test(char)) {
                let number = "";
                while(this.position < this.input.length && /\d/.test(this.input[this.position])) {
                    number += this.input[this.position];
                    this.position++;
                }

                this.tokens.push({ type: TokenType.Number, value: number});
                continue;
            }

            if ("+-*/%".indexOf(char) !== -1) {
                this.tokens.push({ type: TokenType.Operator, value: char});
                this.position++;
                continue
            }

            throw new Error(`Wa ko kibaw unsa ni bai sorry kaayo! ${char}`);

        }

        this.tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
        return this.tokens;
    }
}