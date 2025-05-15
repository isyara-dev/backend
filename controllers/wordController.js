import supabase from '../services/supabaseClient.js';

// Get all words
const getAllWords = async (req, res) => {
  try {
    const { data: words, error } = await supabase
      .from('words')
      .select('*');

    if (error) {
      console.error('Error fetching words:', error);
      return res.status(500).json({ error: 'Failed to fetch words' });
    }
    
    return res.status(200).json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Save word attempt
const saveWordAttempt = async (req, res) => {
  return res.status(501).json({ error: 'Not implemented yet' });
};

// Get user's word attempts
const getUserWordAttempts = async (req, res) => {
  return res.status(501).json({ error: 'Not implemented yet' });
};

// Get random word
const getRandomWord = async (req, res) => {
  try {
    console.log('Attempting to fetch random word...');
    
    // Check if words table exists and get count
    const { count, error: countError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking words table:', countError);
      return res.status(500).json({ 
        error: 'Failed to access words table', 
        details: countError.message,
        code: countError.code
      });
    }
    
    console.log(`Found ${count} words in the table`);
    
    if (count === 0) {
      return res.status(404).json({ error: 'No words found in database' });
    }
    
    // Generate random index
    const randomIndex = Math.floor(Math.random() * count);
    console.log(`Selected random index: ${randomIndex}`);
    
    // Get random word
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .range(randomIndex, randomIndex);
    
    if (error) {
      console.error('Error fetching random word:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch random word', 
        details: error.message
      });
    }
    
    if (!words || words.length === 0) {
      return res.status(404).json({ error: 'No word found at selected index' });
    }
    
    console.log('Successfully retrieved random word:', words[0]);
    return res.status(200).json(words[0]);
  } catch (error) {
    console.error('Unexpected error in getRandomWord:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      stack: error.stack
    });
  }
};

// Update user points after successful word completion
const wordSuccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { word_id, points_earned = 1 } = req.body;
    
    if (!word_id) {
      return res.status(400).json({ error: 'Word ID is required' });
    }
    
    // Get current user points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('point')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    
    // Update user points
    const newPoints = (user.point || 0) + points_earned;
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ point: newPoints })
      .eq('id', userId)
      .select('id, point')
      .single();
    
    if (updateError) {
      console.error('Error updating user points:', updateError);
      return res.status(500).json({ error: 'Failed to update user points' });
    }
    
    return res.status(200).json({
      success: true,
      points_earned,
      total_points: updatedUser.point
    });
  } catch (error) {
    console.error('Error in wordSuccess:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAllWords, saveWordAttempt, getUserWordAttempts, getRandomWord, wordSuccess }; 