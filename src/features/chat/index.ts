/** Public API of the chat feature. */
export * from "./components";
export * from "./hooks";
export * from "./schemas/send-message.schema";
export { flattenMessages } from "./services/message-cache.service";
export type { SendMessagePayload } from "./api/send-message";
export type { GetMessagesParams } from "./api/get-messages";
