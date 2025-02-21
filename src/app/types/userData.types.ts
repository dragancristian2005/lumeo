export interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePic: string;
  bio: string;
  followers: Record<string, boolean>;
  following: Record<string, boolean>;
}
