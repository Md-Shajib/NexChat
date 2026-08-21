"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import type { CreatedConversation } from "@/domains/conversation/conversation.types";
import { reportError } from "@/shared/lib/error-handler";

import { createGroup, type CreateGroupPayload } from "../api/create-group";

export function useCreateGroup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<CreatedConversation, unknown, CreateGroupPayload>({
    mutationFn: createGroup,

    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(),
      });
      router.push(ROUTES.conversation(created.id));
    },

    onError: (error) => {
      reportError(error, { scope: "groupChat.create" });
    },
  });
}
