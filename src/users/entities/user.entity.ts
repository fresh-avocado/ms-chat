import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserType } from '../enums/userType';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Index({ unique: true })
  @Column('text')
  email: string;

  @Column({
    type: 'text',
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.NORMAL,
  })
  type: UserType;
}
