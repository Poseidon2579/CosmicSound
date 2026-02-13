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
        let yaw = 0; // Horizontal auto-rotation
        let pitch = 0; // Vertical manual tilt
        const fov = 1000; // Field of view depth

        // --- Assets ---
        const starCount = 1500;
        const stars: Star[] = [];
        // Space isn't just black and white! Let's reflect that.
        const starColors = [
            '#ffffff', // White
            '#fbfcfc', // Off-white
            '#fffbed', // Soft yellow
            '#eef2ff', // Soft blue
            '#faf5ff', // Soft purple
            '#fff1f2', // Soft red
            '#bae6fd'  // Sky blue
        ];

        for (let i = 0; i < starCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / starCount);
            const theta = Math.sqrt(starCount * Math.PI) * phi;
            const r = 2500 + Math.random() * 1000;
            stars.push({
                pos: {
                    x: r * Math.cos(theta) * Math.sin(phi),
                    y: r * Math.sin(theta) * Math.sin(phi),
                    z: r * Math.cos(phi)
                },
                size: 0.3 + Math.random() * 2.5, // Varied sizes for depth
                color: starColors[Math.floor(Math.random() * starColors.length)],
                glow: Math.random() > 0.85 ? 15 : 4
            });
        }

        const celestialObjects: CelestialObject[] = [
            { pos: { x: 1200, y: -400, z: 800 }, type: 'planet', size: 140, color: '#a855f7', seed: 42 },
            { pos: { x: -2500, y: 800, z: -1200 }, type: 'planet', size: 200, color: '#3b82f6', seed: 99 },
            { pos: { x: 800, y: 1500, z: -3000 }, type: 'planet', size: 120, color: '#10b981', seed: 123 },
            { pos: { x: -3500, y: -1200, z: 2500 }, type: 'planet', size: 280, color: '#ef4444', seed: 456 },
            { pos: { x: 4000, y: 500, z: -500 }, type: 'planet', size: 160, color: '#f59e0b', seed: 789 },
            { pos: { x: 0, y: 2500, z: 1000 }, type: 'nebula', size: 800, color: '#6366f1', seed: 777 },
            { pos: { x: -2000, y: -2500, z: -1500 }, type: 'nebula', size: 700, color: '#ec4899', seed: 88 }
        ];

        let shootingStars: { pos: Vector3; vel: Vector3; life: number }[] = [];

        // --- Projection Logic ---
        function project(p: Vector3) {
            // Constant drift (Slow auto-rotation)
            let x = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
            let z = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
            let y = p.y;

            // Manual Vertical tilt
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
            grad.addColorStop(1, '#050510');

            ctx.shadowBlur = size * 0.4;
            ctx.shadowColor = color;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Atmosphere
            ctx.strokeStyle = `${color}22`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.05, 0, Math.PI * 2);
            ctx.stroke();
        }

        function drawNebula(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `${color}12`);
            grad.addColorStop(0.5, `${color}06`);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Animation Loop ---
        function animate() {
            if (!ctx || !canvas) return;

            // GHOSTLY Slow movement
            yaw += 0.00008;
            // Control pitch (Y only) via mouse
            pitch = (Math.sin(Date.now() * 0.00004) * 0.04) + (mousePos.current.y * 0.15);

            ctx.fillStyle = '#010103';
            ctx.fillRect(0, 0, width, height);

            // Distance sorting: far to near
            // 1. Nebulae
            celestialObjects.filter(o => o.type === 'nebula').forEach(obj => {
                const p = project(obj.pos);
                if (p) drawNebula(ctx, p.x, p.y, obj.size * p.scale * 2.8, obj.color);
            });

            // 2. Multicolored Stars
            stars.forEach(s => {
                const p = project(s.pos);
                if (p) {
                    const finalSize = s.size * p.scale;
                    if (finalSize < 0.15) return;

                    ctx.globalAlpha = Math.min(1, p.scale * 3);
                    if (s.glow > 5 && p.scale > 0.7) {
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

            // 4. Ghostly Shooting Stars
            if (Math.random() < 0.006) {
                const angle = Math.random() * Math.PI * 2;
                const r = 3500;
                shootingStars.push({
                    pos: { x: r * Math.cos(angle), y: (Math.random() - 0.5) * 3000, z: r * Math.sin(angle) },
                    vel: { x: (Math.random() - 0.5) * 35, y: (Math.random() - 0.5) * 35, z: (Math.random() - 0.5) * 35 },
                    life: 1.0
                });
            }

            shootingStars.forEach((s, i) => {
                const pStart = project(s.pos);
                s.pos.x += s.vel.x;
                s.pos.y += s.vel.y;
                s.pos.z += s.vel.z;
                const pEnd = project(s.pos);
                s.life -= 0.012;

                if (pStart && pEnd && s.life > 0) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${s.life * 0.6})`;
                    ctx.lineWidth = 1 * pStart.scale;
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
            // We ignore e.clientX for stability
            mousePos.current = {
                x: 0, // Locked
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
