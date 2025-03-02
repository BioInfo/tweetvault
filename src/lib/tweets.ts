import { supabase } from './supabase';
import { Tweet, Collection } from '../types';

/**
 * Save a tweet to the database
 * @param tweet The tweet to save
 * @returns The saved tweet with its database ID
 */
export async function saveTweet(tweet: Tweet): Promise<Tweet> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    // Check if tweet already exists
    const { data: existingTweet } = await supabase
      .from('tweets')
      .select('id')
      .eq('tweet_id', tweet.id)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (existingTweet) {
      // Update existing tweet
      const { data, error } = await supabase
        .from('tweets')
        .update({
          text: tweet.text,
          author_id: tweet.authorId,
          author_name: tweet.authorName,
          author_username: tweet.authorUsername,
          media: tweet.media || null,
          metrics: tweet.metrics || null,
          ai_summary: tweet.aiSummary || null,
          ai_topics: tweet.aiTopics || null,
          ai_entities: tweet.aiEntities || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTweet.id)
        .select('*')
        .single();

      if (error) throw error;
      return mapDbTweetToTweet(data);
    } else {
      // Insert new tweet
      const { data, error } = await supabase
        .from('tweets')
        .insert({
          user_id: user.user.id,
          tweet_id: tweet.id,
          text: tweet.text,
          author_id: tweet.authorId,
          author_name: tweet.authorName,
          author_username: tweet.authorUsername,
          created_at: tweet.createdAt,
          media: tweet.media || null,
          metrics: tweet.metrics || null,
          ai_summary: tweet.aiSummary || null,
          ai_topics: tweet.aiTopics || null,
          ai_entities: tweet.aiEntities || null
        })
        .select('*')
        .single();

      if (error) throw error;
      return mapDbTweetToTweet(data);
    }
  } catch (err) {
    console.error('Error saving tweet:', err);
    throw err;
  }
}

/**
 * Save multiple tweets to the database
 * @param tweets Array of tweets to save
 * @returns Array of saved tweets with their database IDs
 */
export async function saveTweets(tweets: Tweet[]): Promise<Tweet[]> {
  try {
    // Process tweets in batches to avoid hitting rate limits
    const batchSize = 10;
    const results: Tweet[] = [];

    for (let i = 0; i < tweets.length; i += batchSize) {
      const batch = tweets.slice(i, i + batchSize);
      const promises = batch.map(tweet => saveTweet(tweet));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  } catch (err) {
    console.error('Error saving tweets:', err);
    throw err;
  }
}

/**
 * Get all tweets for the current user
 * @returns Array of tweets
 */
export async function getUserTweets(): Promise<Tweet[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapDbTweetToTweet);
  } catch (err) {
    console.error('Error getting user tweets:', err);
    throw err;
  }
}

/**
 * Get a tweet by its ID
 * @param id The tweet ID
 * @returns The tweet or null if not found
 */
export async function getTweetById(id: string): Promise<Tweet | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDbTweetToTweet(data) : null;
  } catch (err) {
    console.error('Error getting tweet by ID:', err);
    throw err;
  }
}

/**
 * Delete a tweet by its ID
 * @param id The tweet ID
 */
export async function deleteTweet(id: string): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('tweets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting tweet:', err);
    throw err;
  }
}

/**
 * Create a new collection
 * @param name Collection name
 * @param description Collection description (optional)
 * @returns The created collection
 */
export async function createCollection(name: string, description?: string): Promise<Collection> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.user.id,
        name,
        description: description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapDbCollectionToCollection(data);
  } catch (err) {
    console.error('Error creating collection:', err);
    throw err;
  }
}

/**
 * Get all collections for the current user
 * @returns Array of collections
 */
export async function getUserCollections(): Promise<Collection[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_tweets (
          tweet_id
        )
      `)
      .eq('user_id', user.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(mapDbCollectionToCollection);
  } catch (err) {
    console.error('Error getting user collections:', err);
    throw err;
  }
}

/**
 * Update a collection
 * @param id Collection ID
 * @param updates Updates to apply
 * @returns The updated collection
 */
export async function updateCollection(
  id: string,
  updates: { name?: string; description?: string }
): Promise<Collection> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('collections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select(`
        *,
        collection_tweets (
          tweet_id
        )
      `)
      .single();

    if (error) throw error;
    return mapDbCollectionToCollection(data);
  } catch (err) {
    console.error('Error updating collection:', err);
    throw err;
  }
}

/**
 * Delete a collection
 * @param id Collection ID
 */
export async function deleteCollection(id: string): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    // First delete all collection_tweets entries
    const { error: junctionError } = await supabase
      .from('collection_tweets')
      .delete()
      .eq('collection_id', id);

    if (junctionError) throw junctionError;

    // Then delete the collection
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting collection:', err);
    throw err;
  }
}

/**
 * Add a tweet to a collection
 * @param collectionId Collection ID
 * @param tweetId Tweet ID
 */
export async function addTweetToCollection(collectionId: string, tweetId: string): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    // Check if the collection belongs to the user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (collectionError) throw collectionError;
    if (!collection) throw new Error('Collection not found');

    // Check if the tweet belongs to the user
    const { data: tweet, error: tweetError } = await supabase
      .from('tweets')
      .select('id')
      .eq('id', tweetId)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (tweetError) throw tweetError;
    if (!tweet) throw new Error('Tweet not found');

    // Add the tweet to the collection
    const { error } = await supabase
      .from('collection_tweets')
      .upsert({
        collection_id: collectionId,
        tweet_id: tweetId,
        added_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update the collection's updated_at timestamp
    await supabase
      .from('collections')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', collectionId);
  } catch (err) {
    console.error('Error adding tweet to collection:', err);
    throw err;
  }
}

/**
 * Remove a tweet from a collection
 * @param collectionId Collection ID
 * @param tweetId Tweet ID
 */
export async function removeTweetFromCollection(collectionId: string, tweetId: string): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    // Check if the collection belongs to the user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (collectionError) throw collectionError;
    if (!collection) throw new Error('Collection not found');

    // Remove the tweet from the collection
    const { error } = await supabase
      .from('collection_tweets')
      .delete()
      .eq('collection_id', collectionId)
      .eq('tweet_id', tweetId);

    if (error) throw error;

    // Update the collection's updated_at timestamp
    await supabase
      .from('collections')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', collectionId);
  } catch (err) {
    console.error('Error removing tweet from collection:', err);
    throw err;
  }
}

/**
 * Get all tweets in a collection
 * @param collectionId Collection ID
 * @returns Array of tweets
 */
export async function getCollectionTweets(collectionId: string): Promise<Tweet[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    // Check if the collection belongs to the user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (collectionError) throw collectionError;
    if (!collection) throw new Error('Collection not found');

    // Get all tweets in the collection
    const { data, error } = await supabase
      .from('collection_tweets')
      .select(`
        tweet_id,
        tweets:tweet_id (*)
      `)
      .eq('collection_id', collectionId);

    if (error) throw error;
    return data.map(item => mapDbTweetToTweet(item.tweets));
  } catch (err) {
    console.error('Error getting collection tweets:', err);
    throw err;
  }
}

/**
 * Search tweets by text, author, or topics
 * @param query Search query
 * @returns Array of matching tweets
 */
export async function searchTweets(query: string): Promise<Tweet[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('user_id', user.user.id)
      .or(`text.ilike.%${query}%,author_name.ilike.%${query}%,author_username.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapDbTweetToTweet);
  } catch (err) {
    console.error('Error searching tweets:', err);
    throw err;
  }
}

// Helper functions to map database objects to application objects

function mapDbTweetToTweet(dbTweet: any): Tweet {
  return {
    id: dbTweet.id,
    text: dbTweet.text,
    authorId: dbTweet.author_id,
    authorName: dbTweet.author_name,
    authorUsername: dbTweet.author_username,
    createdAt: dbTweet.created_at,
    media: dbTweet.media,
    metrics: dbTweet.metrics,
    aiSummary: dbTweet.ai_summary,
    aiTopics: dbTweet.ai_topics,
    aiEntities: dbTweet.ai_entities
  };
}

function mapDbCollectionToCollection(dbCollection: any): Collection {
  return {
    id: dbCollection.id,
    name: dbCollection.name,
    description: dbCollection.description,
    tweetIds: dbCollection.collection_tweets?.map((ct: any) => ct.tweet_id) || [],
    createdAt: dbCollection.created_at,
    updatedAt: dbCollection.updated_at
  };
}