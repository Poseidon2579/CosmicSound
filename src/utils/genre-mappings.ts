
export const ENGLISH_TO_SPANISH: Record<string, string> = {
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
    'Reggaeton': 'Reggaetón',
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

// Create reverse map for searching
export const SPANISH_TO_ENGLISH: Record<string, string> = Object.entries(ENGLISH_TO_SPANISH).reduce((acc, [eng, esp]) => {
    acc[esp.toLowerCase()] = eng;
    acc[eng.toLowerCase()] = eng; // Allow searching in English too
    return acc;
}, {} as Record<string, string>);

export function getDisplayGenre(dbName: string): string {
    return ENGLISH_TO_SPANISH[dbName] || dbName;
}

export function getDbGenre(input: string): string | null {
    const normalized = input.trim().toLowerCase();
    return SPANISH_TO_ENGLISH[normalized] || null;
}
