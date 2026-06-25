"use client";

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import {
    Tool,
    ToolContent,
    ToolHeader,
    ToolInput,
    ToolOutput,
} from "@/components/ai-elements/tool";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMutation } from "@tanstack/react-query";
import type { ChatAgentUIMessage } from "@/lib/ai/chat";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    loadSessions,
    saveSessions,
    loadMessages,
    saveMessages,
    createSession,
    deleteSession,
} from "@/lib/chat-storage";
import { useEffect, useState, useRef } from "react";
import type { SessionMeta } from "@/lib/chat-storage";

function ChatView({
    session,
    onNameChange,
}: {
    session: SessionMeta;
    onNameChange: (id: string, name: string) => void;
}) {
    const initialMessages = loadMessages(session.id);
    const nameSetRef = useRef(false);

    const { messages, sendMessage, status, stop, addToolApprovalResponse } =
        useChat<ChatAgentUIMessage>({
            id: session.id,
            messages: initialMessages as ChatAgentUIMessage[],
            transport: new DefaultChatTransport({ api: "/api/chat" }),
        });

    useEffect(() => {
        if (status === "ready") {
            saveMessages(session.id, messages);
        }
    }, [messages, status, session.id]);

    useEffect(() => {
        if (nameSetRef.current) return;
        const firstUserMsg = messages.find((m) => m.role === "user");
        if (firstUserMsg && session.name === "New conversation") {
            const textPart = firstUserMsg.parts.find((p) => p.type === "text");
            if (textPart && textPart.type === "text") {
                nameSetRef.current = true;
                const text = textPart.text;
                const name = text.slice(0, 60) + (text.length > 60 ? "…" : "");
                onNameChange(session.id, name);
            }
        }
    }, [messages, session, onNameChange]);

    const isLoading = status === "submitted" || status === "streaming";

    return (
        <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-20">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Start a conversation by sending a message.
                        </p>
                    </div>
                )}
                {messages.map((msg) => (
                    <Message from={msg.role} key={msg.id}>
                        <MessageContent>
                            {msg.parts.map((part, i) => {
                                switch (part.type) {
                                    case "text":
                                        return (
                                            // oxlint-disable-next-line react/no-array-index-key
                                            <MessageResponse key={`${msg.id}-${i}`}>
                                                {part.text}
                                            </MessageResponse>
                                        );
                                    case "reasoning":
                                        return (
                                            // oxlint-disable-next-line react/no-array-index-key
                                            <Reasoning key={`${msg.id}-${i}`}>
                                                <ReasoningTrigger />
                                                <ReasoningContent>{part.text}</ReasoningContent>
                                            </Reasoning>
                                        );
                                    case "dynamic-tool": {
                                        const p = part as any;
                                        return (
                                            <Tool key={p.toolCallId}>
                                                <ToolHeader
                                                    type={p.type}
                                                    state={p.state}
                                                    toolName={p.toolName}
                                                />
                                                <ToolContent>
                                                    {p.input && <ToolInput input={p.input} />}
                                                    {p.state === "approval-requested" && (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    addToolApprovalResponse({
                                                                        id: p.approval.id,
                                                                        approved: true,
                                                                    })
                                                                }
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    addToolApprovalResponse({
                                                                        id: p.approval.id,
                                                                        approved: false,
                                                                    })
                                                                }
                                                            >
                                                                Deny
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {(p.output ?? p.errorText) && (
                                                        <ToolOutput
                                                            output={p.output}
                                                            errorText={p.errorText}
                                                        />
                                                    )}
                                                </ToolContent>
                                            </Tool>
                                        );
                                    }
                                    default:
                                        if (part.type.startsWith("tool-")) {
                                            const p = part as any;
                                            return (
                                                <Tool key={p.toolCallId}>
                                                    <ToolHeader type={p.type} state={p.state} />
                                                    <ToolContent>
                                                        {p.input && <ToolInput input={p.input} />}
                                                        {p.state === "approval-requested" && (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        addToolApprovalResponse({
                                                                            id: p.approval.id,
                                                                            approved: true,
                                                                        })
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        addToolApprovalResponse({
                                                                            id: p.approval.id,
                                                                            approved: false,
                                                                        })
                                                                    }
                                                                >
                                                                    Deny
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {(p.output ?? p.errorText) && (
                                                            <ToolOutput
                                                                output={p.output}
                                                                errorText={p.errorText}
                                                            />
                                                        )}
                                                    </ToolContent>
                                                </Tool>
                                            );
                                        }
                                        return null;
                                }
                            })}
                        </MessageContent>
                    </Message>
                ))}
                {isLoading && (
                    <Message from="assistant">
                        <MessageContent>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                                <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                                <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                            </div>
                        </MessageContent>
                    </Message>
                )}
            </div>
            <PromptInput
                className="border-t p-4"
                onSubmit={(message) => {
                    sendMessage({ text: message.text });
                }}
            >
                <PromptInputTextarea placeholder="Ask a legal question..." />
                <PromptInputSubmit status={status} onStop={stop} />
            </PromptInput>
        </div>
    );
}

const ChatPage = () => {
    const [sessions, setSessions] = useState<SessionMeta[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const { setOpenMobile } = useSidebar();

    useEffect(() => {
        const loaded = loadSessions();
        if (loaded.length === 0) {
            const s = createSession();
            saveSessions([s]);
            setSessions([s]);
            setActiveId(s.id);
        } else {
            setSessions(loaded);
            setActiveId(loaded[0].id);
        }
    }, []);

    const clearMutation = useMutation({
        mutationFn: async () => {
            await new Promise((r) => setTimeout(r, 200));
        },
        onSuccess: () => {
            const s = createSession();
            const updated = [s, ...sessions];
            saveSessions(updated);
            setSessions(updated);
            setActiveId(s.id);
        },
    });

    const handleNewChat = () => {
        const s = createSession();
        const updated = [s, ...sessions];
        saveSessions(updated);
        setSessions(updated);
        setActiveId(s.id);
        setOpenMobile(false);
    };

    const handleSelect = (id: string) => {
        setActiveId(id);
        setOpenMobile(false);
    };

    const handleDelete = (id: string) => {
        deleteSession(id);
        const updated = sessions.filter((s) => s.id !== id);
        setSessions(updated);
        if (activeId === id) {
            setActiveId(updated[0]?.id ?? null);
            if (updated.length === 0) {
                const s = createSession();
                saveSessions([s]);
                setSessions([s]);
                setActiveId(s.id);
            }
        }
    };

    const handleNameChange = (id: string, name: string) => {
        setSessions((prev) => {
            const updated = prev.map((s) =>
                s.id === id ? { ...s, name, updatedAt: Date.now() } : s,
            );
            saveSessions(updated);
            return updated;
        });
    };

    const activeSession = sessions.find((s) => s.id === activeId);

    return (
        <>
            <Sidebar collapsible="offcanvas">
                <SidebarHeader>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleNewChat}>
                        + New chat
                    </Button>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {sessions.map((s) => (
                                    <SidebarMenuItem key={s.id}>
                                        <SidebarMenuButton
                                            isActive={s.id === activeId}
                                            onClick={() => handleSelect(s.id)}
                                        >
                                            <span className="truncate">{s.name}</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuAction
                                            showOnHover
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(s.id);
                                            }}
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} />
                                            <span className="sr-only">Delete session</span>
                                        </SidebarMenuAction>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <div className="flex min-h-0 flex-1 flex-col">
                    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger />
                        <span className="text-sm text-muted-foreground">
                            {activeSession ? activeSession.name : "No conversation"}
                        </span>
                        <div className="ml-auto">
                            {sessions.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearMutation.mutate()}
                                    disabled={clearMutation.isPending}
                                >
                                    <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </header>
                    <div className="flex min-h-0 flex-1">
                        {activeSession ? (
                            <ChatView
                                key={activeSession.id}
                                session={activeSession}
                                onNameChange={handleNameChange}
                            />
                        ) : (
                            <div className="flex flex-1 items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    No conversations yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </>
    );
};

export default ChatPage;
