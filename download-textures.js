const fs = require('fs');
const https = require('https');

const base = 'https://raw.githubusercontent.com/PetridisKonstantinos/MiniProject/master/MiniProjectPhysicsGithubUnity/Assets/PlanetTextures/';

const files = [
    { name: '2k_sun.jpg', dest: 'public/assets/planets/sun.jpg' },
    { name: '2k_earth_daymap.jpg', dest: 'public/assets/planets/earth.jpg' }, // Overwrite the one I have to be consistent
    { name: '2k_moon.jpg', dest: 'public/assets/planets/moon.jpg' },
    { name: '2k_mars.jpg', dest: 'public/assets/planets/mars.jpg' },
    { name: '2k_saturn.jpg', dest: 'public/assets/planets/saturn.jpg' }
    // Skipping ring for now unless I confirm the name, code handles missing ring texture
];

files.forEach(f => {
    const file = fs.createWriteStream(f.dest);
    https.get(base + f.name, (res) => {
        if (res.statusCode === 200) {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${f.name}`);
            });
        } else {
            console.log(`Failed ${f.name}: ${res.statusCode}`);
            fs.unlink(f.dest, () => { });
        }
    }).on('error', (e) => {
        console.error(e);
        fs.unlink(f.dest, () => { });
    });
});
