import { Token } from "../src/LexicalAnalysis/Token";

export class Environment {
    private values: Map<string, any> = new Map();

    define(name: string, value: any) : void {
        this.values.set(name, value);
    }

    get(name: Token): any {
        if(this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }

        throw new Error("Undefined variable");
    }

    assign(name: Token, value: any): void {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }
        throw new Error(`Undefined variable '${name.lexeme}'.`);
    }
}