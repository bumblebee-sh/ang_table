import { UserAge } from "../enums/user-age.enum";

export interface UserTableFilter {
  search: string;
  active: null | boolean;
  dob: null | UserAge;
}