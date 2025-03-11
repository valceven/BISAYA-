import * as readline from "readline";
import Parser from "./src/parser";
import { SemanticAnalyzer } from "./src/analyzer";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\nBISAYA++ Repl v0.1 - HEHE");

function repl() {
    rl.question("> ", (input) => {
        if (!input || input.includes("exit")) {
            console.log("👋 Goodbye!");
            rl.close();
            process.exit(1);
        }

        try {
            const parser = new Parser(input);
            const program = parser.produceAST();

            console.log(parser.tokens);
            console.log(program);

            const analyzer = new SemanticAnalyzer(program);
            
        } catch (error) {
            console.error("Error:", error.message);
        }

        repl();
    });
}

repl();