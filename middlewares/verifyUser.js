import { supabase } from '../services/supabaseClient.js';

// Middleware to verify user token from Supabase
const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Tambahkan log untuk debugging
    console.log('User from token:', user);
    console.log('User ID:', user.id);
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export default verifyUser; 