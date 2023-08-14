export type ChatMessage = {
  id: string;
  message: string;
  userId: string; // author of message
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
};
