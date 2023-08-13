import { UserType } from 'src/users/enums/userType';

export type Role = `${UserType}` | 'any';
