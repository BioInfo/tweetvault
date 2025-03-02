import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings } from '../types';
import { getUserSettings, updateUserSettings } from './settings';
import { useAuth } from './auth';
import { useToast } from '../components/Toast';

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  defaultView: 'dashboard',
  compactMode: false,
  autoSummarize: true
};

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Provider component for user settings
 * This will be implemented in the next session
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings when user changes
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userSettings = await getUserSettings();
        setSettings(userSettings || DEFAULT_SETTINGS);
        if (!userSettings) {
          showToast('Using default settings', 'info');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
        showToast('Failed to load settings', 'error');
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // Update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      setError(null);
      const updatedSettings = { ...settings, ...newSettings };
      
      await updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
      
      // If default view is changing, update the URL
      if (newSettings.defaultView && newSettings.defaultView !== settings.defaultView) {
        // Use window.location instead of useNavigate to avoid Router context dependency
        showToast(`Navigating to ${newSettings.defaultView}`, 'info');
        window.location.href = `/${newSettings.defaultView}`;
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      showToast('Failed to update settings', 'error');
      throw err;
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    if (!user) return;

    try {
      setError(null);
      await updateUserSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      showToast('Settings reset to defaults', 'success');
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings');
      showToast('Failed to reset settings', 'error');
      throw err;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook for accessing user settings
 * This will be implemented in the next session
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}