import { Binary, Expression, Grouping, Literal, Unary } from "./Expressions";
import { TokenType } from "../../utils/TokenType";

export class Interpreter {
    evaluate(expr: Expression): any {
        if (expr instanceof Literal) {
            return this.evaluateLiteral(expr);
        } else if (expr instanceof Grouping) {
            return this.evaluateGrouping(expr);
        } else if (expr instanceof Binary) {
            return this.evaluateBinary(expr);
        } else if (expr instanceof Unary) {
            return this.evaluateUnary(expr);
        } else {
            throw new Error("Unknown expression type");
        }
    }

    interpret(expr: Expression): void {
        try {
            const value = this.evaluate(expr);
            console.log(this.stringify(value));
        } catch (error) {
            if (error instanceof Error) {
                this.runtimeError(error);
            } else {
                throw error;
            }
        }
    }

    private evaluateLiteral(expr: Literal): any {
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