import * as readline from "readline";
import { Lexer } from "./src/LexicalAnalysis/Lexer";
import { Parser } from "./src/SyntaxAnalysis/Parser";
import { Expression } from "./src/SyntaxAnalysis/Expressions";
import { Interpreter } from "./src/SyntaxAnalysis/Interpreter";
import { Statement } from "./src/SyntaxAnalysis/Statements";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\nBISAYA++ Repl v0.1 - HEHE");

const interpreter = new Interpreter();

function repl() {
    rl.question("> ", (input) => {
        if (!input || input.includes("exit")) {
            console.log("👋 Goodbye!");
            rl.close();
            process.exit(1);
        }

        try {
            const lexer = new Lexer(input);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const statements: Statement[] = parser.parse();

            // console.log("Tokens:", tokens);
            // console.log("AST:", statements);

            interpreter.interpret(statements);
            
        } catch (error) {
            console.error("Error:", error.message);
        }

        repl();
    });
}

repl();