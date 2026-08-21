"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { reportError } from "@/shared/lib/error-handler";

import {
  addParticipants,
  promoteToAdmin,
  removeParticipant,
  renameGroup,
} from "../api/manage-group";

/**
 * Group administration mutations.
 *
 * Each one invalidates the conversation list on settle. The server also emits
 * `conversation:updated` to everyone in the group, so other members' clients
 * refresh through the socket path without any extra work here.
 */
export function useGroupActions(conversationId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const invalidateConversations = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all() });

  const rename = useMutation({
    mutationFn: (name: string) => renameGroup({ conversationId, name }),
    onSuccess: invalidateConversations,
    onError: (error) =>
      reportError(error, { scope: "groupChat.rename", meta: { conversationId } }),
  });

  const addMembers = useMutation({
    mutationFn: (userIds: string[]) =>
      addParticipants({ conversationId, userIds }),
    onSuccess: invalidateConversations,
    onError: (error) =>
      reportError(error, {
        scope: "groupChat.addMembers",
        meta: { conversationId },
      }),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => removeParticipant({ conversationId, userId }),
    onSuccess: invalidateConversations,
    onError: (error) =>
      reportError(error, {
        scope: "groupChat.removeMember",
        meta: { conversationId },
      }),
  });

  const promote = useMutation({
    mutationFn: (userId: string) => promoteToAdmin({ conversationId, userId }),
    onSuccess: invalidateConversations,
    onError: (error) =>
      reportError(error, {
        scope: "groupChat.promote",
        meta: { conversationId },
      }),
  });

  /** Leaving is `removeParticipant` with your own id — plus a navigation. */
  const leave = useMutation({
    mutationFn: (userId: string) => removeParticipant({ conversationId, userId }),
    onSuccess: async () => {
      // Drop the history for a conversation we can no longer read.
      queryClient.removeQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      await invalidateConversations();
      router.replace(ROUTES.chat);
    },
    onError: (error) =>
      reportError(error, { scope: "groupChat.leave", meta: { conversationId } }),
  });

  return { rename, addMembers, removeMember, promote, leave };
}
