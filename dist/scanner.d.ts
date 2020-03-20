interface Observable<T, K> {
    on(event: T, fn: K, options?: boolean | AddEventListenerOptions): any;
}
declare type Subscriber = (data: any) => {};
export declare enum ScannerEvent {
    start = "start",
    error = "error",
    success = "success"
}
export declare enum ScannerMode {
    mdlp = "mdlp"
}
export declare class Scanner implements Observable<ScannerEvent, Subscriber> {
    private domNode;
    private dirty;
    private buffer;
    private parser;
    constructor(domNode: HTMLInputElement, mode: ScannerMode);
    on(event: ScannerEvent | string, fn: Subscriber, options?: boolean | AddEventListenerOptions): Scanner;
    private listen;
    private clear;
}
export {};
