import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type UserChats = {
  userEmail: string;
  chatId: string;
  createdAt: Date;
  createdByMe: boolean;
};

@Entity()
export class ChatDirectory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('text')
  userEmail: string;

  @Column('simple-json')
  chats: UserChats[];
}
