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
    const shootingStars = useRef<ShootingStar[]>([]);
    const mousePos = useRef({ x: 0, y: 0 });
    const stars = useRef<Star[]>([]);


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
            const fov = 1000; // Increased FOV for depth
            time += 0.02;

            // Camera props
            yaw += 0.00005;
            pitch = (Math.sin(Date.now() * 0.00004) * 0.04) + (mousePos.current.y * 0.15);
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);

            // --- SHOOTING STARS ---
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 4000 + Math.random() * 2000;
                const startX = Math.cos(angle) * dist;
                const startY = (Math.random() - 0.5) * 3000;
                const startZ = Math.sin(angle) * dist;

                const speed = 50 + Math.random() * 50;
                const targetX = (Math.random() - 0.5) * 3000;
                const targetY = (Math.random() - 0.5) * 3000;
                const targetZ = (Math.random() - 0.5) * 3000;

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
                    star.z += 6000;
                    star.x = (Math.random() - 0.5) * 6000;
                    star.y = (Math.random() - 0.5) * 6000;
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

            // --- PLANETS & SUN REMOVED FOR PERFORMANCE ---
            // User requested to keep only stars and shooting stars to improve mobile performance.

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
