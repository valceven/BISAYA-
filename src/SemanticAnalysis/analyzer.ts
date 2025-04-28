import { ValueType, RuntimeVal, NumberVal, NullVal } from "../utils/Values"
import { NodeType, ASTNode, Program, NumericLiteral, BinaryExpression } from "./ast"

export class SemanticAnalyzer {

    constructor(ast: Program){
        const result = this.analyzeNode(ast);
        console.log("Analysis Result:", result);
    }

    private analyzeNode(node: any): RuntimeVal {

        switch (node.kind) {
            case "NumericLiteral":
                return { 
                    value: ((node as NumericLiteral).value),
                    type: "number",
                } as NumberVal;
            
            case "NullLiteral": 
                return {
                    value: "wala",
                    type: "wala",
                } as NullVal;

            case "BinaryExpression":
                return this.evaluateBinaryExpression(node as BinaryExpression);

            case "Program":
                return this.evaluateProgram(node as Program);

            default: 
                console.error("Wala pa na impelemnt boss", node);
                return { type: "wala", value: "wala" } as NullVal; // <-- FIXED
        }
        
    }

    private evaluateBinaryExpression(binaryEx: BinaryExpression): RuntimeVal {
        
        const left = this.analyzeNode(binaryEx.left);
        const right = this.analyzeNode(binaryEx.right);

        if (left.type === "number" && right.type === "number") {
            return this.evaluateNumericExpression(left as NumberVal, right as NumberVal, binaryEx.operator);
        }
        
        return { type: "wala", value: "wala" } as NullVal
    }

    private evaluateNumericExpression(left: NumberVal, right: NumberVal, operator: string): NumberVal {

        let num = 0;

        switch(operator) {
            case "+":
                num = left.value + right.value;
                break;
            case "-":
                num = left.value - right.value;
                break;
            case "*":
                num = left.value * right.value;
                break;
            case "/":
                num = left.value / right.value;
                break;
            default:
                num = left.value % right.value;
                break;
        }

        return { value: num, type: "number" }; 
    }

    private evaluateProgram(program: Program): RuntimeVal {
            let lastEvaluated: RuntimeVal = { type: "wala", value: "wala"} as NullVal;

            for (const statement of program.body) {
                lastEvaluated = this.analyzeNode(statement)
            }

        return lastEvaluated;
    }
}