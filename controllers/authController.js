import {supabase, supabaseAdmin} from '../services/supabaseClient.js';

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

// Register with email
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          login_method: 'email'
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { user } = authData;

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: user.id,
        email,
        username,
        name: username,
        login_method: 'email',
        created_at: new Date()
      }])
      .select()
      .single();

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id); // pakai supabaseAdmin karena perlu service role
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    return res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Login with email
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    let { user } = authData;

    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!userData) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          username: user.email.split('@')[0],
          name: user.email.split('@')[0],
          login_method: 'email',
          created_at: new Date()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to recreate user data' });
      }

      userData = newUser;
    }

    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        avatar_url: userData.avatar_url
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, name, avatar_url, password } = req.body;
    
    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
    
    // If user logged in with Google, prevent password update
    if (currentUser.login_method === 'google' && password) {
      return res.status(403).json({ error: 'Password cannot be updated for Google login users' });
    }
    
    // Update password if provided and user is not using Google login
    if (password && currentUser.login_method !== 'google') {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (passwordError) {
        console.error('Error updating password:', passwordError);
        return res.status(400).json({ error: passwordError.message });
      }
    }
    
    // Update user profile in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        username: username || currentUser.username,
        name: name || currentUser.name,
        avatar_url: avatar_url || currentUser.avatar_url,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getMe, saveUserData, register, login, updateProfile };
