import type { ApiTransport, EcourtRequestOptions } from "../internal";
import type { CrudQuery, ListResponse, SingleQuery } from "../types/common";
import type {
    Message,
    MessageArchiveSettings,
    MessageTicket,
    MessageTicketStatus,
} from "../types/messages";

/**
 * Message queue resources.
 *
 * The queue delivers notifications about objects created or changed in eCourt.
 * Each message contains the object schema, identifier and action. A message is
 * acknowledged with {@link MessagesResource.ticket}; unacknowledged messages
 * remain unread.
 */
export class MessagesResource {
    private readonly transport: ApiTransport;

    /**
     * @param transport - Transport used to perform requests.
     */
    constructor(transport: ApiTransport) {
        this.transport = transport;
    }

    /**
     * Retrieve unread messages from the queue.
     *
     * By default the API returns only messages with `status=unread`. Use a
     * filter such as `status||$in||unread,read` to include read messages.
     *
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated message list.
     */
    list(query: CrudQuery = {}, options?: EcourtRequestOptions): Promise<ListResponse<Message>> {
        return this.transport.get<ListResponse<Message>>("/messages/queue", query, options);
    }

    /**
     * Retrieve a single message by identifier.
     *
     * @param id - Message identifier.
     * @param query - Optional field selection.
     * @param options - Per-request options.
     * @returns The requested message.
     */
    get(id: string, query: SingleQuery = {}, options?: EcourtRequestOptions): Promise<Message> {
        return this.transport.get<Message>(
            `/messages/message/${encodeURIComponent(id)}`,
            query,
            options,
        );
    }

    /**
     * Acknowledge one message.
     *
     * @param ticket - Message identifier and processing result.
     * @param options - Per-request options.
     */
    ticket(ticket: MessageTicket, options?: EcourtRequestOptions): Promise<void> {
        return this.transport.postVoid("/messages/ticket", ticket, options);
    }

    /**
     * Acknowledge several messages in one request.
     *
     * @param tickets - Message tickets.
     * @param options - Per-request options.
     */
    ticketMany(tickets: MessageTicket[], options?: EcourtRequestOptions): Promise<void> {
        return this.transport.postVoid("/messages/ticket/bulk", tickets, options);
    }

    /**
     * Mark a message as read.
     *
     * @param id - Message identifier.
     * @param options - Per-request options.
     */
    markRead(id: string, options?: EcourtRequestOptions): Promise<void> {
        return this.setStatus(id, "read", options);
    }

    /**
     * Move a message back to the unread state.
     *
     * @param id - Message identifier.
     * @param options - Per-request options.
     */
    markUnread(id: string, options?: EcourtRequestOptions): Promise<void> {
        return this.setStatus(id, "unread", options);
    }

    /**
     * Delete a message from the queue.
     *
     * @param id - Message identifier.
     * @param options - Per-request options.
     */
    delete(id: string, options?: EcourtRequestOptions): Promise<void> {
        return this.transport.deleteVoid(`/messages/message/${encodeURIComponent(id)}`, options);
    }

    /**
     * Set an arbitrary message status.
     *
     * @param id - Message identifier.
     * @param status - New status.
     * @param options - Per-request options.
     */
    setStatus(
        id: string,
        status: MessageTicketStatus,
        options?: EcourtRequestOptions,
    ): Promise<void> {
        return this.ticket({ id, status }, options);
    }

    /**
     * Retrieve message archive settings.
     *
     * @param options - Per-request options.
     * @returns Current archive settings.
     */
    getArchiveSettings(options?: EcourtRequestOptions): Promise<MessageArchiveSettings> {
        return this.transport.get<MessageArchiveSettings>(
            "/messages/archive-settings",
            {},
            options,
        );
    }

    /**
     * Retrieve archived messages.
     *
     * Archived messages can be read but no longer acknowledged.
     *
     * @param query - CRUD query.
     * @param options - Per-request options.
     * @returns Paginated list of archived messages.
     */
    listArchived(
        query: CrudQuery = {},
        options?: EcourtRequestOptions,
    ): Promise<ListResponse<Message>> {
        return this.transport.get<ListResponse<Message>>("/messages/archive", query, options);
    }
}
