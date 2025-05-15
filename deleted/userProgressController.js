import supabase from '../services/supabaseClient.js';

// Get user progress for all modules
const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        module:module_id (
          id,
          name,
          start_letter,
          end_letter
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user progress:', error);
      return res.status(500).json({ error: 'Failed to fetch user progress' });
    }
    
    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user progress
const updateUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { module_id, letter, is_completed } = req.body;
    
    if (!module_id) {
      return res.status(400).json({ error: 'Module ID is required' });
    }

    // Check if progress entry exists
    const { data: existingProgress, error: findError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', module_id)
      .eq('letter', letter || '')
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
          is_completed: is_completed || existingProgress.is_completed,
          completed_at: is_completed ? new Date() : existingProgress.completed_at
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
            module_id,
            letter: letter || null,
            is_completed: is_completed || false,
            completed_at: is_completed ? new Date() : null
          }
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
    console.error('Error updating user progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getUserProgress, updateUserProgress }; 