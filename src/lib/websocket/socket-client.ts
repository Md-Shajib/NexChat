import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { SOCKET_EVENTS } from "@/constants/socket-events";

import type { ChatSocket } from "./socket-events.types";

export type SocketStatus = "connecting" | "connected" | "disconnected";

/**
 * Socket.io singleton.
 *
 * IMPORTANT: the socket connects to the **host root**, not the `/api` REST
 * base — Socket.io serves itself at `/socket.io/`. Pointing it at the REST
 * base is the single easiest way to get a silent connection failure here.
 *
 * Connection status is exposed as an external store (`subscribeToSocketStatus`
 * / `getSocketStatus`) rather than as React state. The socket *is* the source
 * of truth, so React should read from it via `useSyncExternalStore` instead of
 * mirroring it into `useState` from inside an effect.
 */
let socket: ChatSocket | null = null;
let currentToken: string | null = null;

let status: SocketStatus = "disconnected";
const statusListeners = new Set<() => void>();

function setStatus(next: SocketStatus): void {
  if (status === next) return;
  status = next;
  for (const listener of statusListeners) listener();
}

/** Subscribe to connection-status changes. Returns an unsubscribe function. */
export function subscribeToSocketStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function getSocketStatus(): SocketStatus {
  return status;
}

/** Stable server snapshot — there is no socket during SSR. */
export function getServerSocketStatus(): SocketStatus {
  return "disconnected";
}

export function getSocket(): ChatSocket | null {
  return socket;
}

/**
 * Connect (or reconnect with a new identity).
 *
 * Calling this with the token already in use is a no-op, so it is safe to
 * invoke from an effect that re-runs.
 */
export function connectSocket(token: string): ChatSocket {
  if (socket && currentToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  // Identity changed — tear the old connection down before opening a new one.
  disconnectSocket();

  currentToken = token;
  setStatus("connecting");

  socket = io(env.socketUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    // The free-tier host cold-starts; give the handshake room to land.
    timeout: 20_000,
    autoConnect: true,
  }) as ChatSocket;

  socket.on(SOCKET_EVENTS.connect, () => setStatus("connected"));
  socket.on(SOCKET_EVENTS.disconnect, () => setStatus("disconnected"));
  socket.on(SOCKET_EVENTS.connectError, (error: Error) => {
    setStatus("disconnected");
    console.warn("[next-chat:socket] connect_error", error.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentToken = null;
  setStatus("disconnected");
}

export type { Socket };
