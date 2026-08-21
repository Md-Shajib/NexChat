"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { queryKeys } from "@/constants/query-keys";
import { SOCKET_EVENTS } from "@/constants/socket-events";
import { messageSchema } from "@/domains/message/message.schema";
import { useAuthStore, selectToken } from "@/features/auth";
import { connectSocket, disconnectSocket } from "@/lib/websocket/socket-client";
import { reportError } from "@/shared/lib/error-handler";

import { upsertMessageInCache } from "../services/message-cache.service";

export type SocketStatus = "connecting" | "connected" | "disconnected";

/**
 * Owns the socket lifecycle and funnels server pushes into the query cache.
 *
 * Mounted once, at the chat shell. Everything below re-renders from the cache,
 * so no component needs to know a socket exists.
 *
 * Incoming payloads are parsed with the same Zod schema as the REST responses,
 * so a malformed push is dropped rather than corrupting the cache.
 */
export function useChatSocket() {
  const token = useAuthStore(selectToken);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    const socket = connectSocket(token);

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");

    const handleNewMessage = (payload: unknown) => {
      const parsed = messageSchema.safeParse(payload);
      if (!parsed.success) {
        reportError(parsed.error, { scope: "chat.socket.message:new" });
        return;
      }

      const message = parsed.data;
      upsertMessageInCache(queryClient, message.conversationId, {
        ...message,
        status: "sent",
      });

      // The sidebar preview and ordering both depend on this message.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      });
    };

    const handleConversationUpdated = () => {
      // The payload is a partial conversation in an undocumented shape, so we
      // treat the event purely as a signal and refetch the canonical list.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      });
    };

    socket.on(SOCKET_EVENTS.connect, handleConnect);
    socket.on(SOCKET_EVENTS.disconnect, handleDisconnect);
    socket.on(SOCKET_EVENTS.newMessage, handleNewMessage);
    socket.on(SOCKET_EVENTS.conversationUpdated, handleConversationUpdated);

    if (socket.connected) setStatus("connected");

    return () => {
      socket.off(SOCKET_EVENTS.connect, handleConnect);
      socket.off(SOCKET_EVENTS.disconnect, handleDisconnect);
      socket.off(SOCKET_EVENTS.newMessage, handleNewMessage);
      socket.off(SOCKET_EVENTS.conversationUpdated, handleConversationUpdated);
    };
  }, [token, queryClient]);

  return { status, isConnected: status === "connected" };
}
