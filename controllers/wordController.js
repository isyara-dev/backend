import { supabase } from '../services/supabaseClient.js';

// Get random word
const getRandomWord = async (req, res) => {
  try {
    console.log('Attempting to fetch random word...');

    // Check if words table exists and get count
    const { count, error: countError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking words table:', countError);
      return res.status(500).json({
        error: 'Failed to access words table',
        details: countError.message,
        code: countError.code,
      });
    }

    console.log(`Found ${count} words in the table`);

    if (count === 0) {
      return res.status(404).json({ error: 'No words found in database' });
    }

    // Generate random index
    const randomIndex = Math.floor(Math.random() * count);
    console.log(`Selected random index: ${randomIndex}`);

    // Get random word
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .range(randomIndex, randomIndex);

    if (error) {
      console.error('Error fetching random word:', error);
      return res.status(500).json({
        error: 'Failed to fetch random word',
        details: error.message,
      });
    }

    if (!words || words.length === 0) {
      return res.status(404).json({ error: 'No word found at selected index' });
    }

    // Calculate points based on word length (10 * word length)
    const word = words[0];
    const points = word.word ? 10 * word.word.length : 10;
    word.points = points;

    console.log('Successfully retrieved random word:', words[0]);
    return res.status(200).json(word);
  } catch (error) {
    console.error('Unexpected error in getRandomWord:', error);
    return res.status(500).json({
      error: 'Internal server error',
      stack: error.stack,
    });
  }
};

// Submit full score accumulation (Not update best only)
// const submitWordSession = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { word_ids } = req.body;

//     if (!Array.isArray(word_ids) || word_ids.length === 0) {
//       return res.status(400).json({ error: 'word_ids must be a non-empty array' });
//     }

//     // Hilangkan duplikat hanya untuk keperluan query
//     const uniqueIds = [...new Set(word_ids)];

//     // Ambil data kata dari Supabase
//     const { data: words, error: wordError } = await supabase
//       .from('words')
//       .select('id, word')
//       .in('id', uniqueIds);

//     if (wordError) {
//       return res
//         .status(500)
//         .json({ error: 'Failed to fetch word data', details: wordError.message });
//     }

//     if (!words || words.length === 0) {
//       return res.status(404).json({ error: 'No matching words found in database' });
//     }

//     // Validasi: pastikan semua word_ids yang dikirim user ada di database
//     const fetchedIds = words.map((w) => w.id);
//     const invalidIds = word_ids.filter((id) => !fetchedIds.includes(id));

//     if (invalidIds.length > 0) {
//       return res.status(400).json({
//         error: 'Some word_ids are invalid',
//         invalidIds,
//       });
//     }

//     // Hitung total poin berdasarkan word_ids (dengan duplikat)
//     let points_earned = 0;
//     word_ids.forEach((id) => {
//       const word = words.find((w) => w.id === id);
//       if (word && word.word) {
//         points_earned += word.word.length * 10;
//       }
//     });

//     // Simpan skor ke user_scores
//     const { data: scoreData, error: scoreError } = await supabase
//       .from('user_scores')
//       .insert([
//         {
//           user_id: userId,
//           score: points_earned,
//           update_at: new Date().toISOString(),
//         },
//       ])
//       .select()
//       .single();

//     if (scoreError) {
//       return res
//         .status(500)
//         .json({ error: 'Failed to record user score', details: scoreError.message });
//     }

//     return res.status(200).json({
//       success: true,
//       points_earned,
//       score_id: scoreData.id,
//       played_at: scoreData.update_at,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error', stack: error.stack });
//   }
// };

// Submit session and update best score
const submitWordSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { word_ids } = req.body;

    if (!Array.isArray(word_ids) || word_ids.length === 0) {
      return res.status(400).json({ error: 'word_ids must be a non-empty array' });
    }

    const uniqueIds = [...new Set(word_ids)];

    const { data: words, error: wordError } = await supabase
      .from('words')
      .select('id, word')
      .in('id', uniqueIds);

    if (wordError || !words) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch word data', details: wordError.message });
    }

    const fetchedIds = words.map((w) => w.id);
    const invalidIds = word_ids.filter((id) => !fetchedIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({ error: 'Some word_ids are invalid', invalidIds });
    }

    // Hitung poin total berdasarkan word_ids (dengan duplikat)
    let points_earned = 0;
    word_ids.forEach((id) => {
      const word = words.find((w) => w.id === id);
      if (word && word.word) {
        points_earned += word.word.length * 10;
      }
    });

    // Ambil skor tertinggi user saat ini
    const { data: currentScoreRow, error: scoreFetchError } = await supabase
      .from('user_scores')
      .select('score')
      .eq('user_id', userId)
      .single();

    if (scoreFetchError && scoreFetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found
      return res
        .status(500)
        .json({ error: 'Failed to fetch current user score', details: scoreFetchError.message });
    }

    const previousScore = currentScoreRow?.score || 0;

    if (points_earned > previousScore) {
      // Update skor tertinggi
      const { data: updatedScore, error: scoreUpdateError } = await supabase
        .from('user_scores')
        .upsert(
          {
            user_id: userId,
            score: points_earned,
            update_at: new Date().toISOString(),
          },
          { onConflict: ['user_id'] }
        ) // pakai unique key user_id
        .select()
        .single();

      if (scoreUpdateError) {
        return res
          .status(500)
          .json({ error: 'Failed to update high score', details: scoreUpdateError.message });
      }

      return res.status(200).json({
        success: true,
        message: 'New high score!',
        score: updatedScore.score,
        update_at: updatedScore.update_at,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'No update. Your score was not higher than the previous one.',
        score: previousScore,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', stack: error.stack });
  }
};

export { getRandomWord, submitWordSession };
