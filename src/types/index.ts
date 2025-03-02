export interface Tweet {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  createdAt: string;
  media?: TweetMedia[];
  metrics?: TweetMetrics;
  aiSummary?: string;
  aiTopics?: string[];
  aiEntities?: string[];
}

export interface TweetMedia {
  type: 'photo' | 'video' | 'gif';
  url: string;
  previewUrl?: string;
}

export interface TweetMetrics {
  likes: number;
  retweets: number;
  replies: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  tweetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  aiGenerated: boolean;
  tweetIds: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SearchFilters {
  topics: string[];
  authors: string[];
  dateRange: DateRange | null;
  minEngagement: number | null;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'dashboard' | 'collections' | 'insights';
  compactMode: boolean;
  autoSummarize: boolean;
}

export interface BulkAction {
  type: 'add' | 'remove' | 'move';
  sourceCollectionId?: string;
  targetCollectionId?: string;
  tweetIds: string[];
}