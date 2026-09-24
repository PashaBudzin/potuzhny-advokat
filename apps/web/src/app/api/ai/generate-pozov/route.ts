import { extractDataSchema, generatePozov } from "@potuzhny-advokat/ai";

export async function POST(req: Request) {
    const { pozovData: rawPozovData } = await req.json();

    const pozovData = extractDataSchema.parse(rawPozovData);

    if (!pozovData?.data)
        return new Response(JSON.stringify({ message: "No data on pozovData" }), {
            status: 400,
        });

    const text = await generatePozov(pozovData.data);

    return new Response(text, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
