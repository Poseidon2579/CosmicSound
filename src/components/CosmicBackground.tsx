"use client";

import React, { useEffect, useRef, useState } from 'react';

// --- Types ---
interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Star {
    pos: Vector3;
    size: number;
    color: string;
    glow: number;
}

interface CelestialObject {
    pos: Vector3;
    type: 'planet' | 'nebula' | 'blackhole' | 'cluster';
    size: number;
    color: string;
    seed: number;
}

export default function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // --- Camera State ---
        let yaw = 0; // Horizontal rotation
        let pitch = 0; // Vertical rotation
        const fov = 1000; // Field of view depth

        // --- Assets ---
        const starCount = 1200;
        const stars: Star[] = [];
        const starColors = ['#fff', '#bae6fd', '#fef08a', '#fecaca', '#ddd6fe'];

        for (let i = 0; i < starCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / starCount);
            const theta = Math.sqrt(starCount * Math.PI) * phi;
            const r = 2500 + Math.random() * 800;
            stars.push({
                pos: {
                    x: r * Math.cos(theta) * Math.sin(phi),
                    y: r * Math.sin(theta) * Math.sin(phi),
                    z: r * Math.cos(phi)
                },
                size: 0.5 + Math.random() * 2.5,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                glow: Math.random() > 0.8 ? 20 : 5
            });
        }

        const celestialObjects: CelestialObject[] = [
            { pos: { x: 1200, y: -400, z: 800 }, type: 'planet', size: 140, color: '#a855f7', seed: 42 }, // Lavender
            { pos: { x: -2000, y: 600, z: -1500 }, type: 'planet', size: 180, color: '#3b82f6', seed: 99 }, // Blue gas
            { pos: { x: 800, y: 1200, z: -2500 }, type: 'planet', size: 100, color: '#10b981', seed: 123 }, // Greenish
            { pos: { x: -3000, y: -800, z: 2000 }, type: 'planet', size: 220, color: '#ef4444', seed: 456 }, // Red Giant
            { pos: { x: 0, y: 2000, z: 500 }, type: 'nebula', size: 600, color: '#6366f1', seed: 777 },
            { pos: { x: -1500, y: -2000, z: -1000 }, type: 'nebula', size: 500, color: '#ec4899', seed: 88 }
        ];

        let shootingStars: { pos: Vector3; vel: Vector3; life: number }[] = [];

        // --- Projection Logic ---
        function project(p: Vector3) {
            // Rotate around Y (Yaw) - Horizontal only auto
            let x = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
            let z = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
            let y = p.y;

            // Rotate around X (Pitch) - Controlled by mouse y
            let y_final = y * Math.cos(pitch) - z * Math.sin(pitch);
            let z_final = y * Math.sin(pitch) + z * Math.cos(pitch);

            if (z_final < 100) return null;

            const scale = fov / z_final;
            return {
                x: (x * scale) + width / 2,
                y: (y_final * scale) + height / 2,
                scale: scale,
                z: z_final
            };
        }

        // --- Render Helpers ---
        function drawPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
            ctx.save();
            const grad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, size * 0.1, x, y, size);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.2, color);
            grad.addColorStop(1, '#08081a');

            ctx.shadowBlur = size * 0.4;
            ctx.shadowColor = color;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Atmosphere
            ctx.strokeStyle = `${color}33`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.05, 0, Math.PI * 2);
            ctx.stroke();
        }

        function drawNebula(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `${color}15`);
            grad.addColorStop(0.5, `${color}08`);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Animation Loop ---
        function animate() {
            if (!ctx || !canvas) return;

            // EXTREMELY Slow Rotation
            yaw += 0.0001;
            // Only vertical mouse control
            pitch = (Math.sin(Date.now() * 0.00005) * 0.05) + (mousePos.current.y * 0.2);

            ctx.fillStyle = '#010105';
            ctx.fillRect(0, 0, width, height);

            // 1. Nebulae
            celestialObjects.filter(o => o.type === 'nebula').forEach(obj => {
                const p = project(obj.pos);
                if (p) drawNebula(ctx, p.x, p.y, obj.size * p.scale * 2.5, obj.color);
            });

            // 2. Stars with Glow and Color
            stars.forEach(s => {
                const p = project(s.pos);
                if (p) {
                    const finalSize = s.size * p.scale;
                    if (finalSize < 0.2) return;

                    ctx.globalAlpha = Math.min(1, p.scale * 4);
                    if (s.glow > 5 && p.scale > 0.8) {
                        ctx.shadowBlur = s.glow;
                        ctx.shadowColor = s.color;
                    }

                    ctx.fillStyle = s.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, finalSize, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.shadowBlur = 0;
                }
            });
            ctx.globalAlpha = 1;

            // 3. Planets
            celestialObjects.filter(o => o.type === 'planet').forEach(obj => {
                const p = project(obj.pos);
                if (p) drawPlanet(ctx, p.x, p.y, obj.size * p.scale, obj.color);
            });

            // 4. Shooting Stars
            if (Math.random() < 0.008) {
                const angle = Math.random() * Math.PI * 2;
                const r = 3000;
                shootingStars.push({
                    pos: { x: r * Math.cos(angle), y: (Math.random() - 0.5) * 2000, z: r * Math.sin(angle) },
                    vel: { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40, z: (Math.random() - 0.5) * 40 },
                    life: 1.0
                });
            }

            shootingStars.forEach((s, i) => {
                const pStart = project(s.pos);
                s.pos.x += s.vel.x;
                s.pos.y += s.vel.y;
                s.pos.z += s.vel.z;
                const pEnd = project(s.pos);
                s.life -= 0.015;

                if (pStart && pEnd && s.life > 0) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${s.life * 0.8})`;
                    ctx.lineWidth = 1.5 * pStart.scale;
                    ctx.beginPath();
                    ctx.moveTo(pStart.x, pStart.y);
                    ctx.lineTo(pEnd.x, pEnd.y);
                    ctx.stroke();
                }
            });
            shootingStars = shootingStars.filter(s => s.life > 0);

            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = {
                x: (e.clientX / width) * 2 - 1,
                y: (e.clientY / height) * 2 - 1
            };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none"
        />
    );
}
