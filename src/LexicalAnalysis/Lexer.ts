import { KEYWORDS } from "../../utils/Keywords";
import { TokenType } from "../../utils/TokenType";
import { Token } from "./Token";

export class Lexer {
    private sourceCode: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;
    private indentStack: number[] = [0];
    private currentIndent: number = 0;

    constructor(sourceCode: string = "") {
        this.sourceCode = sourceCode;
    }

    public tokenize(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        return this.tokens;
    }

    private isAtEnd(): boolean {
        return this.current >= this.sourceCode.length;
    }

    private scanToken(): void {
        const c = this.advance();
    
        switch (c) {
            case '(': this.addToken(TokenType.OpenParen); break;
            case ')': this.addToken(TokenType.CloseParen); break;
            case ',': this.addToken(TokenType.Comma); break;
            case '.': this.addToken(TokenType.Dot); break;
            case '+': this.addToken(TokenType.Plus); break;
            case '*': this.addToken(TokenType.Star); break;
            case '%': this.addToken(TokenType.Modulo); break;
            case '&': this.addToken(TokenType.And); break;
            case '$': this.addToken(TokenType.DOLLAR); break;
            case '[': this.escapecode();
                    break;
            case ']': this.addToken(TokenType.RightBracket); break;
            case '#': this.addToken(TokenType.Hash); break;
    
            case '-':
                if (this.isDigit(this.peek())) {
                    this.number();
                } else if (this.match('-')) {
                    while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.Minus);
                }
                break;
    
            case '<':
                if (this.match('=')) {
                    this.addToken(TokenType.LesserEqual);
                } else if (this.match('>')) {
                    this.addToken(TokenType.NotEqual);
                } else {
                    this.addToken(TokenType.Lesser);
                }
                break;
    
            case '>':
                if (this.match('=')) {
                    this.addToken(TokenType.GreaterEqual);
                } else {
                    this.addToken(TokenType.Greater);
                }
                break;
    
            case '=':
                if (this.match('=')) {
                    this.addToken(TokenType.EqualEqual);
                } else {
                    this.addToken(TokenType.Assign);
                }
                break;
    
            case '!': this.addToken(TokenType.Bang); break;
    
            case ' ':
            case '\t':
            case '\r':
                break;
    
            case '\n':
                this.line++;
                break;
    
            case '"':
                this.string('"');
                break;
            case "'":
                this.string("'");
                break;
    
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    console.error(`Line ${this.line}: Unexpected character '${c}'.`);
                }
        }
    }

    private escapecode(): void {
        const bracketStart: number = this.current;
        while(this.peek() !== ']' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            console.error(`Line ${this.line}: Unclosed bracket.`);
            return;
        }
        this.advance();

        const value: string = this.sourceCode.substring(bracketStart, this.current - 1);
         
        // if(value.length == 0){

        // }
        console.log(value);

        this.addToken(TokenType.ESCAPECODE, value);

    }

   

    private advance(): string {
        return this.sourceCode.charAt(this.current++);
    }

    private addToken(type: TokenType, literal: any = null): void {
        const text: string = this.sourceCode.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.sourceCode.charAt(this.current) !== expected) return false;

        this.current++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.sourceCode.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.sourceCode.length) return '\0';
        return this.sourceCode.charAt(this.current + 1);
    }

    private string(quote: string): void {
        while (this.peek() !== quote && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            console.error(`Line ${this.line}: Unterminated string.`);
            return;
        }

        this.advance(); // Consume the closing quote

        const value: string = this.sourceCode.substring(this.start + 1, this.current - 1);
        
        // Handle special string literals for boolean values
        if(value === "OO") {
            this.addToken(TokenType.BOOLEAN, true);
            return;
        } else if(value === "DILI") {
            this.addToken(TokenType.BOOLEAN, false);
            return;
        }

        this.addToken(TokenType.String, value);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance(); // Consume the '.'

            while (this.isDigit(this.peek())) this.advance();
        }

        const value = parseFloat(this.sourceCode.substring(this.start, this.current));
        this.addToken(TokenType.Number, value);
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        if (this.peek() === ':') {
            this.advance();
        }

        const text: string = this.sourceCode.substring(this.start, this.current);

        const type: TokenType = KEYWORDS.get(text) || TokenType.Identifier;
        this.addToken(type);
    }

    private isAlpha(c: string): boolean {
        return /^[a-zA-Z_]$/.test(c);
    }

    private isAlphaz(c: string): boolean {
        return /^[a-zA-Z_:]$/.test(c);
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c) || this.isAlphaz(c);
    }

    private handleIndentation(): void {
        let spaces = 0;

        while (this.peek() === ' ') {
            spaces++;
            this.advance();
        }

        if (spaces > this.currentIndent) {
            this.indentStack.push(spaces);
            this.currentIndent = spaces;
            this.addToken(TokenType.INDENT);
        } else {
            while (spaces < this.currentIndent && this.indentStack.length > 1) {
                this.indentStack.pop();
                this.currentIndent = this.indentStack[this.indentStack.length - 1];
                this.addToken(TokenType.DEDENT);
            }
        }
    }
}