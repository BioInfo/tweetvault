import React from 'react';
import { MoreHorizontal, MessageCircle, Repeat, Heart, Bookmark, Share2 } from 'lucide-react';
import { Tweet, Collection } from '../types';

interface TweetCardProps {
  tweet: Tweet;
  collections: Collection[];
  isInCollection?: boolean;
  collectionId?: string;
  onAddToCollection?: (tweetId: string, collectionId: string) => void;
  onRemoveFromCollection?: (tweetId: string, collectionId: string) => void;
  onSelect?: (tweet: Tweet) => void;
  compact?: boolean;
}

export function TweetCard({
  tweet,
  collections,
  isInCollection,
  collectionId,
  onAddToCollection,
  onRemoveFromCollection,
  onSelect,
  compact = false
}: TweetCardProps) {
  const [showCollectionMenu, setShowCollectionMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCollectionMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format the date
  const formattedDate = new Date(tweet.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors ${
        compact ? 'p-4' : 'p-6'
      }`}
      onClick={() => onSelect && onSelect(tweet)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.authorUsername}`}
            alt={tweet.authorName}
            className={`rounded-full bg-gray-100 dark:bg-gray-700 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
          />
          <div>
            <div className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : ''}`}>
              {tweet.authorName}
            </div>
            <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
              @{tweet.authorUsername}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            {formattedDate}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCollectionMenu(!showCollectionMenu);
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>
            
            {showCollectionMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Add to Collection
                  </div>
                  {collections.map(collection => (
                    <button
                      key={collection.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (collection.tweetIds.includes(tweet.id)) {
                          onRemoveFromCollection && onRemoveFromCollection(tweet.id, collection.id);
                        } else {
                          onAddToCollection && onAddToCollection(tweet.id, collection.id);
                        }
                        setShowCollectionMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span>{collection.name}</span>
                      {collection.tweetIds.includes(tweet.id) && (
                        <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                      )}
                    </button>
                  ))}
                  {collections.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No collections yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className={`text-gray-800 dark:text-gray-200 mb-4 ${compact ? 'text-sm' : ''}`}>
        {tweet.text}
      </p>

      {tweet.media && tweet.media.length > 0 && (
        <div className={`mb-4 ${tweet.media.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
          {tweet.media.map((media, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              {media.type === 'photo' && (
                <img
                  src={media.url}
                  alt="Tweet media"
                  className="w-full h-auto object-cover"
                />
              )}
              {media.type === 'video' && (
                <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                  <span className="text-white">Video</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tweet.aiTopics && tweet.aiTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tweet.aiTopics.map((topic) => (
            <span
              key={topic}
              className={`px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {tweet.aiSummary && (
        <div className={`text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          <strong className="text-gray-700 dark:text-gray-300">AI Summary:</strong> {tweet.aiSummary}
        </div>
      )}

      <div className={`flex justify-between text-gray-500 dark:text-gray-400 ${
        compact ? 'text-xs' : 'text-sm'
      }`}>
        <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
          <MessageCircle className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span>{tweet.metrics?.replies || 0}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400">
          <Repeat className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span>{tweet.metrics?.retweets || 0}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400">
          <Heart className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span>{tweet.metrics?.likes || 0}</span>
        </button>
        <button 
          className={`flex items-center gap-1 ${
            isInCollection 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isInCollection && collectionId) {
              onRemoveFromCollection && onRemoveFromCollection(tweet.id, collectionId);
            } else if (collections.length > 0) {
              onAddToCollection && onAddToCollection(tweet.id, collections[0].id);
            }
          }}
        >
          <Bookmark className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${
            isInCollection ? 'fill-current' : ''
          }`} />
        </button>
        <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
          <Share2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </button>
      </div>
    </div>
  );
}