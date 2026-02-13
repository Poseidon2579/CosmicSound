"use client";

import React, { useEffect, useRef, useState } from 'react';

// --- Types ---
interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface CelestialObject {
    pos: Vector3;
    type: 'planet' | 'nebula' | 'blackhole';
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
        const fov = 800; // Field of view depth

        // --- Assets ---
        const starCount = 1000;
        const stars: Vector3[] = [];
        for (let i = 0; i < starCount; i++) {
            // Distribute stars on a large sphere
            const phi = Math.acos(-1 + (2 * i) / starCount);
            const theta = Math.sqrt(starCount * Math.PI) * phi;
            const r = 2000 + Math.random() * 500;
            stars.push({
                x: r * Math.cos(theta) * Math.sin(phi),
                y: r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(phi)
            });
        }

        const celestialObjects: CelestialObject[] = [
            { pos: { x: 1200, y: -400, z: 800 }, type: 'planet', size: 120, color: '#a855f7', seed: 42 }, // Lavender Gas Giant
            { pos: { x: -1500, y: 300, z: -500 }, type: 'blackhole', size: 180, color: '#f97316', seed: 101 }, // Accretion disk
            { pos: { x: 200, y: 1400, z: -1200 }, type: 'nebula', size: 400, color: '#3b82f6', seed: 777 }, // Blue Nebula
            { pos: { x: -800, y: -1200, z: 1500 }, type: 'nebula', size: 350, color: '#ec4899', seed: 99 }  // Pink Nebula
        ];

        let shootingStars: { pos: Vector3; vel: Vector3; life: number }[] = [];

        // --- Projection Logic ---
        function project(p: Vector3) {
            // Rotate around Y (Yaw)
            let x = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
            let z = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
            let y = p.y;

            // Rotate around X (Pitch)
            let y_final = y * Math.cos(pitch) - z * Math.sin(pitch);
            let z_final = y * Math.sin(pitch) + z * Math.cos(pitch);

            if (z_final < 100) return null; // Behind camera or too close

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
            const grad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, size * 0.1, x, y, size);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.2, color);
            grad.addColorStop(1, '#000');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Atmosphere glow
            ctx.shadowBlur = size * 0.5;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Rings (optional/procedural)
            ctx.strokeStyle = `${color}44`;
            ctx.lineWidth = size * 0.1;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 2.2, size * 0.4, Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        function drawBlackHole(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
            // Accretion Disk (Glow)
            const grad = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 2.5);
            grad.addColorStop(0.2, '#f97316');
            grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 3, size * 0.8, -Math.PI / 8, 0, Math.PI * 2);
            ctx.fill();

            // Event Horizon (Black)
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Light bending border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.62, 0, Math.PI * 2);
            ctx.stroke();
        }

        function drawNebula(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `${color}22`);
            grad.addColorStop(0.6, `${color}11`);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Animation Loop ---
        function animate() {
            if (!ctx || !canvas) return;

            // Drift & Auto-rotation
            yaw += 0.0003; // Slow 360 rotation
            pitch = (Math.sin(Date.now() * 0.0001) * 0.1) + (mousePos.current.y * 0.05);
            yaw += mousePos.current.x * 0.05;

            // Background fill
            ctx.fillStyle = '#020208';
            ctx.fillRect(0, 0, width, height);

            // Layered Rendering (Distance sorting could be added, but stars are far)

            // 1. Nebulae (Back)
            celestialObjects.filter(o => o.type === 'nebula').forEach(obj => {
                const p = project(obj.pos);
                if (p) drawNebula(ctx, p.x, p.y, obj.size * p.scale * 2, obj.color);
            });

            // 2. Stars
            ctx.fillStyle = 'white';
            stars.forEach(s => {
                const p = project(s);
                if (p) {
                    const size = Math.max(0.1, p.scale * 2);
                    ctx.globalAlpha = Math.min(1, p.scale * 5);
                    ctx.fillRect(p.x, p.y, size, size);
                }
            });
            ctx.globalAlpha = 1;

            // 3. Celestial Bodies (Front/Mid)
            celestialObjects.filter(o => o.type !== 'nebula').forEach(obj => {
                const p = project(obj.pos);
                if (p) {
                    if (obj.type === 'planet') drawPlanet(ctx, p.x, p.y, obj.size * p.scale, obj.color);
                    if (obj.type === 'blackhole') drawBlackHole(ctx, p.x, p.y, obj.size * p.scale);
                }
            });

            // 4. Shooting Stars
            if (Math.random() < 0.01) {
                // Spawn randomly in 3D
                const angle = Math.random() * Math.PI * 2;
                const r = 2000;
                shootingStars.push({
                    pos: { x: r * Math.cos(angle), y: (Math.random() - 0.5) * 1000, z: r * Math.sin(angle) },
                    vel: { x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 50, z: (Math.random() - 0.5) * 50 },
                    life: 1.0
                });
            }

            shootingStars.forEach((s, i) => {
                const pStart = project(s.pos);
                s.pos.x += s.vel.x;
                s.pos.y += s.vel.y;
                s.pos.z += s.vel.z;
                const pEnd = project(s.pos);
                s.life -= 0.02;

                if (pStart && pEnd && s.life > 0) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`;
                    ctx.lineWidth = 2 * pStart.scale;
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

        // --- Interaction ---
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Normalized -1 to 1
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
