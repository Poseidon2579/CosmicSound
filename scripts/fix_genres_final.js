const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// English (DB Standard) -> Spanish (Display)
const GENRES_MAP = {
    'Pop': 'Pop',
    'Rock': 'Rock',
    'Hip-Hop': 'Hip Hop',
    'R&B': 'R&B',
    'Country': 'Country',
    'Jazz': 'Jazz',
    'Electronic': 'Electrónica',
    'Classical': 'Clásica',
    'Reggae': 'Reggae',
    'Blues': 'Blues',
    'Metal': 'Metal',
    'Latin': 'Latina',
    'Folk': 'Folk',
    'Soul': 'Soul',
    'Punk': 'Punk',
    'Funk': 'Funk',
    'Disco': 'Disco',
    'Techno': 'Techno',
    'House': 'House',
    'Indie': 'Indie',
    'Alternative': 'Alternativa',
    'K-Pop': 'K-Pop',
    'J-Pop': 'J-Pop',
    'Reggaeton': 'Reggaeton',
    'Urban': 'Urbano',
    'Trap': 'Trap',
    'Grunge': 'Grunge',
    'Salsa': 'Salsa',
    'Bachata': 'Bachata',
    'Merengue': 'Merengue',
    'Cumbia': 'Cumbia',
    'Vallenato': 'Vallenato',
    'Banda': 'Banda',
    'Ranchera': 'Ranchera',
    'Mariachi': 'Mariachi',
    'Corrido': 'Corrido',
    'Bolero': 'Bolero',
    'Tango': 'Tango',
    'Flamenco': 'Flamenco',
    'Bossa Nova': 'Bossa Nova',
    'Samba': 'Samba',
    'MPB': 'MPB',
    'Afrobeat': 'Afrobeat',
    'Dancehall': 'Dancehall',
    'Ska': 'Ska',
    'Gospel': 'Gospel',
    'Christian': 'Cristiana',
    'Instrumental': 'Instrumental',
    'Soundtrack': 'Bandas Sonoras',
    'World': 'Música del Mundo'
};

const GENRES = Object.keys(GENRES_MAP);

async function fixGenres() {
    console.log("🔧 Fixing Genres (Final Attempt)...");

    // 1. Check current capabilities
    const testId = randomUUID();
    const { error: testError } = await supabase.from('genres').insert({ id: testId, name: 'TEST_WRITE' });
    if (testError) {
        console.error("❌ CRTICAL: Cannot write to genres table.", testError);
        return;
    }
    await supabase.from('genres').delete().eq('id', testId);
    console.log("✅ RLS Write Check Passed.");

    // 2. Upsert All
    console.log(`Processing ${GENRES.length} standard genres...`);

    // Fetch existing names map to IDs
    const { data: existing } = await supabase.from('genres').select('id, name');
    const existingMap = new Map();
    if (existing) existing.forEach(g => existingMap.set(g.name.toLowerCase(), g.id));

    const upserts = [];

    for (const name of GENRES) {
        // If exists, do nothing (or verify). If not, insert.
        if (!existingMap.has(name.toLowerCase())) {
            upserts.push({
                id: randomUUID(),
                name: name
            });
        }
    }

    if (upserts.length > 0) {
        console.log(`Inserting ${upserts.length} new genres...`);
        const { data, error } = await supabase.from('genres').insert(upserts).select();

        if (error) {
            console.error("❌ Insert Error:", error);
        } else {
            console.log(`✅ Success! Inserted ${data.length} genres.`);
        }
    } else {
        console.log("✅ All genres already exist.");
    }

    // 3. Final Count
    const { count } = await supabase.from('genres').select('*', { count: 'exact', head: true });
    console.log(`🏁 Total Genres in DB: ${count}`);
}

fixGenres();
