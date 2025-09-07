import { UserTypeEnum } from '../../users/enums/userType.enum';

export interface ActiveUserData {
  //id of the user
  sub: string;
  //email of the user
  userType: UserTypeEnum;
}
