declare module "mailparser" {
    export interface SimpleParserOptions {
        stream?: boolean;
    }

    export interface ParsedMail {
        subject: string | null;
        text: string | null;
        date: Date | null;
        headers: Map<string, string>;
    }

    export function simpleParser(
        source: Buffer | string | NodeJS.ReadableStream,
        options?: SimpleParserOptions,
    ): Promise<ParsedMail>;
}
