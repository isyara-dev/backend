import {supabase} from '../services/supabaseClient.js';

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data: leaderboard, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, point')
      .order('point', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
    
    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getLeaderboard }; 