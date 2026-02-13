const fs = require('fs');
const https = require('https');

const targets = {
    'public/assets/planets/sun.jpg': [
        'https://raw.githubusercontent.com/PetridisKonstantinos/MiniProject/master/MiniProjectPhysicsGithubUnity/Assets/PlanetTextures/2k_sun.jpg',
        'https://raw.githubusercontent.com/KyleGough/solar-system/master/assets/textures/2k_sun.jpg',
        'https://raw.githubusercontent.com/N3rson/Solar-System-3D/master/assets/textures/2k_sun.jpg'
    ],
    'public/assets/planets/moon.jpg': [
        'https://raw.githubusercontent.com/PetridisKonstantinos/MiniProject/master/MiniProjectPhysicsGithubUnity/Assets/PlanetTextures/2k_moon.jpg',
        'https://raw.githubusercontent.com/KyleGough/solar-system/master/assets/textures/2k_moon.jpg',
        'https://raw.githubusercontent.com/N3rson/Solar-System-3D/master/assets/textures/2k_moon.jpg'
    ],
    'public/assets/planets/saturn_ring.png': [
        'https://raw.githubusercontent.com/PetridisKonstantinos/MiniProject/master/MiniProjectPhysicsGithubUnity/Assets/PlanetTextures/2k_saturn_ring_alpha.png'
    ]
};

const downloadFile = (dest, urls) => {
    if (urls.length === 0) {
        console.log(`All sources failed for ${dest}`);
        return;
    }
    const url = urls[0];
    const file = fs.createWriteStream(dest);

    https.get(url, (res) => {
        if (res.statusCode === 200) {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Success: ${dest}`);
            });
        } else {
            file.close();
            fs.unlink(dest, () => { }); // Delete partial/empty
            downloadFile(dest, urls.slice(1)); // Try next
        }
    }).on('error', (e) => {
        fs.unlink(dest, () => { });
        downloadFile(dest, urls.slice(1));
    });
};

Object.keys(targets).forEach(dest => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
        console.log(`Skipping ${dest} (already exists)`);
    } else {
        downloadFile(dest, targets[dest]);
    }
});
