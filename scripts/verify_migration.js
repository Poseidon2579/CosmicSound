
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    console.log("Verifying 'genres' table existence...");

    const { data, error } = await supabase
        .from('genres')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Migration check failed or table not found:", error.message);
        return;
    }

    console.log("Success! 'genres' table found.");
    console.log("Sample data:", data);

    console.log("\nVerifying 'song_genres' relation...");
    const { data: relationData, error: relationError } = await supabase
        .from('song_genres')
        .select('song_id, genre_id')
        .limit(5);

    if (relationError) {
        console.error("Error checking song_genres:", relationError.message);
    } else {
        console.log("Success! 'song_genres' table found with entries:", relationData.length);
    }
}

verifyMigration();
