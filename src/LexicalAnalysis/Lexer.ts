import { KEYWORDS } from "../../utils/Keywords";
import { TokenType } from "../../utils/TokenType";
import { Token } from "./Token";

export class Lexer {
    private sourceCode: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    constructor(sourceCode: string = "") {
        this.sourceCode = sourceCode;
    }

    public tokenize(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));

        return this.tokens;
    }

    private isAtEnd(): boolean {
        return this.current >= this.sourceCode.length;
        
    }

    private scanToken(): void {
        let c = this.advance();
    
        switch (c) {
            case '(': this.addToken(TokenType.OpenParen); break;
            case ')': this.addToken(TokenType.CloseParen); break;
            case ',': this.addToken(TokenType.Comma); break;
            case '.': this.addToken(TokenType.Dot); break;
            case '-': this.addToken(TokenType.Minus); break;
            case '+': this.addToken(TokenType.Plus); break;
            case '*': this.addToken(TokenType.Star); break;
            case '%': this.addToken(TokenType.Modulo); break;

            case '/': 
                if (this.match('/')) {
                    while(this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.Slash);
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

            case ' ':
            case '\t':
            case '\r':
                break;

            case '\n':
                this.line++;
                break;

            case '"':
                this.string(); break;
    

            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier(); 
                }else {
                    console.error(this.line, "Wala ko kibaw ani linyaha bai.");
                }
        }
    }

    private advance(): string {
        return this.sourceCode.charAt(this.current++);
    }

    private addToken(type: TokenType, literal: any = null): void {
        let text: string = this.sourceCode.substring(this.start, this.current);
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

    private string() {
        while(this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            console.error(this.line, "WAKOKIBAW ANI NA STRING BAI");
            return;
        }

        this.advance();

        let value: string = this.sourceCode.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.String, value);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(TokenType.Number, parseFloat(this.sourceCode.substring(this.start, this.current)));
    }

    private identifier() {
        while(this.isAlphaNumeric(this.peek())) this.advance();

        const text: string = this.sourceCode.substring(this.start, this.current);
        const type: TokenType = KEYWORDS.get(text) && TokenType.Identifier;
        
        this.addToken(type);
    }

    private isAlpha(c: string): boolean {
        return /^[a-zA-Z_]$/.test(c);
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }
}
