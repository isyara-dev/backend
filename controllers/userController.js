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
    const { id } = req.params;
    const { username, name, avatar_url, email, password } = req.body;

    console.log('\n🔧 [updateUser] - Masuk controller');
    console.log('➡️ Request param ID:', id);
    console.log('➡️ Authenticated user ID from token:', req.user?.id);
    console.log('➡️ Request body:', req.body);

    if (req.user.id !== id) {
      console.warn('⛔ Akses ditolak: user tidak boleh update data user lain');
      return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
    }

    // Ambil data user dari database (tabel custom `users`)
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Lebih aman saat debug

    if (fetchError) {
      console.error('❌ Gagal fetch user dari DB:', fetchError.message);
      return res.status(500).json({ error: 'Failed to fetch current user data' });
    }

    if (!currentUser) {
      console.warn('⚠️ User tidak ditemukan di tabel `users`:', id);
      return res.status(404).json({ error: 'User not found in custom table' });
    }

    console.log('✅ User ditemukan:', currentUser);

    // Siapkan data yang akan diupdate
    const updateData = {};
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (avatar_url) updateData.avatar_url = avatar_url;
    updateData.updated_at = new Date().toISOString();

    // Update email/password jika metode login email
    if (currentUser.login_method === 'email') {
      if (email && email !== currentUser.email) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({ email });
        if (emailUpdateError) {
          console.error('❌ Gagal update email di Auth:', emailUpdateError.message);
          return res.status(500).json({ error: 'Failed to update email in Auth' });
        }
        updateData.email = email;
      }

      if (password) {
        const { error: passwordUpdateError } = await supabase.auth.updateUser({ password });
        if (passwordUpdateError) {
          console.error('❌ Gagal update password:', passwordUpdateError.message);
          return res.status(500).json({ error: 'Failed to update password' });
        }
      }
    }

    // Update ke tabel `users`
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle(); // Hindari error saat rows kosong

    if (updateError) {
      console.error('❌ Gagal update data user:', updateError.message);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    console.log('✅ Berhasil update user:', updatedUser);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('🔥 Internal error di updateUser:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getUserById, updateUser }; 