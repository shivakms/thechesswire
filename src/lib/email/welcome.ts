
export interface WelcomeEmailOptions {
  titledPlayer: boolean;
  title?: string | null;
}

export async function sendWelcomeEmail(
  email: string, 
  username: string, 
  options: WelcomeEmailOptions
): Promise<void> {
  console.log('Sending welcome email to:', email, 'for user:', username);
  console.log('Email options:', options);
  
  await new Promise(resolve => setTimeout(resolve, 100));
}
