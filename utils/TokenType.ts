export enum TokenType {
    // Single-character tokens
    OpenParen, CloseParen, Comma, Dot, Plus, Minus, Star, Slash, Modulo,PlusPlus,
    
    // One or two character tokens
    Bang, BangEqual, Assign, EqualEqual, Greater, GreaterEqual,
    Lesser, LesserEqual, NotEqual,
    
    // Literals
    Identifier, String, Number, BOOLEAN,
    
    // Keywords
    UG, O, MUGNA, SUGOD, KATAPUSAN, IPAKITA, DAWAT,
    KUNG, PUNDOK, KUNGWALA, KUNGDILI, ALANGSA, WALA,
    NUMERO, TIPIK, LETRA, TINUOD, Whitespace,
    
    // Special tokens
    EOF, INDENT, DEDENT,

    // New token types
    And,   // For the '&' operator
    DOLLAR,    // For the '$' token
    LeftBracket, // For the '[' token
    RightBracket, // For the ']' token
    Hash,      // For the '#' token
    ESCAPECODE,
}