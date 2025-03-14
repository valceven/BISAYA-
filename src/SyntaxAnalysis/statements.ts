import { Statement } from "./astNode";

export interface Program extends Statement {
    kind: "Program";
    body: Statement[]
}