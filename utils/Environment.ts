import { Token } from "../src/LexicalAnalysis/Token";

export class Environment {
    enclosing: Environment;
    private values: Map<string, any> = new Map();

    constructor(enclosing: Environment | null = null) {
        this.enclosing = enclosing;
    }

    define(name: string, value: any) : void {
        this.values.set(name, value);
    }

    get(name: Token): any {
        if(this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }

        if (this.enclosing !== null) return this.enclosing.get(name);

        throw new Error("Undefined variable");
    }

    assign(name: Token, value: any): void {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }

        if(this.enclosing !== null) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new Error(`Undefined variable '${name.lexeme}'.`);
    }
}