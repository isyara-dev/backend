import { supabase } from '../services/supabaseClient.js';

// Update progress for a sub-module
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sub_module_id, is_completed } = req.body;

    if (!sub_module_id) {
      return res.status(400).json({ error: 'Sub-module ID is required' });
    }

    // Check if progress entry exists
    const { data: existingProgress, error: findError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('sub_module_id', sub_module_id)
      .maybeSingle();

    if (findError) {
      console.error('Error finding progress:', findError);
      return res.status(500).json({ error: 'Database error when finding progress' });
    }

    let result;

    if (existingProgress) {
      // Update existing progress
      const { data, error: updateError } = await supabase
        .from('user_progress')
        .update({
          is_completed: is_completed !== undefined ? is_completed : existingProgress.is_completed,
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating progress:', updateError);
        return res.status(500).json({ error: 'Failed to update progress' });
      }

      result = data;
    } else {
      // Create new progress entry
      const { data, error: insertError } = await supabase
        .from('user_progress')
        .insert([
          {
            user_id: userId,
            sub_module_id,
            is_completed: is_completed !== undefined ? is_completed : true,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating progress:', insertError);
        return res.status(500).json({ error: 'Failed to create progress' });
      }

      result = data;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateProgress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a preprocess data progress for a sub module
const getCombinedData = async (userId, moduleId = null) => {
  try {
    let query = supabase.from('sub_modules').select('*');

    if (moduleId) {
      // Filter by module_id dan order by order_index
      query = query.eq('module_id', Number(moduleId)).order('order_index', { ascending: true });
    } else {
      // Ambil semua, urutkan by module_id lalu order_index
      query = query
        .order('module_id', { ascending: true })
        .order('order_index', { ascending: true });
    }

    const { data: submodules, error: subError } = await query;
    if (subError) throw new Error('Failed to fetch sub_modules: ' + subError.message);

    const { data: userProgress, error: progError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progError) throw new Error('Failed to fetch user_progress: ' + progError.message);

    const progressMap = new Map();
    userProgress.forEach((up) => progressMap.set(up.sub_module_id, up));

    const combinedData = submodules.map((submodule) => {
      const progress = progressMap.get(submodule.id);
      return {
        id: submodule.id,
        module_id: submodule.module_id,
        name: submodule.name,
        image_url: submodule.image_url,
        order_index: submodule.order_index,
        is_completed: progress ? progress.is_completed : false,
        has_progress: !!progress,
      };
    });

    return combinedData;
  } catch (error) {
    console.error('Error in getCombinedData:', error);
    throw error;
  }
};

// Get progress for a sub module
const getSubProgress = async (req, res) => {
  try {
    // Use authenticated user ID if available
    const userId = req.user.id;
    const { mod } = req.query;

    const data = await getCombinedData(userId, mod);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in getSubProgress:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get progress for a module
const getModuleProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { languageId } = req.params;

    // Call the PostgreSQL function
    const { data, error } = await supabase.rpc('get_module_progress', {
      p_user_id: userId,
      p_language_id: parseInt(languageId),
    });

    if (error) {
      console.error('Supabase module progress error:', error);
      return res.status(500).json({
        error: 'Failed to fetch module progress',
        details: error.message,
      });
    }

    // Return the formatted module progress data
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error in getModuleProgress:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Get progress for a language
const getLanguageProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    // const { userId } = req.params;

    // Call the PostgreSQL function
    const { data, error } = await supabase.rpc('get_language_progress', {
      user_id: userId,
    });

    if (error) {
      console.error('Supabase language progress error:', error);
      return res.status(500).json({
        error: 'Failed to fetch language progress',
        details: error.message,
      });
    }

    // Return the formatted language progress data
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error in getLanguageProgress:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

export { getSubProgress, getModuleProgress, getLanguageProgress, updateProgress };
