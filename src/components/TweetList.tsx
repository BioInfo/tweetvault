import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Calendar, User, Tag, X } from 'lucide-react';
import { Tweet, Collection, SearchFilters } from '../types';
import { TweetCard } from './TweetCard';

interface TweetListProps {
  tweets: Tweet[];
  collections: Collection[];
  activeCollection?: Collection | null;
  onAddToCollection: (tweetId: string, collectionId: string) => void;
  onRemoveFromCollection: (tweetId: string, collectionId: string) => void;
  onSelectTweet: (tweet: Tweet) => void;
}

export function TweetList({
  tweets,
  collections,
  activeCollection,
  onAddToCollection,
  onRemoveFromCollection,
  onSelectTweet
}: TweetListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [filters, setFilters] = useState<SearchFilters>({
    topics: [],
    authors: [],
    dateRange: null,
    minEngagement: null
  });

  // Extract unique authors and topics for filters
  const uniqueAuthors = useMemo(() => {
    const authors = new Set<string>();
    tweets.forEach(tweet => {
      if (tweet.authorUsername) {
        authors.add(tweet.authorUsername);
      }
    });
    return Array.from(authors);
  }, [tweets]);

  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>();
    tweets.forEach(tweet => {
      if (tweet.aiTopics) {
        tweet.aiTopics.forEach(topic => topics.add(topic));
      }
    });
    return Array.from(topics);
  }, [tweets]);

  // Filter and sort tweets
  const filteredTweets = useMemo(() => {
    return tweets
      .filter(tweet => {
        // Search query filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || (
          tweet.text.toLowerCase().includes(searchLower) ||
          tweet.authorName.toLowerCase().includes(searchLower) ||
          tweet.authorUsername.toLowerCase().includes(searchLower) ||
          tweet.aiTopics?.some(topic => topic.toLowerCase().includes(searchLower)) ||
          tweet.aiSummary?.toLowerCase().includes(searchLower)
        );

        // Topic filter
        const matchesTopics = filters.topics.length === 0 || 
          filters.topics.some(topic => tweet.aiTopics?.includes(topic));
        
        // Author filter
        const matchesAuthors = filters.authors.length === 0 ||
          filters.authors.includes(tweet.authorUsername);
        
        // Date range filter
        const matchesDateRange = !filters.dateRange ||
          (new Date(tweet.createdAt) >= filters.dateRange.start &&
           new Date(tweet.createdAt) <= filters.dateRange.end);
        
        // Engagement filter
        const totalEngagement = (tweet.metrics?.likes || 0) +
          (tweet.metrics?.retweets || 0) +
          (tweet.metrics?.replies || 0);
        
        const matchesEngagement = !filters.minEngagement ||
          totalEngagement >= filters.minEngagement;

        return matchesSearch && matchesTopics && matchesAuthors && 
               matchesDateRange && matchesEngagement;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortOrder === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else {
          // Sort by popularity (total engagement)
          const engagementA = (a.metrics?.likes || 0) + (a.metrics?.retweets || 0) + (a.metrics?.replies || 0);
          const engagementB = (b.metrics?.likes || 0) + (b.metrics?.retweets || 0) + (b.metrics?.replies || 0);
          return engagementB - engagementA;
        }
      });
  }, [tweets, searchQuery, filters, sortOrder]);

  const clearFilters = () => {
    setFilters({
      topics: [],
      authors: [],
      dateRange: null,
      minEngagement: null
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tweets..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md border ${
              showFilters || Object.values(filters).some(f => 
                Array.isArray(f) ? f.length > 0 : f !== null
              )
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : sortOrder === 'oldest' ? 'popular' : 'newest')}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {sortOrder === 'newest' && <SortDesc className="h-5 w-5" />}
              {sortOrder === 'oldest' && <SortAsc className="h-5 w-5" />}
              {sortOrder === 'popular' && <span className="text-sm font-medium">🔥</span>}
            </button>
            <div className="absolute bottom-full mb-2 right-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {sortOrder === 'newest' ? 'Newest first' : sortOrder === 'oldest' ? 'Oldest first' : 'Most popular'}
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              {/* Topics Filter */}
              <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>Topics</span>
                  </div>
                </label>
                <select
                  multiple
                  value={filters.topics}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    topics: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  size={3}
                >
                  {uniqueTopics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Authors Filter */}
              <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Authors</span>
                  </div>
                </label>
                <select
                  multiple
                  value={filters.authors}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    authors: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  size={3}
                >
                  {uniqueAuthors.map(author => (
                    <option key={author} value={author}>@{author}</option>
                  ))}
                </select>
              </div>

              {/* Min Engagement Filter */}
              <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-1">
                    <span>🔥</span>
                    <span>Min. Engagement</span>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minEngagement || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minEngagement: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter minimum engagement"
                />
              </div>

              {/* Date Range Filter - Simplified for now */}
              <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Date Range</span>
                  </div>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        start: e.target.value ? new Date(e.target.value) : new Date(0),
                        end: prev.dateRange?.end || new Date()
                      }
                    }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="date"
                    value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        start: prev.dateRange?.start || new Date(0),
                        end: e.target.value ? new Date(e.target.value) : new Date()
                      }
                    }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTweets.length} of {tweets.length} tweets
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tweet List */}
      {filteredTweets.length > 0 ? (
        <div className="space-y-4">
          {filteredTweets.map(tweet => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              collections={collections}
              isInCollection={activeCollection?.tweetIds.includes(tweet.id)}
              collectionId={activeCollection?.id}
              onAddToCollection={onAddToCollection}
              onRemoveFromCollection={onRemoveFromCollection}
              onSelect={onSelectTweet}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">No tweets found</div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {tweets.length > 0
              ? 'Try adjusting your search or filters'
              : 'Import tweets to get started'}
          </p>
        </div>
      )}
    </div>
  );
}