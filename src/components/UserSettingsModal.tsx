import React from 'react';
import { Moon, Sun, Monitor, Loader, RotateCcw } from 'lucide-react';
import { useSettings } from '../lib/settings-context';
import { UserSettings } from '../types';
import { useToast } from './Toast';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({
  isOpen,
  onClose,
}: UserSettingsModalProps) {
  const { settings, updateSettings, resetSettings, loading, error } = useSettings();
  const [localSettings, setLocalSettings] = React.useState(settings);
  const { showToast } = useToast();

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Settings</h3>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <ThemeButton
                icon={<Sun className="w-5 h-5" />}
                label="Light"
                selected={localSettings.theme === 'light'}
                onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
              />
              <ThemeButton
                icon={<Moon className="w-5 h-5" />}
                label="Dark"
                selected={localSettings.theme === 'dark'}
                onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
              />
              <ThemeButton
                icon={<Monitor className="w-5 h-5" />}
                label="System"
                selected={localSettings.theme === 'system'}
                onClick={() => setLocalSettings({ ...localSettings, theme: 'system' })}
              />
            </div>
          </div>

          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default View
            </label>
            <select
              value={localSettings.defaultView}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                defaultView: e.target.value as UserSettings['defaultView']
              })}
              className="w-full rounded-lg border-gray-200 text-sm"
            >
              <option value="dashboard">Dashboard</option>
              <option value="collections">Collections</option>
              <option value="insights">Insights</option>
            </select>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Options
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="compactMode"
                checked={localSettings.compactMode}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  compactMode: e.target.checked
                })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="compactMode" className="ml-2 text-sm text-gray-600">
                Compact Mode
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSummarize"
                checked={localSettings.autoSummarize}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  autoSummarize: e.target.checked
                })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <label htmlFor="autoSummarize" className="ml-2 text-sm text-gray-600">
                Auto-summarize tweets
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
                try {
                  await resetSettings();
                  setLocalSettings(settings);
                  showToast('Settings reset to defaults', 'success');
                } catch (err) {
                  showToast('Failed to reset settings', 'error');
                  console.error('Failed to reset settings:', err);
                }
              }
            }}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await updateSettings(localSettings);
                showToast('Settings saved successfully!', 'success');
                // Close modal after a short delay to show success message
                setTimeout(() => {
                  onClose();
                }, 1500);
              } catch (err) {
                showToast('Failed to save settings', 'error');
                console.error('Failed to save settings:', err);
              }
            }}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-600 p-2 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

interface ThemeButtonProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function ThemeButton({ icon, label, selected, onClick }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
        selected
          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}