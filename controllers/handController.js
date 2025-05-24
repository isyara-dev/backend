import { supabase } from '../services/supabaseClient.js';

const getHands = async (req, res) => {
  try {
    const { mod, sub } = req.query;

    console.log('Fetching hands with:', { mod, sub });

    let query = supabase.from('sub_modules').select('name, image_url');

    if (sub) {
      query = query.eq('id', sub).single();
    } else if (mod) {
      query = query.eq('module_id', mod);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching hands:', error);
      return res.status(500).json({ error: 'Failed to fetch hands' });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
};

const getHandByChar = async (req, res) => {
  try {
    const { char } = req.params;

    if (!char || char.length !== 1) {
      return res.status(400).json({ error: 'Invalid character parameter' });
    }

    const { data: submodule, error } = await supabase
      .from('sub_modules')
      .select('*')
      .eq('name', char.toUpperCase())
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

export default getHands;

export { getHands, getHandByChar };
