import { createAgentUIStreamResponse } from "ai";
import { createChatAgent } from "@potuzhny-advokat/ai";

const chatAgent = createChatAgent();

export async function POST(request: Request) {
    const body = await request.json();
    const uiMessages = body.messages ?? [];

    return createAgentUIStreamResponse({
        agent: chatAgent,
        uiMessages,
    });
}
