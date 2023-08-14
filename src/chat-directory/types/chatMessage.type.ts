export type ChatMessage = {
  id: string;
  message: string;
  authorEmail: string; // author of message
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
};
