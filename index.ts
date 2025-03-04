import * as readline from "readline";
import Parser from "./src/parser";


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

        const parser = new Parser(input);
        const program = parser.produceAST();

        console.log(parser.tokens);
        console.log(program);
        repl();
    });
}

repl();
