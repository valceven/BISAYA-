import { Assign, Binary, Expression, Grouping, Literal, Unary, Variable } from "./Expressions";
import { TokenType } from "../../utils/TokenType";
import { Block, DawatStatement, ExpressionStatement, Print, Statement, VariableDeclaration } from "./Statements";
import { Environment } from "../../utils/Environment";
import * as readline from 'readline';



export class Interpreter {

    private environment: Environment = new Environment();
    private rl: readline.Interface;

    constructor(rl: readline.Interface) {
        this.rl = rl;
    }
    
    evaluate(expr: Expression): any {
        if (expr instanceof Literal) {
            return this.evaluateLiteral(expr);
        } else if (expr instanceof Grouping) {
            return this.evaluateGrouping(expr);
        } else if (expr instanceof Binary) {
            return this.evaluateBinary(expr);
        } else if (expr instanceof Unary) {
            return this.evaluateUnary(expr);
        } else if (expr instanceof Variable) {
            return this.evaluateVariable(expr);
        } else if (expr instanceof Assign) {
            return this.evaluateAssign(expr);
        } else {
            throw new Error("Unknown expression type");
        }
    }

    async interpret(statements: Statement[]): Promise<void> {
        try {
            for (const statement of statements) {
                await this.execute(statement);
            }
        } catch (error) {
            if (error instanceof Error) {
                this.runtimeError(error);
            } else {
                throw error;
            }
        }
    }

    private async execute(statement: Statement): Promise<void> {
        if (statement instanceof Print) {
            this.executePrint(statement);
        } else if (statement instanceof DawatStatement) {
            await this.executeDawat(statement);
        } else if (statement instanceof ExpressionStatement) {
            this.executeExpression(statement);
        } else if (statement instanceof VariableDeclaration) {
            this.executeVariableDeclaration(statement);
        } else if (statement instanceof Block) {
            await this.executeBlock(statement.statements, new Environment(this.environment));
        } else {
            throw new Error("Unknown statement type");
        }
    }

    private visitVariableExpression(expression: Variable): any {
        return this.environment.get(expression.name);
    }

    private evaluateAssign(expr: Assign): any {
        const value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    }

    private executePrint(statement: Print): void {
        const values = statement.values.map(expr => this.evaluate(expr));
        const output = values.map(value => this.stringify(value)).join("");
        console.log(output);
    }

    // Modify your executeDawat method to work with the existing readline interface:
    private executeDawat(statement: DawatStatement): Promise<void> {        
        return new Promise((resolve, reject) => {
            // Create a one-time listener for the 'line' event
            const onLine = (line: string) => {
                try {
                    // Remove this listener so it doesn't interfere with future input
                    this.rl.removeListener('line', onLine);
                    
                    const inputString = line.trim();                    
                    const inputValues = inputString.split(/\s+/);
                    
                    if (inputValues.length < statement.names.length) {
                        throw new Error(`Not enough input values. Expected ${statement.names.length}, got ${inputValues.length}.`);
                    }
                    
                    for (let i = 0; i < statement.names.length; i++) {
                        const nameToken = statement.names[i];
                        
                        if (this.environment.contains(nameToken.lexeme)) {
                            const value = this.parseValue(inputValues[i]);
                            this.environment.assign(nameToken, value);
                        } else {
                            throw new Error(`Variable '${nameToken.lexeme}' is not defined.`);
                        }
                    }
                    resolve();
                } catch (error) {
                    console.error(error.message);
                    reject(error);
                }
            };
            
            // Listen for the next line of input
            this.rl.once('line', onLine);
        });
    }
    
    // Make sure this helper method is correctly implemented
    private parseValue(token: string): any {
        // Try to parse as number first
        const numValue = Number(token);
        if (!isNaN(numValue)) {
            return numValue;
        }
        
        // Handle boolean values
        if (token === "OO") return true;
        if (token === "DILI") return false;
        
        // Return as string by default
        return token;
    }

    private scan(input: string): string[] {
        const tokens = input.split(/\s+/);
        return tokens;
    }
    
    private executeExpression(statement: ExpressionStatement): void {
        this.evaluate(statement.expression);
    }
    
    private executeVariableDeclaration(statement: VariableDeclaration): void {
        const value = statement.initializer ? this.evaluate(statement.initializer) : null;
        for (let name of statement.names) {
            this.environment.define(name.lexeme, value);
        }
    }
    
    private async executeBlock(statements: Statement[], environment: Environment): Promise<void> {
        let previous: Environment = this.environment;
        try {
            this.environment = environment;
    
            for (const statement of statements) {
                await this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }

    private evaluateVariable(expr: Variable): any {
        return this.environment.get(expr.name);
    }

    private evaluateLiteral(expr: Literal): any {
        if (typeof expr.value === "string") {
            if (expr.value === "OO") return true; // Convert "OO" to true
            if (expr.value === "DILI") return false; // Convert "DILI" to false
        }
    
        return expr.value;
    }

    private evaluateGrouping(expr: Grouping): any {
        return this.evaluate(expr.expression);
    }

    private evaluateBinary(expr: Binary): any {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.Plus:
                if (typeof left === "string" || typeof right === "string") {
                    return String(left) + String(right);
                }
                return left + right;
            case TokenType.Minus: 
                this.checkNumberOperands(expr.operator.type, left, right);
                return left - right;
            case TokenType.Star: 
                this.checkNumberOperands(expr.operator.type, left, right);
                return left * right;
            case TokenType.Slash:
                if (right === 0) throw new Error("Division by zero");
                this.checkNumberOperands(expr.operator.type, left, right);
                return left / right;
            case TokenType.Greater:
            case TokenType.Lesser:
            case TokenType.GreaterEqual:
            case TokenType.LesserEqual:
                return this.compareValues(expr.operator.type, left, right);
            case TokenType.NotEqual: return !this.isEqual(left, right);
            case TokenType.EqualEqual: return this.isEqual(left, right);
            default: throw new Error(`Unknown operator: ${expr.operator.type}`);
        }
    }

    private evaluateUnary(expr: Unary): any {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.Minus: 
                this.checkNumberOperand(expr.operator.type, right);
                return -right;
            default: throw new Error(`Unknown operator: ${expr.operator.type}`);
        }
    }

    private isTruthy(value: any): boolean {
        if (value === null) return false;
        return Boolean(value);
    }

    private compareValues(operator: TokenType, left: any, right: any): boolean {
        const leftNum = Number(left);
        const rightNum = Number(right);

        if (isNaN(leftNum) || isNaN(rightNum)) {
            throw new Error(`Comparison operator ${operator} requires numeric values.`);
        }

        switch (operator) {
            case TokenType.Greater: return leftNum > rightNum;
            case TokenType.GreaterEqual: return leftNum >= rightNum;
            case TokenType.Lesser: return leftNum < rightNum;
            case TokenType.LesserEqual: return leftNum <= rightNum;
            default: throw new Error(`Unexpected operator: ${operator}`);
        }
    }

    private isEqual(left: any, right: any): boolean {
        return left === right;
    }

    private checkNumberOperand(operator: TokenType, operand: any) {
        if (typeof operand === 'number') return;
        throw new Error("Operand must be a number");
    }

    private checkNumberOperands(operator: TokenType, left: any, right: any) {
        if (typeof left === 'number' && typeof right === 'number') return;
        throw new Error("Operands must be numbers");
    }

    private stringify(value: any): string {
        return value === null ? "nil" : String(value);
    }

    private runtimeError(error: Error): void {
        console.error(`[Runtime Error] ${error.message}`);
    }
}