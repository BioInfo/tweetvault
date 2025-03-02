import { supabase } from './supabase';
import { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  defaultView: 'dashboard',
  compactMode: false,
  autoSummarize: true
};

export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user settings:', error);
      return null;
    }

    if (!settings) {
      // Create default settings for new user
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.user.id,
          theme: DEFAULT_SETTINGS.theme,
          default_view: DEFAULT_SETTINGS.defaultView,
          compact_mode: DEFAULT_SETTINGS.compactMode,
          auto_summarize: DEFAULT_SETTINGS.autoSummarize
        });

      if (insertError) {
        console.error('Error creating default settings:', insertError);
        return DEFAULT_SETTINGS;
      }

      return DEFAULT_SETTINGS;
    }

    return {
      theme: settings.theme,
      defaultView: settings.default_view,
      compactMode: settings.compact_mode,
      autoSummarize: settings.auto_summarize
    };
  } catch (err) {
    console.error('Error in getUserSettings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateUserSettings(settings: UserSettings): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.user.id,
        theme: settings.theme,
        default_view: settings.defaultView,
        compact_mode: settings.compactMode,
        auto_summarize: settings.autoSummarize,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error in updateUserSettings:', err);
    throw err;
  }
}