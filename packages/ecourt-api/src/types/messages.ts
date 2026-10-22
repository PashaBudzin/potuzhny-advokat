import type { LiteralUnion } from "./common";

/**
 * Object schema reported in a message queue item.
 *
 * The API currently emits the listed values, but new values may be added, so
 * the type remains open to future strings.
 */
export type MessageSchema = LiteralUnion<
    "data/document" | "party-docs/document" | "asvp/decisions" | "data/trial"
>;

/**
 * Action performed on the object referenced by a message.
 */
export type MessageAction = LiteralUnion<"create" | "update" | "delete">;

/**
 * Message processing status.
 *
 * The SRS documents `unread` / `read` strings, while older examples use `0` /
 * `1`, so both forms are accepted.
 */
export type MessageStatus = "unread" | "read" | number;

/**
 * Message from the eCourt queue.
 *
 * Messages contain only the object type, object identifier and the action that
 * occurred. Use {@link Message.url} or the corresponding `data` resource to
 * fetch the full object.
 */
export interface Message {
    /** Unique message identifier. */
    id: string;
    /** Date and time when the message was created in eCourt (ISO 8601). */
    createdAt?: string;
    /** Date and time when the message was last updated (ISO 8601). */
    updatedAt?: string;
    /** Object schema, e.g. `data/document`. */
    schema: MessageSchema;
    /** Identifier of the object affected by the action. */
    objectId: string;
    /** Action performed on the object. */
    action: MessageAction;
    /** Date and time when the action occurred (ISO 8601). */
    actionAt: string;
    /** Direct URL for fetching the affected object. */
    url: string;
    /** Human-readable description of the event. */
    description?: string;
    /** Message status. */
    status?: MessageStatus;
}

/**
 * Status supplied in a message acknowledgement ticket.
 */
export type MessageTicketStatus = "read" | "unread" | "deleted" | "error";

/**
 * Error details supplied when a message could not be processed.
 */
export interface MessageTicketError {
    /** Error code defined by the receiving system. */
    code?: string | null;
    /** Short error description. */
    message?: string | null;
    /** Arbitrary additional error data. */
    data?: Record<string, unknown> | null;
}

/**
 * Acknowledgement ticket for a message queue item.
 *
 * @example
 * ```ts
 * await client.messages.ticket({
 *   id: message.id,
 *   status: "read",
 * });
 * ```
 */
export interface MessageTicket {
    /** Identifier of the message being acknowledged. */
    id: string;
    /**
     * Processing result. Defaults to `read` on the server.
     *
     * - `read` — successfully processed.
     * - `unread` — move a previously read message back to unread.
     * - `deleted` — mark the message as deleted.
     * - `error` — processing failed; provide {@link MessageTicket.error}.
     */
    status?: MessageTicketStatus;
    /** Error details for the `error` status. */
    error?: MessageTicketError;
}

/**
 * Message archive settings.
 */
export interface MessageArchiveSettings {
    /** Date of the last transfer of messages to the archive (ISO 8601). */
    lastArchDate?: string;
    /** Number of months messages remain in the main queue before archiving. */
    archPeriod?: number;
}
