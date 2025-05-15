import supabase from '../services/supabaseClient.js';

// Get current user profile (requires auth via middleware)
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
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
    console.error('Error in getMe:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle user data after Google OAuth login
const saveUserData = async (req, res) => {
  try {
    // Data dari frontend setelah login Google
    const { id, email, username, avatar_url } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }
    
    // Cek apakah user sudah ada
    let { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding user:', findError);
      return res.status(500).json({ error: 'Database error when finding user' });
    }
    
    // Jika user belum ada, buat baru
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          { 
            id, 
            email, 
            username: username || email.split('@')[0], 
            avatar_url,
            point: 0,
            login_method: 'google',
            created_at: new Date()
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      return res.status(201).json(newUser);
    }
    
    // Jika user sudah ada, update data jika perlu
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        username: username || existingUser.username,
        avatar_url: avatar_url || existingUser.avatar_url,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error saving user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Register user manually (if not using Supabase Auth UI)
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) {
      console.error('Error registering user:', authError);
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email, 
          username: username || email.split('@')[0],
          point: 0,
          login_method: 'manual',
          created_at: new Date()
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating user record:', userError);
      return res.status(500).json({ error: 'Failed to create user record' });
    }
    
    return res.status(201).json(userData);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getMe, saveUserData, register };
