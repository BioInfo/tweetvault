import React from 'react';
import { BookMarked, Home, Search, FolderOpen, BarChart, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { UserSettings } from '../types';

type ActiveView = 'dashboard' | 'search' | 'collections' | 'insights';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenSettings: () => void;
  userSettings: UserSettings;
}

export default function Layout({
  children,
  activeView,
  onNavigate,
  onOpenSettings,
  userSettings
}: LayoutProps) {
  const isDark = userSettings.theme === 'dark' ||
    (userSettings.theme === 'system' && window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <nav className={`w-64 p-4 flex flex-col ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-r`}>
        <div className="flex items-center gap-2 mb-8">
          <BookMarked className="w-8 h-8 text-indigo-600" />
          <h1 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>TweetVault</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          {/* User Profile Section */}
          {user && (
            <div className={`mb-6 p-2 rounded-lg ${
              isDark ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`font-medium truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.email}
                  </p>
                  <p className={`text-sm truncate ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.id.slice(0, 8)}
                  </p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} />
              </button>
              
              {isProfileOpen && (
                <div className="mt-2 space-y-1 pl-14">
                  <button
                    onClick={onOpenSettings}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => signOut()}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
            isDark={isDark}
          />
          <NavItem
            icon={<Search className="w-5 h-5" />}
            label="Search"
            active={activeView === 'search'}
            onClick={() => onNavigate('search')}
            isDark={isDark}
          />
          <NavItem
            icon={<FolderOpen className="w-5 h-5" />}
            label="Collections"
            active={activeView === 'collections'}
            onClick={() => onNavigate('collections')}
            isDark={isDark}
          />
          <NavItem
            icon={<BarChart className="w-5 h-5" />}
            label="Insights"
            active={activeView === 'insights'}
            onClick={() => onNavigate('insights')}
            isDark={isDark}
          />
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  isDark: boolean;
}

function NavItem({ icon, label, active, onClick, isDark }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : isDark
          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}