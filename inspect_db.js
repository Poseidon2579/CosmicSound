
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- INSPECTING 5 SONGS ---');
    const { data: songs, error } = await supabase
        .from('canciones')
        .select('*')
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    if (songs && songs.length > 0) {
        console.log('Columns found:', Object.keys(songs[0]));
        songs.forEach((s, i) => {
            console.log(`\nSong ${i + 1}:`, s.titulo, 'by', s.artista);
            console.log('   Genre:', s.genero);
            console.log('   Decade:', s.decada); // Checking if decada column exists
        });
    } else {
        console.log('No songs found in the database.');
    }

    // Check views too
    console.log('\n--- INSPECTING VIEW: canciones_con_rating ---');
    const { data: viewData, error: vError } = await supabase
        .from('canciones_con_rating')
        .select('*')
        .limit(1);

    if (vError) {
        console.error('View error:', vError.message);
    } else if (viewData && viewData.length > 0) {
        console.log('View columns:', Object.keys(viewData[0]));
    }
}

inspect();
