import { createAgentUIStreamResponse } from "ai";
import { chatAgent } from "@/lib/ai/chat";

export async function POST(request: Request) {
    const body = await request.json();
    const uiMessages = body.messages ?? [];

    return createAgentUIStreamResponse({
        agent: chatAgent,
        uiMessages,
    });
}
