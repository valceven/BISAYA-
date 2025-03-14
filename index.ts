import * as readline from "readline";
import { Token } from "./src/LexicalAnalysis/Token";
import { Lexer } from "./src/LexicalAnalysis/Lexer";
// import Parser from "./src/parser";
// import { SemanticAnalyzer } from "./src/analyzer";


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
            // const parser = new Parser(input);
            // const program = parser.produceAST();

            // console.log(parser.tokens);
            // console.log(program);

            // const analyzer = new SemanticAnalyzer(program);

            const lexer = new Lexer(input);
            const tokens = lexer.tokenize();

            console.log(tokens);
            
        } catch (error) {
            console.error("Error:", error.message);
        }

        repl();
    });
}

repl();