import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SearchBar from './components/SearchBar';
import { CollectionCard, CreateCollectionModal } from './components/CollectionCard';
import { UserSettingsModal } from './components/UserSettingsModal.tsx';
import InsightsDashboard from './components/InsightsDashboard';
import { Tweet, Collection, SearchFilters, UserSettings, BulkAction } from './types';
import { useAuth } from './lib/auth';
import AuthForm from './components/AuthForm';
import { getUserSettings } from './lib/settings';

type ActiveView = 'dashboard' | 'search' | 'collections' | 'insights';

const SAMPLE_TWEETS: Tweet[] = [
  {
    id: '1',
    text: 'Just launched TweetVault - your AI-powered bookmark manager for Twitter! 🚀 Save, organize, and discover insights from your favorite tweets.',
    authorId: '123',
    authorName: 'Sarah Chen',
    authorUsername: 'sarahchen',
    createdAt: '2024-03-15T10:00:00Z',
    aiTopics: ['Product Launch', 'AI', 'Twitter'],
    aiSummary: 'Announcement of TweetVault launch, an AI-powered Twitter bookmark manager.',
    metrics: {
      likes: 142,
      retweets: 28,
      replies: 12
    }
  },
  {
    id: '2',
    text: 'The future of AI is not about replacing humans, but augmenting human capabilities. We need to focus on creating tools that enhance our natural abilities while maintaining ethical boundaries.',
    authorId: '456',
    authorName: 'Alex Rivera',
    authorUsername: 'arivera_ai',
    createdAt: '2024-03-14T15:30:00Z',
    aiTopics: ['Artificial Intelligence', 'Ethics', 'Future of Work'],
    aiSummary: 'Discussion about AI augmenting human capabilities rather than replacement, emphasizing ethical considerations.',
    metrics: {
      likes: 892,
      retweets: 156,
      replies: 45
    }
  }
];

const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: '1',
    name: 'AI & Technology',
    description: 'Latest insights on artificial intelligence and tech trends',
    tweetIds: ['2'],
    createdAt: '2024-03-14T00:00:00Z',
    updatedAt: '2024-03-14T15:30:00Z'
  },
  {
    id: '2',
    name: 'Product Launches',
    description: 'Tracking interesting product announcements',
    tweetIds: ['1'],
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  }
];

function App() {
  const { user, loading } = useAuth();
  const [tweets] = useState<Tweet[]>(SAMPLE_TWEETS);
  const [collections] = useState<Collection[]>(SAMPLE_COLLECTIONS);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTweets, setSelectedTweets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    topics: [],
    authors: [],
    dateRange: null,
    minEngagement: null
  });
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const defaultSettings: UserSettings = {
    theme: 'system',
    defaultView: 'dashboard',
    compactMode: false,
    autoSummarize: true
  };

  useEffect(() => {
    if (user) {
      getUserSettings().then(settings => {
        setUserSettings(settings || defaultSettings);
      });
    }
  }, [user]);

  // Get unique authors and topics for filters
  const uniqueAuthors = Array.from(new Set(tweets.map(tweet => tweet.authorUsername)));
  const uniqueTopics = Array.from(new Set(tweets.flatMap(tweet => tweet.aiTopics || [])));

  const filteredTweets = tweets.filter(tweet => {
    const searchLower = searchQuery.toLowerCase();
    
    // Search query matching
    const matchesSearch = !searchQuery || (
      tweet.text.toLowerCase().includes(searchLower)
      || tweet.authorName.toLowerCase().includes(searchLower)
      || tweet.authorUsername.toLowerCase().includes(searchLower)
      || tweet.aiTopics?.some(topic => topic.toLowerCase().includes(searchLower))
      || tweet.aiSummary?.toLowerCase().includes(searchLower)
    );

    // Filter matching
    const matchesTopics = searchFilters.topics.length === 0 || 
      searchFilters.topics.some(topic => tweet.aiTopics?.includes(topic));
    
    const matchesAuthors = searchFilters.authors.length === 0 ||
      searchFilters.authors.includes(tweet.authorUsername);
    
    const matchesDateRange = !searchFilters.dateRange ||
      (new Date(tweet.createdAt) >= searchFilters.dateRange.start &&
       new Date(tweet.createdAt) <= searchFilters.dateRange.end);
    
    const totalEngagement = (tweet.metrics?.likes || 0) +
      (tweet.metrics?.retweets || 0) +
      (tweet.metrics?.replies || 0);
    
    const matchesEngagement = !searchFilters.minEngagement ||
      totalEngagement >= searchFilters.minEngagement;

    return matchesSearch && matchesTopics && matchesAuthors && 
           matchesDateRange && matchesEngagement;
  });
  
  const handleCreateCollection = (name: string, description: string) => {
    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      name,
      description,
      tweetIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCollections(prev => [...prev, newCollection]);
    setIsCreateModalOpen(false);
  };

  const handleAddToCollection = (collectionId: string, tweetId: string) => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId && !collection.tweetIds.includes(tweetId)) {
        return {
          ...collection,
          tweetIds: [...collection.tweetIds, tweetId],
          updatedAt: new Date().toISOString()
        };
      }
      return collection;
    }));
  };

  const handleRemoveFromCollection = (collectionId: string, tweetId: string) => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          tweetIds: collection.tweetIds.filter(id => id !== tweetId),
          updatedAt: new Date().toISOString()
        };
      }
      return collection;
    }));
  };

  const handleBulkAction = (action: BulkAction) => {
    if (action.type === 'add' && action.targetCollectionId) {
      setCollections(prev => prev.map(collection => {
        if (collection.id === action.targetCollectionId) {
          const newTweetIds = [...new Set([...collection.tweetIds, ...action.tweetIds])];
          return {
            ...collection,
            tweetIds: newTweetIds,
            updatedAt: new Date().toISOString()
          };
        }
        return collection;
      }));
    } else if (action.type === 'remove' && action.sourceCollectionId) {
      setCollections(prev => prev.map(collection => {
        if (collection.id === action.sourceCollectionId) {
          return {
            ...collection,
            tweetIds: collection.tweetIds.filter(id => !action.tweetIds.includes(id)),
            updatedAt: new Date().toISOString()
          };
        }
        return collection;
      }));
    }
    setSelectedTweets(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Layout
      activeView={activeView}
      onNavigate={setActiveView}
      onOpenSettings={() => setIsSettingsOpen(true)}
      userSettings={userSettings || defaultSettings}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeView === 'dashboard' && 'Recent Bookmarks'}
              {activeView === 'search' && 'Search Tweets'}
              {activeView === 'collections' && 'Collections'}
              {activeView === 'insights' && 'Analytics Dashboard'}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeView === 'dashboard' && 'Your latest saved tweets with AI-powered insights'}
              {activeView === 'search' && 'Find specific tweets in your vault'}
              {activeView === 'collections' && 'Organize your tweets into collections'}
              {activeView === 'insights' && 'Discover patterns in your saved tweets'}
            </p>
          </div>
          {(activeView === 'dashboard' || activeView === 'search') && (
            <div className="w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
            </div>
          )}
        </div>

        {(activeView === 'dashboard' || activeView === 'search') && (
          <>
            {/* Search Filters */}
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                  <select
                    multiple
                    value={searchFilters.topics}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      topics: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full rounded-lg border-gray-200 text-sm"
                  >
                    {uniqueTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                  <select
                    multiple
                    value={searchFilters.authors}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      authors: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full rounded-lg border-gray-200 text-sm"
                  >
                    {uniqueAuthors.map(author => (
                      <option key={author} value={author}>@{author}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Engagement</label>
                  <input
                    type="number"
                    min="0"
                    value={searchFilters.minEngagement || ''}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      minEngagement: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="w-full rounded-lg border-gray-200 text-sm"
                    placeholder="Enter minimum engagement"
                  />
                </div>
                <button
                  onClick={() => setSearchFilters({
                    topics: [],
                    authors: [],
                    dateRange: null,
                    minEngagement: null
                  })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Collections Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Collections</h3>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  New Collection
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    selected={selectedCollection?.id === collection.id}
                    onSelect={() => setSelectedCollection(
                      selectedCollection?.id === collection.id ? null : collection
                    )}
                    onDelete={() => setCollections(prev => 
                      prev.filter(c => c.id !== collection.id)
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Tweets List */}
            <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">All Tweets</h3>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                Showing {filteredTweets.length} of {tweets.length} tweets
              </p>
              {selectedTweets.size > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    className="text-sm border-gray-200 rounded-lg"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkAction({
                          type: 'add',
                          targetCollectionId: e.target.value,
                          tweetIds: Array.from(selectedTweets)
                        });
                      }
                    }}
                  >
                    <option value="">Add to Collection...</option>
                    {collections.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedTweets(new Set())}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Selection ({selectedTweets.size})
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredTweets.map((tweet) => (
            <div
              key={tweet.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.authorUsername}`}
                    alt={tweet.authorName}
                    className="w-10 h-10 rounded-full bg-gray-100"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{tweet.authorName}</div>
                    <div className="text-gray-500">@{tweet.authorUsername}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(tweet.createdAt).toLocaleDateString()}
                </div>
              </div>

              <p className="text-gray-800 mb-4">{tweet.text}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {tweet.aiTopics?.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <strong className="text-gray-700">AI Summary:</strong> {tweet.aiSummary}
              </div>

              <div className="flex gap-6 mt-4 text-sm text-gray-500">
                <div>❤️ {tweet.metrics?.likes}</div>
                <div>🔄 {tweet.metrics?.retweets}</div>
                <div className="flex items-center gap-2">
                  <div>💬 {tweet.metrics?.replies}</div>
                  <input
                    type="checkbox"
                    checked={selectedTweets.has(tweet.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedTweets);
                      if (e.target.checked) {
                        newSelected.add(tweet.id);
                      } else {
                        newSelected.delete(tweet.id);
                      }
                      setSelectedTweets(newSelected);
                    }}
                    className="ml-2"
                  />
                </div>
                <div className="ml-auto">
                  {selectedCollection ? (
                    selectedCollection.tweetIds.includes(tweet.id) ? (
                      <button
                        onClick={() => handleRemoveFromCollection(selectedCollection.id, tweet.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove from Collection
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCollection(selectedCollection.id, tweet.id)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Add to Collection
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          ))}
            </div>
          </>
        )}

        {activeView === 'collections' && (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                selected={selectedCollection?.id === collection.id}
                onSelect={() => setSelectedCollection(
                  selectedCollection?.id === collection.id ? null : collection
                )}
                onDelete={() => setCollections(prev => 
                  prev.filter(c => c.id !== collection.id)
                )}
              />
            ))}
          </div>
        )}

        {activeView === 'insights' && (
          <InsightsDashboard tweets={tweets} />
        )}
      </div>
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCollection}
      />
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings || defaultSettings}
        onSave={setUserSettings}
      />
    </Layout>
  );
}

export default App;
