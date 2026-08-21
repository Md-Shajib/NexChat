"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import type { CreatedConversation } from "@/domains/conversation/conversation.types";
import { reportError } from "@/shared/lib/error-handler";

import {
  createConversation,
  type CreateConversationPayload,
} from "../api/create-conversation";

/**
 * Start (or reopen) a direct conversation and navigate into it.
 *
 * The create response is too thin to insert into the sidebar cache directly,
 * so we invalidate the list and let it refetch — a single extra request, in
 * exchange for never rendering a half-populated row.
 */
export function useStartConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<CreatedConversation, unknown, CreateConversationPayload>({
    mutationFn: createConversation,

    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      });
      router.push(ROUTES.conversation(created.id));
    },

    onError: (error) => {
      reportError(error, { scope: "conversation.start" });
    },
  });
}
