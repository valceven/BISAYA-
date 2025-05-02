import * as readline from "readline";
import * as fs from "fs"; // ✅ Add filesystem module
import { Lexer } from "./src/LexicalAnalysis/Lexer";
import { Parser } from "./src/SyntaxAnalysis/parser";
import { Expression } from "./src/SyntaxAnalysis/Expressions";
import { Interpreter } from "./src/SyntaxAnalysis/Interpreter";
import { Statement } from "./src/SyntaxAnalysis/Statements";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const interpreter = new Interpreter(rl);

console.log("\nBISAYA++ Repl v0.1 - HEHE");

async function runInput(input: string) {
    try {
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        console.log("Tokens:", tokens); // ✅ Log tokens for debugging  
        const parser = new Parser(tokens);
        const statements: Statement[] = parser.parse();
        await interpreter.interpret(statements);

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

async function repl() {
    rl.question("> ", async (input) => {
        if (!input || input.includes("exit")) {
            console.log("👋 Goodbye!");
            rl.close();
            process.exit(1);
        }

        if (input.startsWith("file ")) {
            const filename = input.substring(5).trim();
            if (!fs.existsSync(filename)) {
                console.error(`❌ File not found: ${filename}`);
                repl();
                return;
            }

            const fileContent = fs.readFileSync(filename, "utf-8");
            await runInput(fileContent);  // await here too
            repl();
            return;
        }

        await runInput(input);  // await here
        repl();
    });
}


repl();
