import { supabase } from '../utils/supabase';

/**
 * Save a new score to the database
 * @param {Object} params - Score parameters
 * @param {string} params.userId - User ID
 * @param {number} params.score - Score value
 * @returns {Promise<Object>} - The saved score data
 */
export async function saveScore({ userId, score }) {
  try {
    if (!userId) {
      throw new Error('User ID is required to save a score');
    }
    
    if (typeof score !== 'number' || isNaN(score)) {
      throw new Error('Score must be a valid number');
    }
    
    const { data, error } = await supabase
      .from('scores')
      .insert([{ 
        user_id: userId, 
        score
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    console.log('Score saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

/**
 * Fetch the global leaderboard
 * @param {Object} [params] - Fetch parameters
 * @param {number} [params.limit=10] - Maximum number of scores to fetch
 * @param {number} [params.offset=0] - Offset for pagination
 * @param {boolean} [params.includeUserDetails=true] - Whether to include user profile details
 * @returns {Promise<Array>} - Array of leaderboard entries
 */
export async function fetchLeaderboard({ 
  limit = 10, 
  offset = 0, 
  includeUserDetails = true
} = {}) {
  try {
    let query = supabase
      .from('scores')
      .select(
        includeUserDetails 
          ? 'id, score, created_at, profiles:user_id(username, avatar_url)' 
          : 'id, score, user_id, created_at'
      )
      .order('score', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
      
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

/**
 * Fetch a user's personal high scores
 * @param {Object} params - Fetch parameters
 * @param {string} params.userId - User ID
 * @param {number} [params.limit=10] - Maximum number of scores to fetch
 * @returns {Promise<Array>} - Array of user's high scores
 */
export async function fetchUserScores({ userId, limit = 10 }) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch user scores');
    }
    
    let query = supabase
      .from('scores')
      .select('id, score, created_at')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(limit);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user scores:', error);
    throw error;
  }
}

/**
 * Get a user's highest score
 * @param {Object} params - Fetch parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object|null>} - The user's highest score or null if no scores
 */
export async function getUserHighScore({ userId }) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch user high score');
    }
    
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, created_at')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      // If no rows returned, that's not an error for us
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user high score:', error);
    throw error;
  }
}

/**
 * Check if a score would make it onto the leaderboard
 * @param {Object} params - Check parameters
 * @param {number} params.score - Score to check
 * @param {number} [params.leaderboardSize=10] - Size of leaderboard to check against
 * @returns {Promise<boolean>} - Whether the score would make the leaderboard
 */
export async function isLeaderboardWorthy({ score, leaderboardSize = 10 }) {
  try {
    // Get the lowest score on the current leaderboard
    const { data, error } = await supabase
      .from('scores')
      .select('score')
      .order('score', { ascending: true })
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    
    // If there are fewer than leaderboardSize scores, any score is leaderboard worthy
    if (!data) return true;
    
    // Get count of scores
    const { count, error: countError } = await supabase
      .from('scores')
      .select('id', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    // If leaderboard isn't full yet, any score qualifies
    if (count < leaderboardSize) return true;
    
    // Otherwise, check if this score is higher than the lowest on the board
    return score > data.score;
  } catch (error) {
    console.error('Error checking if score is leaderboard worthy:', error);
    throw error;
  }
}

if (typeof window !== 'undefined') {
  window.scoresApi = {
    saveScore,
    fetchLeaderboard,
    fetchUserScores,
    getUserHighScore,
    isLeaderboardWorthy,
  };
}
