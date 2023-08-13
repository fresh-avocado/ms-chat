import { UserType } from 'src/users/enums/userType';

export type ClientSession = {
  userEmail: string;
  userType: UserType;
  shoppingCart?: any[]; // TODO: type
};
