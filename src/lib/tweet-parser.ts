import { Tweet, TweetMedia, TweetMetrics } from '../types';

/**
 * Parses a Twitter archive JSON export
 * @param jsonData The JSON data from a Twitter archive export
 * @returns An array of parsed tweets
 */
export function parseTwitterArchive(jsonData: string): Tweet[] {
  try {
    const data = JSON.parse(jsonData);
    
    // Twitter archive format can vary, but typically has a "tweets" or "tweet" array
    const tweets = data.tweets || data.tweet || [];
    
    return tweets.map((tweet: any) => sanitizeTweetData(tweet));
  } catch (error) {
    console.error('Error parsing Twitter archive:', error);
    throw new Error('Invalid Twitter archive format');
  }
}

/**
 * Parses a CSV export of tweets
 * @param csvData The CSV data containing tweets
 * @returns An array of parsed tweets
 */
export function parseCsvExport(csvData: string): Tweet[] {
  try {
    // Split by lines and get header row
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Map CSV columns to tweet properties
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const tweet: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        tweet[header] = values[index]?.trim() || '';
      });
      
      return sanitizeTweetData(tweet);
    });
  } catch (error) {
    console.error('Error parsing CSV export:', error);
    throw new Error('Invalid CSV format');
  }
}

/**
 * Parses a markdown export of tweets
 * @param markdownData The markdown data containing tweets
 * @returns An array of parsed tweets
 */
export function parseMarkdownExport(markdownData: string): Tweet[] {
  try {
    // Simple markdown parser - assumes each tweet is separated by a heading
    const tweetBlocks = markdownData.split(/^#{1,6}\s+/m).filter(block => block.trim());
    
    return tweetBlocks.map(block => {
      // Extract tweet data from markdown block
      const lines = block.split('\n').filter(line => line.trim());
      const text = lines[0] || '';
      
      // Try to extract author info from format like "- @username (Name)"
      let authorUsername = '';
      let authorName = '';
      
      const authorLine = lines.find(line => line.startsWith('- @'));
      if (authorLine) {
        const match = authorLine.match(/- @(\w+)(?:\s+\((.+)\))?/);
        if (match) {
          authorUsername = match[1] || '';
          authorName = match[2] || authorUsername;
        }
      }
      
      // Try to extract date
      const dateLine = lines.find(line => line.match(/\d{4}-\d{2}-\d{2}/));
      const dateMatch = dateLine?.match(/(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?)/);
      const createdAt = dateMatch ? dateMatch[1] : new Date().toISOString();
      
      return sanitizeTweetData({
        id: `md_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        text,
        authorUsername,
        authorName,
        authorId: authorUsername,
        createdAt
      });
    });
  } catch (error) {
    console.error('Error parsing markdown export:', error);
    throw new Error('Invalid markdown format');
  }
}

/**
 * Sanitizes tweet data by removing sensitive information and normalizing the format
 * @param rawTweet The raw tweet data
 * @returns A sanitized tweet object
 */
export function sanitizeTweetData(rawTweet: any): Tweet {
  // Generate a unique ID if none exists
  const id = rawTweet.id || rawTweet.id_str || `tweet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Extract text content
  const text = rawTweet.text || rawTweet.full_text || rawTweet.content || '';
  
  // Extract author information
  const authorId = rawTweet.user?.id_str || rawTweet.user?.id || rawTweet.authorId || '';
  const authorName = rawTweet.user?.name || rawTweet.authorName || '';
  const authorUsername = rawTweet.user?.screen_name || rawTweet.authorUsername || '';
  
  // Extract creation date
  const createdAt = rawTweet.created_at || rawTweet.createdAt || new Date().toISOString();
  
  // Extract media if available
  const media: TweetMedia[] = [];
  if (rawTweet.entities?.media) {
    rawTweet.entities.media.forEach((m: any) => {
      media.push({
        type: m.type || 'photo',
        url: m.media_url_https || m.media_url || m.url || '',
        previewUrl: m.url || ''
      });
    });
  }
  
  // Extract metrics if available
  const metrics: TweetMetrics = {
    likes: rawTweet.favorite_count || rawTweet.likes || 0,
    retweets: rawTweet.retweet_count || rawTweet.retweets || 0,
    replies: rawTweet.reply_count || rawTweet.replies || 0
  };
  
  // Remove any sensitive information
  // This is a basic implementation - a more comprehensive approach would be needed for production
  const sensitiveFields = [
    'email', 'phone', 'address', 'location', 'coordinates', 'geo',
    'place', 'contributors', 'user_id', 'in_reply_to_user_id'
  ];
  
  // Return sanitized tweet
  return {
    id,
    text,
    authorId,
    authorName,
    authorUsername,
    createdAt,
    media: media.length > 0 ? media : undefined,
    metrics,
    // These fields will be populated by AI processing later
    aiSummary: undefined,
    aiTopics: undefined,
    aiEntities: undefined
  };
}

/**
 * Detects the format of the imported data
 * @param data The imported data as a string
 * @returns The detected format ('json', 'csv', 'markdown', or 'unknown')
 */
export function detectImportFormat(data: string): 'json' | 'csv' | 'markdown' | 'unknown' {
  // Check if it's JSON
  try {
    JSON.parse(data);
    return 'json';
  } catch (e) {
    // Not JSON, continue checking
  }
  
  // Check if it's CSV (has commas and newlines, first row looks like headers)
  if (data.includes(',') && data.includes('\n')) {
    const firstLine = data.split('\n')[0];
    const potentialHeaders = firstLine.split(',');
    
    // If we have multiple comma-separated values that look like headers
    if (potentialHeaders.length > 3 && 
        potentialHeaders.some(h => /id|text|content|tweet|author|user|date|created/i.test(h))) {
      return 'csv';
    }
  }
  
  // Check if it's Markdown (has headings, bullet points)
  if (data.match(/^#{1,6}\s+/m) || data.match(/^\s*[-*]\s+/m)) {
    return 'markdown';
  }
  
  // Unknown format
  return 'unknown';
}

/**
 * Parses imported data based on its detected format
 * @param data The imported data as a string
 * @returns An array of parsed tweets
 */
export function parseImportedData(data: string): Tweet[] {
  const format = detectImportFormat(data);
  
  switch (format) {
    case 'json':
      return parseTwitterArchive(data);
    case 'csv':
      return parseCsvExport(data);
    case 'markdown':
      return parseMarkdownExport(data);
    default:
      throw new Error('Unsupported import format. Please use JSON, CSV, or Markdown.');
  }
}