import { supabase, supabaseAdmin } from '../services/supabaseClient.js';

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
    const userId = req.user?.id;
    const { username, name, avatar_url, email, password } = req.body;

    console.log('\n🔧 [updateUser] - Masuk controller');
    console.log('➡️ Authenticated user ID from token:', userId);
    console.log('➡️ Request body:', req.body);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    // Ambil data user dari DB
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Gagal fetch user dari DB:', fetchError.message);
      return res.status(500).json({ error: 'Failed to fetch current user data' });
    }

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found in custom table' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (avatar_url) updateData.avatar_url = avatar_url;
    updateData.updated_at = new Date().toISOString();

    if (currentUser.login_method === 'email') {
      if (email && email !== currentUser.email) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({ email });
        if (emailUpdateError) {
          return res.status(500).json({ error: 'Failed to update email in Auth' });
        }
        updateData.email = email;
      }

      if (password) {
        const { error: passwordUpdateError } = await supabase.auth.updateUser({ password });
        if (passwordUpdateError) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
      }
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('🔥 Internal error di updateUser:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getUserById, updateUser };
