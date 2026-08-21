/** Socket.io event names, mirrored from the API contract. */
export const SOCKET_EVENTS = {
  /** client → server: `{ conversationId, text }`, optional ack callback. */
  sendMessage: "message:send",
  /** server → client: a new message arrived in one of my conversations. */
  newMessage: "message:new",
  /** server → client: a group I belong to was created/renamed/re-membered. */
  conversationUpdated: "conversation:updated",

  connect: "connect",
  disconnect: "disconnect",
  connectError: "connect_error",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
