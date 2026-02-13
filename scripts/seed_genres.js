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

async function seed() {
    console.log("🌱 Seeding Genres with manual UUIDs...");

    for (const name of GENRES) {
        // Check if exists first (case insensitive)
        const { data } = await supabase.from('genres').select('id').ilike('name', name).maybeSingle();

        if (!data) {
            const { error } = await supabase.from('genres').insert({
                id: randomUUID(),
                name: name
            });
            if (error) {
                console.error(`\n❌ Error inserting ${name}:`, error.message, error.details);
            } else {
                process.stdout.write('+');
            }
        } else {
            process.stdout.write('.');
        }
    }
    console.log("\n✅ Done!");
}

seed();
