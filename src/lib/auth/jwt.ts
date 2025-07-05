
export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  titledPlayer: boolean;
  accountType: string;
}

export function generateJWT(payload: JWTPayload): string {
  console.log('Generating JWT for user:', payload.username);
  
  return `jwt-token-${payload.userId}-${Date.now()}`;
}
