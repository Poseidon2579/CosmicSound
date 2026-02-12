import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vsavuzytyxlltxjvcvvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXZ1enl0eXhsbHR4anZjdnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjI2NTYsImV4cCI6MjA4NjQ5ODY1Nn0.Rk7euA3n95KyDCtOykDZoJz8pYv6BuOAHAgcYDD0c_c';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USERS = [
    'user_1739396825785',
    'invitado_123',
    'melomano_88',
    'astro_boy',
    'luna_love'
];

const COMMENTS = [
    "Increíble atmósfera cósmica 🌌",
    "Me hace sentir en otro planeta 🚀",
    "La producción es impecable ✨",
    "Perfecta para viajar por las estrellas",
    "Un clásico instantáneo",
    "Beat brutal 🎧",
    "No puedo dejar de escucharla",
    "10/10 masterclass",
    "Vibra espacial total",
    "Necesito más de esto"
];

async function seedReviews() {
    console.log("Fetching songs...");
    const { data: songs, error: fetchError } = await supabase.from('canciones').select('id');

    if (fetchError) {
        console.error("Error fetching songs:", fetchError);
        return;
    }

    if (!songs || songs.length === 0) {
        console.error("No songs found to review.");
        return;
    }

    console.log(`Found ${songs.length} songs. Seeding reviews...`);

    const reviews = [];

    for (const song of songs) {
        // Generate 3-8 reviews per song
        const reviewCount = Math.floor(Math.random() * 6) + 3;

        for (let i = 0; i < reviewCount; i++) {
            const user = USERS[Math.floor(Math.random() * USERS.length)];
            const rating = (Math.random() * 2) + 3; // Rating between 3.0 and 5.0

            reviews.push({
                cancion_id: song.id,
                usuario: user,
                avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${user}`,
                fecha: new Date().toISOString(),
                comentario: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
                calificacion: parseFloat(rating.toFixed(1)),
                verificado: Math.random() > 0.5
            });
        }
    }

    const { error } = await supabase.from('resenas').insert(reviews);

    if (error) {
        console.error("Error inserting reviews:", error);
    } else {
        console.log(`Successfully inserted ${reviews.length} reviews!`);
    }
}

seedReviews();
