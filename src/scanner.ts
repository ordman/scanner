import {KeyboardChar, ParserInterface} from "./parsers/parser-interface";
import {ScannerEvent} from "./types";
import 'custom-event-polyfill';

interface Observable<T, K, Z> {
    on(event: T, fn: K, options?: boolean | AddEventListenerOptions): Scanner<Z>;
}

declare type Subscriber = (data: any) => void;

export abstract class Scanner<T, K = string> implements Observable<ScannerEvent, Subscriber, T> {
    private dirty: boolean = false;
    private buffer: number[] = [];

    protected constructor(protected domNode: HTMLInputElement, protected parser: ParserInterface<T>) {
        this.listen();
    }

    on(event: ScannerEvent, fn: Subscriber, options?: boolean | AddEventListenerOptions): Scanner<T> {
        let listener = (ev: CustomEvent<T | K>) => {
            fn(ev.detail);
        };
        this.domNode.addEventListener(event as string, listener as EventListener, options);

        return this;
    }

    private listen(): void {
        this.domNode.addEventListener('keypress', (event: KeyboardEvent) => {
            if (!this.dirty) {
                this.domNode.dispatchEvent(new CustomEvent<null>(ScannerEvent.start));
                this.dirty = true;
            }

            // noinspection JSDeprecatedSymbols
            if (event.charCode === KeyboardChar.CR || event.charCode === KeyboardChar.LF) {
                let detail;
                try {
                    detail = this.parser.handle(this.buffer);
                } catch (error) {
                    this.domNode.dispatchEvent(new CustomEvent<K>(ScannerEvent.error, {detail: error}));
                    this.clear();
                }
                if (detail) {
                    this.domNode.dispatchEvent(new CustomEvent<T>(ScannerEvent.success, {detail}));
                    this.clear();
                }
            } else {
                // noinspection JSDeprecatedSymbols
                this.buffer.push(event.charCode);
            }
        });
    }

    private clear(): void {
        this.dirty = false;
        this.buffer = [];
        this.domNode.value = '';
        this.domNode.dispatchEvent(new CustomEvent<null>(ScannerEvent.finish));
    }

}
