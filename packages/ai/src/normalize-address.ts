import { generateText, Output } from "ai";
import { z } from "zod";

import { aiEnv } from "./env";
import { createProviders } from "./providers";

const streetTypeSchema = z.enum([
    "вул.",
    "просп.",
    "бул.",
    "пров.",
    "шосе",
    "майдан",
    "наб.",
    "узв.",
    "пл.",
]);

const settlementTypeSchema = z.enum(["", "м.", "смт", "с-ще", "с.", "селище"]);

export const addressNormalizationSchema = z.object({
    тип_вулиці: streetTypeSchema.describe(
        "скорочення типу вулиці: вул., просп., бул., пров., шосе, майдан, наб., узв., пл.",
    ),
    назва_вулиці: z.string().describe("назва вулиці без типу, напр. 'Шевченка'"),
    будинок: z
        .string()
        .describe("номер будинку, напр. '12', '12а', '15-Б'; якщо немає — порожній рядок"),
    квартира: z.string().describe("номер квартири, напр. '7'; якщо немає — порожній рядок"),
    тип_населеного_пункту: settlementTypeSchema.describe(
        "тип населеного пункту: м., смт, с-ще, с., селище; якщо невідомо — порожній рядок",
    ),
    населений_пункт: z.string().describe("назва населеного пункту, напр. 'Харків', 'Липці'"),
    район: z
        .string()
        .describe(
            "район без слова 'район', напр. 'Харківський', 'Чугуївський'; якщо немає — порожній рядок",
        ),
    область: z.string().describe("область без слова 'область', напр. 'Харківська'"),
});

export type NormalizedAddressParts = z.infer<typeof addressNormalizationSchema>;

const normalizeAddressPrompt = `# Нормалізація адреси

Тобі дано адресу в довільному вигляді. Витягни з неї складові української поштової адреси та поверни їх у вказаній структурі.

ВАЖЛИВО:
- Назву вулиці та тип вулиці розділяй: тип веди в поле "тип_вулиці" (скороченням), назву — в "назва_вулиці" без типу.
- Не вигадуй те, чого немає в адресі. Якщо елемента немає — для "будинок", "квартира", "район", "тип_населеного_пункту" повертай порожній рядок "".
- Всі частини — у називному відмінку.
- Поштовий індекс та слово "Україна" ігноруй.
- Номер будинку та номер квартири записуй в окремі поля.
- Якщо тип вулиці чи населеного пункту є, але нестандартний, підбери найближче скорочення.`;

export async function normalizeAddressWithAI(address: string): Promise<string> {
    if (!address?.trim()) {
        throw new Error("address is empty");
    }

    const result = await generateText({
        model: createProviders(aiEnv()).fastModel(),
        system: normalizeAddressPrompt,
        messages: [{ role: "user", content: address }],
        output: Output.object({ schema: addressNormalizationSchema }),
    });

    const data = addressNormalizationSchema.parse(JSON.parse(result.text));

    return formatNormalizedAddress(data);
}

export function formatNormalizedAddress(data: NormalizedAddressParts): string {
    const parts: string[] = [];

    parts.push(`${data.тип_вулиці} ${data.назва_вулиці}`);
    if (data.будинок) parts.push(data.будинок);
    if (data.квартира) parts.push(`кв. ${data.квартира}`);

    if (data.населений_пункт) {
        const settlement = data.тип_населеного_пункту
            ? `${data.тип_населеного_пункту} ${data.населений_пункт}`
            : data.населений_пункт;
        parts.push(settlement);
    }

    if (data.район) parts.push(`${data.район} р-н`);
    if (data.область) parts.push(`${data.область} обл.`);

    return parts.join(", ");
}
