"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

import { queryKeys } from "@/constants/query-keys";
import { SOCKET_EVENTS } from "@/constants/socket-events";
import { messageSchema } from "@/domains/message/message.schema";
import { useAuthStore, selectToken } from "@/features/auth";
import {
  connectSocket,
  disconnectSocket,
  getServerSocketStatus,
  getSocketStatus,
  subscribeToSocketStatus,
  type SocketStatus,
} from "@/lib/websocket/socket-client";
import { reportError } from "@/shared/lib/error-handler";

import { upsertMessageInCache } from "../services/message-cache.service";

export type { SocketStatus };

/**
 * Owns the socket lifecycle and funnels server pushes into the query cache.
 *
 * Mounted once, at the chat shell. Everything below re-renders from the cache,
 * so no component needs to know a socket exists.
 *
 * Status is read with `useSyncExternalStore` rather than mirrored into
 * `useState`: the socket is an external system and already holds the truth, so
 * subscribing to it avoids a render pass per status change.
 *
 * Incoming payloads are parsed with the same Zod schema as the REST responses,
 * so a malformed push is dropped rather than corrupting the cache.
 */
export function useChatSocket() {
  const token = useAuthStore(selectToken);
  const queryClient = useQueryClient();

  const status = useSyncExternalStore(
    subscribeToSocketStatus,
    getSocketStatus,
    getServerSocketStatus,
  );

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

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

    socket.on(SOCKET_EVENTS.newMessage, handleNewMessage);
    socket.on(SOCKET_EVENTS.conversationUpdated, handleConversationUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.newMessage, handleNewMessage);
      socket.off(SOCKET_EVENTS.conversationUpdated, handleConversationUpdated);
    };
  }, [token, queryClient]);

  return { status, isConnected: status === "connected" };
}
