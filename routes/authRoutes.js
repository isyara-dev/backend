import express from 'express';
import * as authController from '../controllers/authController.js';
import verifyUser from '../middlewares/verifyUser.js';
import supabase from '../services/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Public route - Untuk frontend setelah login Google
router.post('/save-user', authController.saveUserData);

// Protected route - Memerlukan token
router.get('/me', verifyUser, authController.getMe);

// Endpoint untuk testing tanpa frontend
router.post('/test-google-user', async (req, res) => {
  try {
    // Gunakan UUID valid untuk testing
    const testUser = {
      id: req.body.id || uuidv4(), // Generate UUID jika tidak ada
      email: req.body.email || 'test.google@example.com',
      username: req.body.username || 'Google Test User',
      avatar_url: req.body.avatar_url || 'https://lh3.googleusercontent.com/test-avatar.jpg'
    };
    
    console.log('Testing with user data:', testUser);
    
    // Cek apakah user sudah ada
    let { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .maybeSingle();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding user:', findError);
      return res.status(500).json({ error: 'Database error when finding user' });
    }
    
    // Simpan user jika belum ada
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: testUser.id,
          email: testUser.email,
          username: testUser.username,
          avatar_url: testUser.avatar_url,
          point: 0,
          login_method: 'google',
          created_at: new Date()
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create test user', details: createError.message });
      }
      
      return res.status(201).json({
        message: 'New user created successfully',
        user: newUser
      });
    }
    
    // Update user jika sudah ada
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        username: testUser.username,
        avatar_url: testUser.avatar_url,
        updated_at: new Date()
      })
      .eq('id', testUser.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return res.status(500).json({ error: 'Failed to update user', details: updateError.message });
    }
    
    return res.status(200).json({
      message: 'Existing user updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// Endpoint untuk simulasi data user Google setelah auth
router.get('/test-google-auth', (req, res) => {
  // Ini adalah contoh data yang akan diterima dari Supabase setelah login Google
  const mockGoogleAuthData = {
    session: {
      access_token: 'example-jwt-token',
      expires_at: new Date().getTime() + 3600000, // 1 hour from now
      refresh_token: 'example-refresh-token',
      user: {
        id: 'google-user-id-test',
        email: 'test.google@example.com',
        user_metadata: {
          full_name: 'Google Test User',
          avatar_url: 'https://lh3.googleusercontent.com/test-avatar.jpg',
          iss: 'https://accounts.google.com',
          provider_id: 'google'
        },
        app_metadata: {
          provider: 'google',
          providers: ['google']
        }
      }
    }
  };
  
  res.status(200).json({
    message: 'This is how Google auth data will look',
    data: mockGoogleAuthData,
    instructions: 'Frontend should extract user info and send to /auth/save-user endpoint'
  });
});

export default router; 