import supabase from '../services/supabaseClient.js';

// Get all letters
const getAllLetters = async (req, res) => {
  try {
    console.log('Attempting to fetch letters from Supabase...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase.from('letters').select('count');
    if (testError) {
      console.error('Error testing connection:', testError);
      return res.status(500).json({ 
        error: 'Failed to connect to database', 
        details: testError.message,
        code: testError.code 
      });
    }
    
    console.log('Connection test successful. Fetching letters...');
    
    // Now fetch actual data
    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .order('char');
    
    if (error) {
      console.error('Detailed error fetching letters:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch letters', 
        details: error.message,
        code: error.code
      });
    }
    
    console.log(`Successfully retrieved ${letters ? letters.length : 0} letters`);
    
    if (!letters || letters.length === 0) {
      console.warn('Letters table is empty');
      return res.status(200).json({
        all: [],
        grouped: { module1: [], module2: [], module3: [] }
      });
    }
    
    // Log the first letter for schema verification
    console.log('Sample letter data:', letters[0]);
    
    // Group letters by modules (A-J, K-T, U-Z)
    const groupedLetters = {
      'module1': letters.filter(letter => letter.char >= 'A' && letter.char <= 'J'),
      'module2': letters.filter(letter => letter.char >= 'K' && letter.char <= 'T'),
      'module3': letters.filter(letter => letter.char >= 'U' && letter.char <= 'Z')
    };
    
    return res.status(200).json({
      all: letters,
      grouped: groupedLetters
    });
  } catch (error) {
    console.error('Unexpected error in getAllLetters:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      stack: error.stack 
    });
  }
};

// Get letter by character
const getLetterByChar = async (req, res) => {
  try {
    const { char } = req.params;
    
    const { data: letter, error } = await supabase
      .from('letters')
      .select('*')
      .eq('char', char.toUpperCase())
      .single();
    
    if (error) {
      console.error('Error fetching letter:', error);
      return res.status(500).json({ error: 'Failed to fetch letter' });
    }
    
    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }
    
    return res.status(200).json(letter);
  } catch (error) {
    console.error('Error in getLetterByChar:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAllLetters, getLetterByChar }; 