import { Assign, Binary, Expression, Grouping, Literal, Unary, Postfix,Variable } from "./Expressions";
import { TokenType } from "../../utils/TokenType";
import { Block, DawatStatement, ExpressionStatement, IfElseIfElseStatement, IfStatement, Print, Statement, VariableDeclaration, WhileStatement } from "./Statements";
import { Environment } from "../../utils/Environment";
import * as readline from 'readline';
import { Token } from "../LexicalAnalysis/Token";



export class Interpreter {

    private environment: Environment = new Environment();
    private rl: readline.Interface;
    private outputBuffer: string = "";

    constructor(rl: readline.Interface) {
        this.rl = rl;
    }
    
    evaluate (expr: Expression): any {
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
        } else if (expr instanceof Postfix) {
                this.visitPostfix(expr);
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
            await this.executeVariableDeclaration(statement);
        } else if (statement instanceof Block) {
            await this.executeBlock(statement.statements, new Environment(this.environment));
        } else if (statement instanceof IfElseIfElseStatement) {
            this.executeIf(statement);
        } else if (statement instanceof Binary) {
            await this.evaluateBinary(statement);
        } else if (statement instanceof WhileStatement){
            await this.evaluateWhile(statement);
        } else {
            console.error("Unknown statement type:", statement.constructor.name);
            throw new Error("Unknown statement type");
        }
    }

    private visitVariableExpression(expression: Variable): any {
        return this.environment.get(expression.name);
    }

    private async evaluateWhile(statement: WhileStatement): Promise<void> {
        while (this.isTruthy(await this.evaluate(statement.condition))) {
            await this.execute(statement.body);
        }
        return null;
    }


    private evaluateAssign(expr: Assign): any {
        const value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    }

    private executePrint(statement: Print): void {
        const values = statement.values.map(expr => this.evaluate(expr));
        const output = values.map(value => this.stringify(value)).join("");
        this.outputBuffer += output + "\n";
        console.log(output);
    }


    private executeDawat(statement: DawatStatement): Promise<void> {
        return new Promise((resolve, reject) => {
            const online = (line:string) => {
                try {
                    this.rl.removeListener('line',online);
        
                    const inputString = line.trim();
                    const inputValues = inputString.split(/\s+/);
        
                    if (inputValues.length < statement.names.length) {
                        throw new Error("Dawat statement error");
                    }

                    for (let i = 0; i < statement.names.length; i++) {
                        const tokenName = statement.names[i];

                        if (this.environment.contains(tokenName.lexeme)) {
                            const value = this.parseValue(inputValues[i]);
                            this.environment.assign(tokenName, value);
                        } else {
                            throw new Error("Variable not found");
                        }
                    }
                    resolve();
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            };
            this.rl.once('line', online)
        })
    }
    
    private parseValue(token: string): any {
        const numValue = Number(token);
        if (!isNaN(numValue)) {
            return numValue;
        }
        
        if (token === "OO") return true;
        if (token === "DILI") return false;
        
        return token;
    }
    
    private executeExpression(statement: ExpressionStatement): void {
        this.evaluate(statement.expression);
    }
    
    private executeVariableDeclaration(statement: VariableDeclaration): void {
        for (const { name, initializer } of statement.declarations) {
            let value = initializer ? this.evaluate(initializer) : null;
    
            switch (statement.type.lexeme) {
                case "TINUOD":
                    if ((typeof value !== "boolean" && value !== "OO" && value !== "DILI") && value !== null) {
                        throw new Error(`Type mismatch: Expected TINUOD but got ${typeof value}`);
                    }
                    value = value ? "OO" : "DILI";
                    break;
    
                case "NUMERO":
                    if (typeof value !== "number" && value !== null) {
                        throw new Error(`Type mismatch: Expected NUMERO but got ${typeof value}`);
                    }
                    break;
    
                case "LETRA":
                    if (typeof value !== "string" && value !== null) {
                        throw new Error(`Type mismatch: Expected LETRA but got ${typeof value}`);
                    }
                    break;
            }
    
            this.environment.define(name.lexeme, value);
        }
    }

    
    private async executeIf(statement: IfElseIfElseStatement): Promise<void> {
        const condition = await this.evaluate(statement.condition);
        if (condition != "DILI") {
            await this.execute(statement.thenBranch);
            return;
        }
    
        for (const branch of statement.elseIfBranches) {
            const elseifCondition = await this.evaluate(branch.condition);
            if (elseifCondition != "DILI") {
                await this.execute(branch.block);
                return;
            }
        }
    
        if (statement.elseBranch !== null) {
            await this.execute(statement.elseBranch);
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
            if (expr.value === "OO") return true;  // Convert "OO" to true
            if (expr.value === "DILI") return false;  // Convert "DILI" to false
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
                const comparisonResult = this.compareValues(expr.operator.type, left, right);
                return comparisonResult ? "OO" : "DILI";

            case TokenType.NotEqual: return !this.isEqual(left, right) ? "OO" : "DILI";
            case TokenType.EqualEqual: return this.isEqual(left, right) ? "OO" : "DILI";

            case TokenType.UG:
                return (this.isTruthy(left) && this.isTruthy(right)) ? "OO" : "DILI";

            case TokenType.O:
                return (this.isTruthy(left) || this.isTruthy(right)) ? "OO" : "DILI";
            default: throw new Error(`Unknown operator: ${expr.operator.type}`);
        }
    }

    private isTruthy(value: any): boolean {
        if (value === null) return false;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value === "OO";
        return Boolean(value);
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

    visitPostfix(expr: Postfix): any {
        const operand = expr.operand;
    
        if (!(operand instanceof Variable)) {
            throw new Error("Invalid postfix target. Must be a variable.");
        }

        const variableOperand = operand as Variable;
        const value = this.evaluate(variableOperand);
    
        if (typeof value !== "number") {
            throw new Error("Can only increment/decrement numbers.");
        }
    
        const newValue = expr.operator.lexeme === '++' ? value + 1 : value - 1;
    
        this.environment.assign(operand.name, newValue);
    
        return value;
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
        if (typeof value === 'boolean') {
            return value ? "OO" : "DILI";
        } else if (value === null) {
            return "nil";
        } else if (value === ' ') {
            return ""; 
        } else {
            return String(value);
        }
    }
    

    private runtimeError(error: Error): void {
        console.error(`[Runtime Error] ${error.message}`);
    }
}