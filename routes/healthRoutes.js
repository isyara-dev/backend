import express from 'express';
import supabase from '../services/supabaseClient.js';

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add this new route
router.get('/db-test', async (req, res) => {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('letters').select('count');
    
    if (error) {
      console.error('Database connection test failed:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed', 
        error: error.message,
        code: error.code
      });
    }
    
    // Try to fetch one row
    const { data: sampleRow, error: rowError } = await supabase
      .from('letters')
      .select('*')
      .limit(1);
      
    if (rowError) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Could connect but failed to fetch data', 
        error: rowError.message 
      });
    }
    
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Database connection successful',
      sample: sampleRow
    });
  } catch (err) {
    console.error('Unexpected error in db-test:', err);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Test failed', 
      error: err.message 
    });
  }
});

export default router; 