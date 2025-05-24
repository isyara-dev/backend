import {supabase} from '../services/supabaseClient.js';

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    // Parse limit parameter with validation
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items
    
    // Call the PostgreSQL function
    const { data, error } = await supabase
      .rpc('get_leaderboard', {
        p_limit: limit
      });

    if (error) {
      console.error('Supabase leaderboard error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch leaderboard',
        details: error.message 
      });
    }

    // Return the formatted leaderboard data
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error in getLeaderboard:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

export { getLeaderboard };