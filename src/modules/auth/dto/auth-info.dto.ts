import { IUser } from "@/interfaces/user.interface";

export class AuthInfoDto {
  accessToken: string;
  user: IUser;
}