"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { ChatMessage } from "@/domains/message/message.types";
import { isSendableText } from "@/domains/message/message.utils";
import { useAuthStore, selectUser } from "@/features/auth";
import { ApiError } from "@/shared/lib/api-error";
import { reportError } from "@/shared/lib/error-handler";
import { API_ERROR_CODES } from "@/types/api";

import { sendMessage, type SendMessagePayload } from "../api/send-message";
import {
  markMessageFailed,
  upsertMessageInCache,
} from "../services/message-cache.service";

type SendVariables = SendMessagePayload;
type SendContext = { clientId: string };

/** Stable, collision-free id for an optimistic row. */
function createClientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Send a message, optimistically.
 *
 * The bubble appears the instant you hit enter, marked `sending`. When the
 * server answers we patch the same row with its real id and `sent`; if it
 * fails we mark it `failed` and leave it in place so the text is not lost and
 * the user can retry.
 *
 * The `clientId` is what ties all of that together, and it also lets the
 * incoming `message:new` echo reconcile onto the existing row instead of
 * appending a duplicate.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(selectUser);

  return useMutation<ChatMessage, unknown, SendVariables, SendContext>({
    mutationFn: async ({ conversationId, text }) => {
      // Belt and braces: the composer already blocks this, but the API would
      // happily persist an empty bubble if anything slipped through.
      if (!isSendableText(text)) {
        throw new ApiError({
          message: "Cannot send an empty message.",
          code: API_ERROR_CODES.validation,
        });
      }

      const message = await sendMessage({ conversationId, text: text.trim() });
      return { ...message, status: "sent" };
    },

    onMutate: ({ conversationId, text }) => {
      const clientId = createClientId();

      if (currentUser) {
        upsertMessageInCache(queryClient, conversationId, {
          id: clientId,
          clientId,
          conversationId,
          senderId: currentUser.id,
          text: text.trim(),
          createdAt: new Date().toISOString(),
          status: "sending",
        });
      }

      return { clientId };
    },

    onSuccess: (message, { conversationId }, context) => {
      upsertMessageInCache(queryClient, conversationId, {
        ...message,
        clientId: context?.clientId,
      });
      // Refresh the sidebar so the row's preview and ordering catch up.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      });
    },

    onError: (error, { conversationId }, context) => {
      if (context?.clientId) {
        markMessageFailed(queryClient, conversationId, context.clientId);
      }
      reportError(error, { scope: "chat.sendMessage", meta: { conversationId } });
    },
  });
}
