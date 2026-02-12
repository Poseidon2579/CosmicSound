import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_PATH = path.join(process.cwd(), 'dataset', 'Spotify_Youtube.csv', 'Spotify_Youtube.csv');
const BATCH_SIZE = 500;

function extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    return match ? match[1] : null;
}

async function importData() {
    console.log('🚀 Starting import from:', CSV_PATH);

    if (!fs.existsSync(CSV_PATH)) {
        console.error('❌ CSV file not found at:', CSV_PATH);
        return;
    }

    const fileStream = fs.createReadStream(CSV_PATH);
    let count = 0;
    let batch: any[] = [];
    let totalImported = 0;

    Papa.parse(fileStream, {
        header: true,
        skipEmptyLines: true,
        step: async function (results, parser) {
            parser.pause();

            const row = results.data as any;

            // Map CSV to Table
            const song = {
                id: `song_${row[''] || count}`, // Using the unnamed index column as part of ID
                artista: row.Artist || 'Unknown Artist',
                titulo: row.Track || 'Unknown Track',
                album: row.Album || 'Unknown Album',
                youtube_id: extractYoutubeId(row.Url_youtube),
                vistas: parseInt(row.Views) || 0,
                me_gusta: parseInt(row.Likes) || 0,
                genero: row.Album_type || 'Musical'
            };

            if (song.titulo && song.artista) {
                batch.push(song);
            }

            if (batch.length >= BATCH_SIZE) {
                const { error } = await supabase.from('canciones').upsert(batch, { onConflict: 'id' });
                if (error) {
                    console.error('❌ Error inserting batch:', error.message);
                } else {
                    totalImported += batch.length;
                    console.log(`✅ Imported ${totalImported} songs...`);
                }
                batch = [];
            }

            count++;
            parser.resume();
        },
        complete: async function () {
            if (batch.length > 0) {
                const { error } = await supabase.from('canciones').upsert(batch, { onConflict: 'id' });
                if (error) {
                    console.error('❌ Error inserting final batch:', error.message);
                } else {
                    totalImported += batch.length;
                }
            }
            console.log(`\n🎉 Import complete! Total songs imported: ${totalImported}`);
        },
        error: function (err) {
            console.error('❌ Error parsing CSV:', err);
        }
    });
}

importData();
