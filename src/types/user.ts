export interface User {
  id: number;
  nickname: string;
  profileImage: string;
}

export interface KakaoLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  isNewUser: boolean;
}
