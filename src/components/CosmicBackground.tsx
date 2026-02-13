"use client";

import { useEffect, useRef } from "react";

interface Star {
    x: number;
    y: number;
    z: number;
    size: number;
    color: string;
    glow: number;
    pulseOffset: number; // For twinkling
}

interface Planet {
    name: string;
    color: string;
    size: number;
    distance: number; // Distance from sun
    speed: number;   // Orbit speed
    angle: number;   // Current orbit angle
    type: 'star' | 'planet' | 'moon';
    parent?: Planet; // For moons
    textureUrl?: string;
    texture?: HTMLImageElement;
    ringTextureUrl?: string;
    ringTexture?: HTMLImageElement;
    hasRings?: boolean;
}

interface ShootingStar {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    size: number;
}

export default function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const stars = useRef<Star[]>([]);
    const planets = useRef<Planet[]>([]);
    const shootingStars = useRef<ShootingStar[]>([]);
    const imagesLoaded = useRef(false);

    // Initialize celestial bodies
    useEffect(() => {
        // Create Stars
        const starColors = ['#ffffff', '#fbfcfc', '#fffbed', '#eef2ff', '#faf5ff', '#fff1f2', '#bae6fd'];
        if (stars.current.length === 0) {
            for (let i = 0; i < 2000; i++) {
                stars.current.push({
                    x: (Math.random() - 0.5) * 4000,
                    y: (Math.random() - 0.5) * 4000,
                    z: Math.random() * 4000,
                    size: 0.3 + Math.random() * 2.5,
                    color: starColors[Math.floor(Math.random() * starColors.length)],
                    glow: Math.random() > 0.85 ? 15 : 4,
                    pulseOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // Create Solar System
        if (planets.current.length === 0) {
            const sun: Planet = {
                name: "Sun",
                color: "#FDB813",
                size: 250,
                distance: 0,
                speed: 0,
                angle: 0,
                type: 'star',
                textureUrl: "/assets/planets/sun.jpg"
            };

            const earth: Planet = {
                name: "Earth",
                color: "#2E8B57",
                size: 90,
                distance: 900,
                speed: 0.0005,
                angle: Math.random() * Math.PI * 2,
                type: 'planet',
                textureUrl: "/assets/planets/earth.jpg"
            };

            const moon: Planet = {
                name: "Moon",
                color: "#cfcfcf",
                size: 25,
                distance: 140,
                speed: 0.02,
                angle: Math.random() * Math.PI * 2,
                type: 'moon',
                parent: earth,
                textureUrl: "/assets/planets/moon.jpg"
            };

            const mars: Planet = {
                name: "Mars",
                color: "#E27B58",
                size: 70,
                distance: 1400,
                speed: 0.0003,
                angle: Math.random() * Math.PI * 2,
                type: 'planet',
                textureUrl: "/assets/planets/mars.jpg"
            };

            const saturn: Planet = {
                name: "Saturn",
                color: "#E3E0C0",
                size: 160,
                distance: 2200,
                speed: 0.0001,
                angle: Math.random() * Math.PI * 2,
                type: 'planet',
                hasRings: true,
                textureUrl: "/assets/planets/saturn.jpg",
                ringTextureUrl: "/assets/planets/saturn_ring.png"
            };

            planets.current = [sun, earth, moon, mars, saturn];
        }

        // Load Images
        if (!imagesLoaded.current) {
            planets.current.forEach(p => {
                if (p.textureUrl) {
                    const img = new Image();
                    img.src = p.textureUrl;
                    img.onload = () => { p.texture = img; };
                }
                if (p.ringTextureUrl) {
                    const img = new Image();
                    img.src = p.ringTextureUrl;
                    img.onload = () => { p.ringTexture = img; };
                }
            });
            imagesLoaded.current = true;
        }

    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let yaw = 0;
        let pitch = 0;
        let time = 0;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = {
                x: 0,
                y: (e.clientY / height) * 2 - 1
            };
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        handleResize();

        const render = () => {
            ctx.fillStyle = "#030014";
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const fov = 800;
            time += 0.02;

            // Camera props
            yaw += 0.00008;
            pitch = (Math.sin(Date.now() * 0.00004) * 0.04) + (mousePos.current.y * 0.15);
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);

            // --- SHOOTING STARS ---
            if (Math.random() < 0.015) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 3000 + Math.random() * 1000;
                const startX = Math.cos(angle) * dist;
                const startY = (Math.random() - 0.5) * 2000;
                const startZ = Math.sin(angle) * dist;

                const speed = 40 + Math.random() * 40;
                const targetX = (Math.random() - 0.5) * 2000;
                const targetY = (Math.random() - 0.5) * 2000;
                const targetZ = (Math.random() - 0.5) * 2000;

                const dx = targetX - startX;
                const dy = targetY - startY;
                const dz = targetZ - startZ;
                const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

                shootingStars.current.push({
                    x: startX,
                    y: startY,
                    z: startZ,
                    vx: (dx / len) * speed,
                    vy: (dy / len) * speed,
                    vz: (dz / len) * speed,
                    life: 1.0,
                    size: 2 + Math.random() * 3
                });
            }

            for (let i = shootingStars.current.length - 1; i >= 0; i--) {
                const s = shootingStars.current[i];
                const prevX = s.x;
                const prevY = s.y;
                const prevZ = s.z;

                s.x += s.vx;
                s.y += s.vy;
                s.z += s.vz;
                s.life -= 0.01;

                if (s.life <= 0) {
                    shootingStars.current.splice(i, 1);
                    continue;
                }

                let x1 = prevX * cosYaw - prevZ * sinYaw;
                let z1 = prevZ * cosYaw + prevX * sinYaw;
                let y1 = prevY * cosPitch - z1 * sinPitch;
                let finalZ1 = z1 * cosPitch + prevY * sinPitch;

                let x2 = s.x * cosYaw - s.z * sinYaw;
                let z2 = s.z * cosYaw + s.x * sinYaw;
                let y2 = s.y * cosPitch - z2 * sinPitch;
                let finalZ2 = z2 * cosPitch + s.y * sinPitch;

                if (finalZ1 > 0 && finalZ2 > 0) {
                    const scale1 = fov / finalZ1;
                    const sx1 = cx + x1 * scale1;
                    const sy1 = cy + y1 * scale1;

                    const scale2 = fov / finalZ2;
                    const sx2 = cx + x2 * scale2;
                    const sy2 = cy + y2 * scale2;

                    const gradient = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
                    gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, ${s.life})`);

                    ctx.beginPath();
                    ctx.moveTo(sx1, sy1);
                    ctx.lineTo(sx2, sy2);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = s.size * scale2;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }

            // --- STARS ---
            const starsRef = stars.current;
            for (let i = 0; i < starsRef.length; i++) {
                const star = starsRef[i];
                star.z -= 0.5;
                if (star.z < 1) {
                    star.z += 4000;
                    star.x = (Math.random() - 0.5) * 4000;
                    star.y = (Math.random() - 0.5) * 4000;
                }

                let x = star.x;
                let z = star.z;

                let x2 = x * cosYaw - z * sinYaw;
                let z2 = z * cosYaw + x * sinYaw;

                let y = star.y;
                let y2 = y * cosPitch - z2 * sinPitch;
                let z3 = z2 * cosPitch + y * sinPitch;

                if (z3 > 0) {
                    const scale = fov / z3;
                    const screenX = cx + x2 * scale;
                    const screenY = cy + y2 * scale;
                    const size = star.size * scale;

                    if (screenX > 0 && screenX < width && screenY > 0 && screenY < height) {
                        ctx.beginPath();
                        const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + star.pulseOffset);
                        ctx.globalAlpha = 0.2 + 0.8 * twinkle;
                        ctx.fillStyle = star.color;
                        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                        ctx.fill();

                        if (star.glow > 2) {
                            ctx.shadowBlur = star.glow * (2000 / z3) * twinkle;
                            ctx.shadowColor = star.color;
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }
                        ctx.globalAlpha = 1.0;
                    }
                }
            }

            // --- PLANETS ---
            planets.current.forEach(planet => {
                if (planet.type !== 'star') {
                    planet.angle += planet.speed;
                }

                let px, py, pz;
                if (planet.type === 'moon' && planet.parent) {
                    const pDist = planet.parent.distance;
                    const pAngle = planet.parent.angle;
                    const parentX = Math.cos(pAngle) * pDist;
                    const parentZ = Math.sin(pAngle) * pDist;

                    px = parentX + Math.cos(planet.angle) * planet.distance;
                    py = 0;
                    pz = parentZ + Math.sin(planet.angle) * planet.distance + 2000;
                } else {
                    px = Math.cos(planet.angle) * planet.distance;
                    py = 0;
                    pz = Math.sin(planet.angle) * planet.distance + 2000;
                }

                let x2 = px * cosYaw - pz * sinYaw;
                let z2 = pz * cosYaw + px * sinYaw;

                let y = py;
                let y2 = y * cosPitch - z2 * sinPitch;
                let z3 = z2 * cosPitch + y * sinPitch;

                if (z3 > 0) {
                    const scale = fov / z3;
                    const screenX = cx + x2 * scale;
                    const screenY = cy + y2 * scale;
                    const size = planet.size * scale;

                    // Draw Planet
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                    ctx.clip(); // Mask to circle

                    if (planet.texture) {
                        ctx.drawImage(planet.texture, screenX - size, screenY - size, size * 2, size * 2);

                        // Inner shadow for sphere effect
                        const gradient = ctx.createRadialGradient(screenX - size * 0.3, screenY - size * 0.3, size * 0.1, screenX, screenY, size);
                        if (planet.type === 'star') {
                            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                            gradient.addColorStop(1, 'rgba(255, 200, 50, 0.2)');
                        } else {
                            gradient.addColorStop(0, 'rgba(0,0,0,0)');
                            gradient.addColorStop(0.8, 'rgba(0,0,0,0.3)');
                            gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
                        }
                        ctx.fillStyle = gradient;
                        ctx.fill();

                    } else {
                        // Fallback
                        ctx.fillStyle = planet.color;
                        ctx.fill();
                    }
                    ctx.restore(); // Remove clip

                    // Sun Glow
                    if (planet.type === 'star') {
                        const sunPulse = 1 + 0.05 * Math.sin(time * 0.5);
                        ctx.shadowBlur = (100 * scale) * sunPulse;
                        ctx.shadowColor = planet.color;

                        // Helper to draw glow without texture interference
                        ctx.globalCompositeOperation = 'screen';
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(253, 184, 19, 0.2)`;
                        ctx.fill();
                        ctx.globalCompositeOperation = 'source-over';

                        // Corona
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, size * 1.5 * sunPulse, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(253, 184, 19, 0.1)`;
                        ctx.fill();

                        ctx.shadowBlur = 0;
                    }

                    // Rings (Saturn)
                    if (planet.hasRings && planet.ringTexture) {
                        ctx.save();
                        // 3D transform for ring
                        // Simple 2D approximation: scale Y based on pitch
                        const ringW = size * 4.5;
                        const ringH = size * 4.5 * 0.4; // Tilted aspect

                        ctx.translate(screenX, screenY);
                        ctx.rotate(pitch * -0.5); // Tilt
                        ctx.drawImage(planet.ringTexture, -ringW / 2, -ringH / 2, ringW, ringH);
                        ctx.restore();
                    } else if (planet.hasRings) {
                        // Procedural fallback
                        ctx.beginPath();
                        ctx.ellipse(screenX, screenY, size * 2.2, size * 0.6, pitch * -0.5, 0, Math.PI * 2);
                        ctx.strokeStyle = "rgba(200, 200, 180, 0.4)";
                        ctx.lineWidth = size * 0.5;
                        ctx.stroke();
                    }

                    ctx.shadowBlur = 0;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none"
            style={{ background: '#030014' }}
        />
    );
}
