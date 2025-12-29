import { generatePozov } from "@/lib/ai";
import { extractDataSchema } from "@/lib/ai-configs/create-pozov-config";

export async function POST(req: Request) {
  const { pozovData: rawPozovData } = await req.json();

  const pozovData = extractDataSchema.parse(rawPozovData);

  if (!pozovData?.data)
    return new Response(JSON.stringify({ message: "No data on pozovData" }), {
      status: 400,
    });

  const stream = await generatePozov(pozovData.data, pozovData.type);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
