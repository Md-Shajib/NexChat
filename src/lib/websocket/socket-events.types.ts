import type { Socket } from "socket.io-client";

/**
 * Raw socket payloads.
 *
 * These deliberately mirror the *wire* shape (`_id`, `sender`, …) rather than
 * our normalised domain types — the payloads are parsed with the same Zod
 * schemas as the REST responses before they reach the cache, so the socket and
 * REST paths cannot drift apart.
 */
export type ServerToClientEvents = {
  "message:new": (payload: unknown) => void;
  "conversation:updated": (payload: unknown) => void;
};

export type SendMessageAck = {
  ok: boolean;
  message?: unknown;
  error?: { message: string; code: string };
};

export type ClientToServerEvents = {
  "message:send": (
    payload: { conversationId: string; text: string },
    ack?: (response: SendMessageAck) => void,
  ) => void;
};

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
