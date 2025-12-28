import { generatePozov } from "@/lib/ai";

export async function POST(req: Request) {
  const { pozovData } = await req.json();

  const stream = await generatePozov(pozovData);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
