import { User } from '../types/user';

export class SettingsService {
  async updatePreferences(userId: string, preferences: User['preferences']): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/users/${userId}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
  }

  async getPreferences(userId: string): Promise<User['preferences']> {
    const response = await fetch(`http://localhost:8080/api/users/${userId}/preferences`);
    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }
    return response.json();
  }
}

export const settingsService = new SettingsService();