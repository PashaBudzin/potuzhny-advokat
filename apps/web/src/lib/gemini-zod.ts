/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

type GeminiSchema = {
    type: "STRING" | "NUMBER" | "INTEGER" | "BOOLEAN" | "OBJECT" | "ARRAY";
    format?: string;
    description?: string;
    items?: GeminiSchema;
    properties?: Record<string, GeminiSchema>;
    required?: string[];
    enum?: (string | number)[];
};

function isOptional(zodType: z.ZodTypeAny): boolean {
    return zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable;
}

function unwrapOptional(zodType: z.ZodTypeAny): z.ZodTypeAny {
    if (zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable) {
        return (zodType as any).unwrap();
    }
    return zodType;
}

function zodTypeToGeminiType(zodType: z.ZodTypeAny): GeminiSchema["type"] {
    const unwrapped = unwrapOptional(zodType);

    if (unwrapped instanceof z.ZodString) return "STRING";
    if (unwrapped instanceof z.ZodNumber) {
        return (unwrapped as any).isInteger ? "INTEGER" : "NUMBER";
    }
    if (unwrapped instanceof z.ZodBoolean) return "BOOLEAN";
    if (unwrapped instanceof z.ZodObject) return "OBJECT";
    if (unwrapped instanceof z.ZodArray) return "ARRAY";
    if (unwrapped instanceof z.ZodEnum) return "STRING";
    return "STRING";
}

function convertZodToGemini(schema: z.ZodTypeAny): GeminiSchema {
    const unwrappedSchema = unwrapOptional(schema);
    const result: GeminiSchema = {
        type: zodTypeToGeminiType(schema),
    };

    if (unwrappedSchema instanceof z.ZodString) {
        if ((unwrappedSchema as any).description) {
            result.description = (unwrappedSchema as any).description;
        }
    }

    if (unwrappedSchema instanceof z.ZodNumber) {
        if ((unwrappedSchema as any).description) {
            result.description = (unwrappedSchema as any).description;
        }
    }

    if (unwrappedSchema instanceof z.ZodBoolean) {
        if ((unwrappedSchema as any).description) {
            result.description = (unwrappedSchema as any).description;
        }
    }

    if (unwrappedSchema instanceof z.ZodObject) {
        result.properties = {};
        result.required = [];

        for (const [key, value] of Object.entries(unwrappedSchema.shape)) {
            result.properties[key] = convertZodToGemini(value as z.ZodTypeAny);

            if (!isOptional(value as z.ZodTypeAny)) {
                result.required.push(key);
            }
        }

        if ((unwrappedSchema as any).description) {
            result.description = (unwrappedSchema as any).description;
        }
    }

    if (unwrappedSchema instanceof z.ZodArray) {
        result.items = convertZodToGemini((unwrappedSchema as any).element);
        if ((unwrappedSchema as any).description) {
            result.description = (unwrappedSchema as any).description;
        }
    }

    if (unwrappedSchema instanceof z.ZodEnum) {
        result.enum = (unwrappedSchema as any).options;
        if ((unwrappedSchema as any).description) {
            result.description = (unwrappedSchema as any).description;
        }
    }

    return result;
}

export function zodToGemini(schema: z.ZodTypeAny): GeminiSchema {
    return convertZodToGemini(schema);
}

export type { GeminiSchema };
