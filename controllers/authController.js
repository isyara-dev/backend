import { supabase, supabaseAdmin } from '../services/supabaseClient.js';

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

    // Ambil skor dari tabel `user_scores`
    const { data: scoreData, error: scoreError } = await supabase
      .from('user_scores')
      .select('score')
      .eq('user_id', userId)
      .maybeSingle();

    const score = scoreData?.score || 0; // Default ke 0 kalau belum ada data skor

    // Gabungkan data user + score
    return res.status(200).json({ ...user, score });
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

    // TAMBAHKAN LOG untuk debugging
    console.log('Attempting to save user:', { id, email, username });

    // Cek apakah user sudah ada (gunakan supabaseAdmin untuk konsistensi)
    let { data: existingUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    console.log('Existing user check result:', { existingUser, findError });

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding user:', findError);
      return res.status(500).json({ error: 'Database error when finding user' });
    }

    // Jika user sudah ada, langsung kembalikan data user
    if (existingUser) {
      console.log('User already exists, returning existing user');
      return res.status(200).json(existingUser);
    }

    // Implementasi upsert sebagai gantinya
    const { data: upsertedUser, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(
        [
          {
            id,
            email,
            username: username || email.split('@')[0],
            avatar_url,
            point: 0,
            login_method: 'google',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        {
          onConflict: 'id', // Jika konflik pada id
          ignoreDuplicates: false, // Update jika sudah ada
        }
      )
      .select()
      .single();

    console.log('Upsert result:', { upsertedUser, upsertError });

    if (upsertError) {
      console.error('Error upserting user:', upsertError);
      return res.status(500).json({ error: 'Failed to save user data', details: upsertError });
    }

    return res.status(200).json(upsertedUser);
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
      return res
        .status(400)
        .json({ error: 'Username can only contain letters, numbers, and underscores' });
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
          login_method: 'email',
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { user } = authData;

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: user.id,
          email,
          username,
          name: username,
          login_method: 'email',
          created_at: new Date(),
        },
      ])
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
        name: userData.name,
      },
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

    // Otentikasi dengan Supabase untuk mendapatkan token
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    let { user, session } = authData;

    // Dapatkan data user dari database
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!userData) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            username: user.email.split('@')[0],
            name: user.email.split('@')[0],
            login_method: 'email',
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to recreate user data' });
      }

      userData = newUser;
    }

    // Kembalikan data user dan token Supabase yang diperlukan
    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        avatar_url: userData.avatar_url,
      },
      // Berikan semua data token Supabase yang diperlukan
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      // Tambahkan seluruh session jika diperlukan
      supabase_session: session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getMe, saveUserData, register, login };
