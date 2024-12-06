import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { settingsService } from '../services/settingsService';

export function useSettings(userId: string) {
  const [preferences, setPreferences] = useState<User['preferences']>({
    theme: 'light',
    notifications: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const prefs = await settingsService.getPreferences(userId);
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<User['preferences']>) => {
    try {
      await settingsService.updatePreferences(userId, {
        ...preferences,
        ...newPreferences
      });
      setPreferences(prev => ({ ...prev, ...newPreferences }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences
  };
}