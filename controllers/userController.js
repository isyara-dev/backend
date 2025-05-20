import { supabase } from '../services/supabaseClient.js';

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, avatar_url, point, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, avatar_url } = req.body;
    
    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
    }
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        username, 
        avatar_url
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getUserById, updateUser }; 