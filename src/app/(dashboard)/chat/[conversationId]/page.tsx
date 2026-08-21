import { ChatPanel } from "@/features/chat";

/**
 * A single conversation. Routing only — the panel owns everything else.
 *
 * `params` is a Promise in the App Router, so it is awaited here rather than
 * threaded into the client component.
 */
export default async function ConversationPage({
  params,
}: PageProps<"/chat/[conversationId]">) {
  const { conversationId } = await params;

  return <ChatPanel conversationId={conversationId} />;
}
