// Dummy module controller for initial setup
import supabase from '../services/supabaseClient.js';

// Get all modules
const getAllModules = async (req, res) => {
  try {
    const { data: modules, error } = await supabase
      .from('module')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching modules:', error);
      return res.status(500).json({ error: 'Failed to fetch modules' });
    }
    
    return res.status(200).json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get letters by module ID
const getLettersByModuleId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .eq('module_id', id)
      .order('letter');

    if (error) {
      console.error('Error fetching letters:', error);
      return res.status(500).json({ error: 'Failed to fetch letters' });
    }
    
    return res.status(200).json(letters);
  } catch (error) {
    console.error('Error fetching letters:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAllModules, getLettersByModuleId }; 