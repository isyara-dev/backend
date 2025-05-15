import supabase from '../services/supabaseClient.js';

// Function to add all letters A-Z to the database
const seedLetters = async () => {
  const letters = [];
  
  // Generate letters A-Z
  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    letters.push({
      char,
      image_url: `https://placeholder.com/sign-language-${char.toLowerCase()}.jpg` // Replace with actual image URLs
    });
  }
  
  // Insert into database
  const { data, error } = await supabase
    .from('letters')
    .upsert(letters, { onConflict: 'char' })
    .select();
  
  if (error) {
    console.error('Error seeding letters:', error);
    return;
  }
  
  console.log(`Successfully added ${data.length} letters to database`);
};

// Run the function
seedLetters(); 