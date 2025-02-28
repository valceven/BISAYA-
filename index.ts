import { Lexer } from "./lexer";

const source = "MUGNA NUMERO x = 10, y = 20";
const lexer = new Lexer(source);
const tokens = lexer.tokenize();

for (const token of tokens) {
    console.log(token);
}
