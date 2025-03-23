import { TokenType } from "./TokenType";

export const KEYWORDS = new Map<string, TokenType>([
    ["UG", TokenType.UG],
    ["O", TokenType.O],
    ["DILI", TokenType.DILI],
    ["MUGNA", TokenType.MUGNA],
    ["SUGOD", TokenType.SUGOD],
    ["KATAPUSAN", TokenType.KATAPUSAN],
    ["IPAKITA", TokenType.IPAKITA],
    ["DAWAT", TokenType.DAWAT],
    ["KUNG", TokenType.KUNG],
    ["PUNDOK", TokenType.PUNDOK],
    ["KUNGWALA", TokenType.KUNGWALA],
    ["KUNGDILI", TokenType.KUNGDILI],
    ["ALANGSA", TokenType.ALANGSA],
    ["WALA", TokenType.WALA],
    ["NUMERO", TokenType.NUMERO],
    ["TIPIK", TokenType.TIPIK],
    ["LETRA", TokenType.LETRA],
    ["TINOUD", TokenType.TINOUD]
]);
