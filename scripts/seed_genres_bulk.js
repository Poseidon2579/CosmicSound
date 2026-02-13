const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const GENRES = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country', 'Jazz', 'Electronic', 'Classical', 'Reggae', 'Blues',
    'Metal', 'Latin', 'Folk', 'Soul', 'Punk', 'Funk', 'Disco', 'Techno', 'House', 'Indie',
    'Alternative', 'K-Pop', 'J-Pop', 'Reggaeton', 'Urban', 'Trap', 'Grunge', 'Salsa', 'Bachata',
    'Merengue', 'Cumbia', 'Vallenato', 'Banda', 'Ranchera', 'Mariachi', 'Corrido', 'Bolero',
    'Tango', 'Flamenco', 'Bossa Nova', 'Samba', 'MPB', 'Afrobeat', 'Dancehall', 'Ska', 'Gospel',
    'Christian', 'Instrumental', 'Soundtrack', 'World', 'Other'
];

async function seedBulk() {
    console.log("🌱 Bulk Seeding Genres...");

    // 1. Get existing
    const { data: existing, error: fetchError } = await supabase.from('genres').select('name');
    if (fetchError) {
        console.error("Error fetching existing genres:", fetchError);
        return;
    }

    const existingSet = new Set(existing.map(g => g.name.toLowerCase()));

    // 2. Identify missing
    const missing = GENRES.filter(name => !existingSet.has(name.toLowerCase()));

    console.log(`Found ${existing.length} existing genres.`);
    console.log(`Need to insert ${missing.length} genres:`, missing);

    if (missing.length === 0) {
        console.log("✅ All genres present.");
        return;
    }

    // 3. Prepare payload
    const payload = missing.map(name => ({
        id: randomUUID(),
        name: name
    }));

    // 4. Insert
    const { error: insertError } = await supabase.from('genres').insert(payload);

    if (insertError) {
        console.error("❌ Bulk Insert Error:", insertError);
    } else {
        console.log(`✅ Successfully inserted ${missing.length} genres.`);
    }
}

seedBulk();
