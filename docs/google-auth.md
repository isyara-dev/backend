# Integrasi Google Auth di ISYARA

## Di Frontend (Vue.js)

### 1. Setup Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nyrnscpotfdoqqejwqae.supabase.co'
const supabaseKey = 'public-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)
```

### 2. Login dengan Google

```javascript
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  
  if (error) {
    console.error('Error signing in with Google:', error)
    return
  }
}
```

### 3. Handle Redirect & Save User Data

```javascript
// Di halaman yang menerima redirect setelah login
async function handleAuthRedirect() {
  // Dapatkan session setelah login
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Dapatkan user data
    const { id, email } = session.user
    const username = session.user.user_metadata.full_name || email.split('@')[0]
    const avatar_url = session.user.user_metadata.avatar_url || null
    
    // Kirim data ke backend untuk disimpan di database
    const response = await fetch('http://localhost:3000/api/auth/save-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        email,
        username,
        avatar_url
      })
    })
    
    const userData = await response.json()
    console.log('User data saved:', userData)
    
    // Simpan token untuk request berikutnya
    localStorage.setItem('token', session.access_token)
  }
}
```

### 4. Menggunakan Token untuk Request Endpoint Lain

```javascript
async function fetchProtectedData() {
  const token = localStorage.getItem('token')
  
  const response = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  console.log('Protected data:', data)
}
```
```

## 4. Testing Tanpa Frontend

Untuk testing tanpa menunggu frontend, Anda bisa:

1. **Matikan RLS** untuk tabel users (jika masih diaktifkan)
2. **Buat Manual Endpoint** untuk testing:

```javascript:routes/authRoutes.js
// Tambahkan endpoint ini untuk testing
router.post('/test-google-user', async (req, res) => {
  try {
    // Buat data dummy seperti yang akan dikirim frontend
    const testUser = {
      id: "google-user-id-123", // Dummy ID
      email: "test.google@example.com",
      username: "Google User",
      avatar_url: "https://lh3.googleusercontent.com/test-avatar.jpg",
      login_method: "google"
    };
    
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
          login_method: testUser.login_method,
          created_at: new Date()
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create test user' });
      }
      
      return res.status(201).json(newUser);
    }
    
    return res.status(200).json(existingUser);
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ error: 'Test failed' });
  }
});
```

Kemudian tes dengan: 