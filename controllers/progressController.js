import {supabase} from '../services/supabaseClient.js';

// Get all progress for a user
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: progress, error } = await supabase
      .from('progress_user')
      .select(`
        *,
        submodule:submodule_id (
          id,
          char,
          image_url
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }
    
    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update progress for a letter
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { letter_id, is_completed } = req.body;
    
    if (!letter_id) {
      return res.status(400).json({ error: 'Letter ID is required' });
    }
    
    // Check if progress entry exists
    const { data: existingProgress, error: findError } = await supabase
      .from('progress_user')
      .select('*')
      .eq('user_id', userId)
      .eq('letter_id', letter_id)
      .maybeSingle();
    
    if (findError) {
      console.error('Error finding progress:', findError);
      return res.status(500).json({ error: 'Database error when finding progress' });
    }
    
    let result;
    
    if (existingProgress) {
      // Update existing progress
      const { data, error: updateError } = await supabase
        .from('progress_user')
        .update({ 
          is_completed: is_completed !== undefined ? is_completed : existingProgress.is_completed,
          updated_at: new Date()
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
        .from('progress_user')
        .insert([
          {
            user_id: userId,
            letter_id,
            is_completed: is_completed !== undefined ? is_completed : true,
            updated_at: new Date()
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
    console.error('Error in updateProgress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get progress for a specific letter
const getLetterProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { letter_id } = req.params;
    
    const { data: progress, error } = await supabase
      .from('progress_user')
      .select(`
        *,
        letter:letter_id (
          id,
          char,
          image_url
        )
      `)
      .eq('user_id', userId)
      .eq('letter_id', letter_id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching letter progress:', error);
      return res.status(500).json({ error: 'Failed to fetch letter progress' });
    }
    
    if (!progress) {
      return res.status(200).json({ exists: false, is_completed: false });
    }
    
    return res.status(200).json({ ...progress, exists: true });
  } catch (error) {
    console.error('Error in getLetterProgress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { getUserProgress, updateProgress, getLetterProgress }; 