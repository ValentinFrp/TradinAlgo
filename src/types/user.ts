export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    defaultStrategy?: string;
  };
}