import supabase from '../services/supabaseClient.js';

const getHands = async (req, res) => {
  try {
    const { mod, sub } = req.query;

    console.log('Fetching hands with:', { mod, sub });

    let query = supabase
      .from('sub_modules')
      .select('name, image_url');

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

export default getHands;

export { getHands }; 