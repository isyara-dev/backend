import {supabase} from '../services/supabaseClient.js';

// Get all submodules
const getAllSubmodules = async (req, res) => {
  try {
    console.log('Attempting to fetch submodules from Supabase...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase.from('submodule').select('count');
    if (testError) {
      console.error('Error testing connection:', testError);
      return res.status(500).json({ 
        error: 'Failed to connect to database', 
        details: testError.message,
        code: testError.code 
      });
    }
    
    console.log('Connection test successful. Fetching submodules...');
    
    // Now fetch actual data
    const { data: submodules, error } = await supabase
      .from('submodule')
      .select('*')
      .order('char');
    
    if (error) {
      console.error('Detailed error fetching submodules:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch submodules', 
        details: error.message,
        code: error.code
      });
    }
    
    console.log(`Successfully retrieved ${submodules ? submodules.length : 0} submodules`);
    
    if (!submodules || submodules.length === 0) {
      console.warn('Submodule table is empty');
      return res.status(200).json({
        all: [],
        grouped: { module1: [], module2: [], module3: [] }
      });
    }
    
    // Log the first submodule for schema verification
    console.log('Sample submodule data:', submodules[0]);
    
    // Group submodules by modules (A-J, K-T, U-Z)
    const groupedSubmodules = {
      'module1': submodules.filter(submodule => submodule.char >= 'A' && submodule.char <= 'J'),
      'module2': submodules.filter(submodule => submodule.char >= 'K' && submodule.char <= 'T'),
      'module3': submodules.filter(submodule => submodule.char >= 'U' && submodule.char <= 'Z')
    };
    
    return res.status(200).json({
      all: submodules,
      grouped: groupedSubmodules
    });
  } catch (error) {
    console.error('Unexpected error in getAllSubmodules:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get submodule by character
const getSubmoduleByChar = async (req, res) => {
  try {
    const { char } = req.params;
    
    if (!char || char.length !== 1) {
      return res.status(400).json({ error: 'Invalid character parameter' });
    }
    
    const { data: submodule, error } = await supabase
      .from('submodule')
      .select('*')
      .eq('char', char.toUpperCase())
      .single();
    
    if (error) {
      console.error('Error fetching submodule:', error);
      return res.status(500).json({ error: 'Failed to fetch submodule' });
    }
    
    if (!submodule) {
      return res.status(404).json({ error: 'Submodule not found' });
    }
    
    return res.status(200).json(submodule);
  } catch (error) {
    console.error('Error in getSubmoduleByChar:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAllSubmodules, getSubmoduleByChar }; 