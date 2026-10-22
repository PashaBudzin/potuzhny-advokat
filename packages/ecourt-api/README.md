# `@potuzhny-advokat/ecourt-api`

Strongly typed TypeScript client for the Ukrainian Electronic Court corporate
API (`API Електронного суду`).

- Zero runtime dependencies.
- Works with Node.js and Bun via the global `fetch`.
- Supports Hawk (HMAC-SHA256) and Bearer authentication.
- Fully typed request DSL (`filter`, `or`, `sort`, `join`, `s`, pagination).
- Typed models for dictionaries, court data, claims, tickets, storage,
  messages, powers of attorney and ASVP decisions.

## Usage

```ts
import { EcourtClient } from "@potuzhny-advokat/ecourt-api";

const client = new EcourtClient({
    environment: "stage",
    auth: {
        hawk: {
            id: process.env.ECOURT_HAWK_ID!,
            key: process.env.ECOURT_HAWK_KEY!,
        },
    },
});
```

Bearer authentication is also supported:

```ts
const client = new EcourtClient({
    auth: { token: process.env.ECOURT_TOKEN! },
});
```

The token may be a function, which is useful for short-lived tokens:

```ts
const client = new EcourtClient({
    auth: {
        token: async () => getAccessToken(),
    },
});
```

## Environments

| Environment  | Base URL                              |
| ------------ | ------------------------------------- |
| `production` | `https://api-corp.court.gov.ua`       |
| `stage`      | `https://stage-api-corp.court.gov.ua` |
| `test`       | `https://test-api-corp.court.gov.ua`  |

The default API prefix is `/api/v1`. Override it with `apiPrefix` or provide a
complete `baseUrl`.

```ts
const client = new EcourtClient({
    baseUrl: "https://api-corp.court.gov.ua",
    apiPrefix: "/api/v1",
});
```

## Querying

All list and single-record endpoints accept the eCourt CRUD query:

```ts
const documents = await client.data.documents.list({
    fields: ["id", "regDate", "description", "courtName"],
    filters: [
        { field: "regDate", operator: "$gte", value: "2024-01-01T00:00:00.000Z" },
        { field: "docTypeId", operator: "$in", value: [1, 2, 3] },
    ],
    joins: ["attachments", { relation: "court", fields: ["id", "name"] }],
    sort: [{ field: "regDate", order: "DESC" }],
    limit: 100,
    offset: 0,
});
```

The query is serialized to the format used by the API:

- `filter=field||$operator||value`
- `or=field||$operator||value`
- `sort=field,ASC|DESC`
- `join=relation||field1,field2`

JSON search is available through `search` or `s`:

```ts
const cases = await client.data.cases.list({
    search: {
        $and: [{ caseStatusId: 1 }, { criminalProcNum: { $notnull: true } }],
    },
});
```

## Dictionaries

```ts
const courts = await client.dictionaries.courts.list({
    filters: [{ field: "name", operator: "$cont", value: "Київ" }],
    limit: 20,
});

const court = await client.dictionaries.courts.get(1, {
    joins: ["region", "courtType"],
});
```

## Storage and claims

Files must be uploaded to the storage before they can be referenced by a claim,
party document or power of attorney.

```ts
const claimFile = await client.storage.upload(pdfBytes, "application/pdf");
const claimSignature = await client.storage.uploadSignature(claimFile.fileLink, signatureBytes);

await client.claims.submit({
    claimTypeId: 1,
    courtId: 1,
    description: "Позовна заява",
    original: {
        link: claimFile.fileLink,
        type: claimFile.contentType,
        signatures: [{ link: claimSignature.fileLink, type: "application/pkcs7-signature" }],
    },
    participants: [
        {
            isLegal: false,
            memberRoleId: 1,
            name: "Іван Іванович Іванов",
            code: "1234567890",
        },
    ],
    sourceId: "claim-1",
});
```

Download a file from the storage:

```ts
const file = await client.storage.download(document.original.link);
await Bun.write("document.pdf", file.bytes);
```

## Claim tickets

```ts
const unread = await client.claims.listTickets({
    filters: [{ field: "state", operator: "$eq", value: "UNREAD" }],
    limit: 100,
});

for (const ticket of unread.data) {
    const downloaded = await client.storage.download(/* ticket file link */);
    // Verify and process the signed ticket.
}

await client.claims.confirmTickets([{ id: ticket.id, state: "CONFIRMED" }]);
```

## Message queue

The message queue reports new documents, document updates and dictionary
changes.

```ts
const messages = await client.messages.list({
    filters: [{ field: "schema", operator: "$eq", value: "data/document" }],
    limit: 100,
});

for (const message of messages.data) {
    const document = await client.data.documents.get(message.objectId);
    await client.messages.markRead(message.id);
}
```

Bulk acknowledgement is available through `messages.ticketMany`.

## Powers of attorney

```ts
await client.powerOfAttorney.submit({
    allowedToCode: "1234567890",
    allowedToName: "Петренко Петро Петрович",
    allowCommit: 1,
    typeId: 0,
    original: {
        link: poaFile.fileLink,
        type: poaFile.contentType,
        signatures: [{ link: poaSignature.fileLink }],
    },
});

const powers = await client.powerOfAttorney.list({
    filters: [{ field: "isActive", operator: "$eq", value: true }],
});
```

## Errors

Non-2xx responses throw `EcourtApiError` with the status, parsed body, request
URL and request identifiers from the response headers.

```ts
import { EcourtApiError, EcourtTimeoutError } from "@potuzhny-advokat/ecourt-api";

try {
    await client.claims.submit(claim);
} catch (error) {
    if (error instanceof EcourtApiError) {
        console.error(error.status, error.messages, error.requestId);
    } else if (error instanceof EcourtTimeoutError) {
        console.error("The request timed out");
    }
}
```

## Options

| Option        | Description                                                            |
| ------------- | ---------------------------------------------------------------------- |
| `auth`        | Hawk or Bearer credentials.                                            |
| `baseUrl`     | Override the environment base URL.                                     |
| `apiPrefix`   | API path prefix. Defaults to `/api/v1`.                                |
| `headers`     | Headers sent with every request.                                       |
| `fetch`       | Custom `fetch` implementation (tests, proxies, runtimes).              |
| `timeoutMs`   | Request timeout in milliseconds. Defaults to `30000`; `0` disables it. |
| `environment` | `production`, `stage` or `test`. Defaults to `production`.             |

Per-request options accept `signal`, `headers` and `timeoutMs`.

## Notes

- Data and dictionary resources are read-only in the corporate API.
- `client.claims.types` exposes the claim type dictionary (`/claims/type`).
- ASVP decisions are returned as `ExecutiveDecisionList` from list endpoints and
  as `ExecutiveDecision` from the single-record endpoint.
- The SRS contains a few discrepancies around power-of-attorney scope
  identifiers; the type documentation calls them out where relevant.
