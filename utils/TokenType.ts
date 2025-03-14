/* 

    lexer def - bsta lexer

    <var-declaration> ::= "MUGNA" <type-name> <identifier-list>

    <type-name> ::= "NUMERO" | "LETRA" | "TINOUD" | "TIPIK"

    <identifier-list> ::= <identifier> | <identifier> "," <identifier-list>

    <identifier> ::= <variable-name> | <variable-name> "=" <expr>

    <variable-name> ::= <letter> { <letter> | <digit> | "_" }

    <expr> ::= <term> | <term> <operator> <expr>

    <term> ::= <number> | <variable-name> | "(" <expr> ")"

    <operator> ::= "+" | "-" | "*" | "/"

    <number> ::= <digit> { <digit> }

    <letter> ::= "a" | "b" | ... | "z" | "A" | "B" | ... | "Z"

    <digit> ::= "0" | "1" | ... | "9"
*/

export enum TokenType {

    //Single Character Tokens.
    OpenParen, CloseParen, Comma, 
    Dot, Minus, Plus, Slash, Star, Modulo,

    // One or two Character Tokens
    Lesser, Greater, LesserEqual, Assign,
    GreaterEqual, EqualEqual, NotEqual,

    // Literals.
    Identifier, String, Number,

    // Keywords.
    UG, O, DILI, MUGNA, SUGOD, KATAPUSAN,
    IPAKITA, DAWAT,
    KUNG, PUNDOK, KUNGWALA, KUNGDILI,
    ALANGSA, WALA, EOF

};
