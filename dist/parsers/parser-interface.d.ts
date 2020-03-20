export declare enum KeyboardChar {
    BracketRight = "]"
}
export declare enum Keyboard {
    Enter = "Enter",
    BracketRight = "BracketRight"
}
export interface ParserInterface<T> {
    handle(buffer: string[]): T;
}
