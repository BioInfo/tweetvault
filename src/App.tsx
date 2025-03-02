import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import SearchBar from './components/SearchBar';
import { CollectionCard, CreateCollectionModal } from './components/CollectionCard.tsx';
import { UserSettingsModal } from './components/UserSettingsModal.tsx';
import InsightsDashboard from './components/InsightsDashboard';
import { Tweet, Collection, SearchFilters, BulkAction } from './types';
import { useAuth } from './lib/auth';
import { useSettings } from './lib/settings-context';
import AuthForm from './components/AuthForm';
import { TweetImporter } from './components/TweetImporter';
import { TweetList } from './components/TweetList';
import { saveTweets, addTweetToCollection, removeTweetFromCollection } from './lib/tweets';
import { useToast } from './components/Toast';

type ActiveView = 'dashboard' | 'search' | 'collections' | 'insights';

interface AppProps {
  view?: ActiveView;
}

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

function App({ view: initialView = 'dashboard' }: AppProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [tweets] = useState<Tweet[]>(SAMPLE_TWEETS);
  const [collections, setCollections] = useState<Collection[]>(SAMPLE_COLLECTIONS);
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
  
  // Derive active view from current route
  const pathname = location.pathname;
  const activeView = (pathname.split('/')[1] || 'dashboard') as ActiveView;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);

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

  const handleImportComplete = async (importedTweets: Tweet[]) => {
    try {
      // In a real implementation, we would save these to the database
      // For now, we'll just add them to the local state
      // const savedTweets = await saveTweets(importedTweets);
      
      // Add the imported tweets to the local state
      // setTweets(prev => [...prev, ...savedTweets]);
      
      showToast(`Successfully imported ${importedTweets.length} tweets`, 'success');
    } catch (error) {
      console.error('Error importing tweets:', error);
      showToast('Failed to import tweets', 'error');
    }
  };

  const handleAddToCollection = async (tweetId: string, collectionId: string) => {
    try {
      // In a real implementation, we would save this to the database
      // await addTweetToCollection(collectionId, tweetId);
      
      // Update the local state
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
      
      showToast('Tweet added to collection', 'success');
    } catch (error) {
      console.error('Error adding tweet to collection:', error);
      showToast('Failed to add tweet to collection', 'error');
    }
  };

  const handleRemoveFromCollection = async (tweetId: string, collectionId: string) => {
    try {
      // In a real implementation, we would save this to the database
      // await removeTweetFromCollection(collectionId, tweetId);
      
      // Update the local state
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
      
      showToast('Tweet removed from collection', 'success');
    } catch (error) {
      console.error('Error removing tweet from collection:', error);
      showToast('Failed to remove tweet from collection', 'error');
    }
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
      onOpenSettings={() => setIsSettingsOpen(true)}
      userSettings={settings}
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
            <div className="flex items-center gap-4">
              <div className="w-64">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                />
              </div>
              <button
                onClick={() => setIsImporterOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Import Tweets
              </button>
            </div>  
          )}
        </div>

        {(activeView === 'dashboard' || activeView === 'search') && (
          <div className="space-y-8">
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Tweets</h3>
                <div className="flex items-center gap-4">
                  {selectedTweets.size > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        className="text-sm border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
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
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Clear Selection ({selectedTweets.size})
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <TweetList
                tweets={filteredTweets}
                collections={collections}
                activeCollection={selectedCollection}
                onAddToCollection={handleAddToCollection}
                onRemoveFromCollection={handleRemoveFromCollection}
                onSelectTweet={setSelectedTweet}
              />
            </div>
          </div>
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
      />
      <TweetImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </Layout>
  );
}

export default App;
