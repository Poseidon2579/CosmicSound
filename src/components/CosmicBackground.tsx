"use client";

import React, { useEffect, useRef } from 'react';

export default function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars: Star[] = [];
        const shootingStars: ShootingStar[] = [];
        const starCount = 200; // Number of stars

        // Star Class
        class Star {
            x: number;
            y: number;
            size: number;
            opacity: number;
            speed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2;
                this.opacity = Math.random();
                this.speed = Math.random() * 0.05;
            }

            update() {
                this.opacity += this.speed;
                if (this.opacity > 1 || this.opacity < 0) {
                    this.speed = -this.speed;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Shooting Star Class
        class ShootingStar {
            x: number;
            y: number;
            length: number;
            speed: number;
            angle: number;
            opacity: number;
            active: boolean;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height / 2; // Start from top half
                this.length = Math.random() * 80 + 10;
                this.speed = Math.random() * 10 + 5;
                this.angle = Math.PI / 4; // 45 degrees
                this.opacity = 1;
                this.active = true;
            }

            update() {
                this.x += this.speed * Math.cos(this.angle);
                this.y += this.speed * Math.sin(this.angle);
                this.length -= 0.5;
                this.opacity -= 0.01;

                if (this.opacity <= 0 || this.length <= 0) {
                    this.active = false;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x - this.length * Math.cos(this.angle),
                    this.y - this.length * Math.sin(this.angle)
                );
                ctx.stroke();
            }
        }

        // Initialize Stars
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            // Draw Nebula (Simulated with gradients)
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
            gradient.addColorStop(0, 'rgba(20, 10, 40, 0.4)'); // Deep purple center
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Update and Draw Stars
            stars.forEach(star => {
                star.update();
                star.draw();
            });

            // Randomly spawn shooting stars
            if (Math.random() < 0.01) { // 1% chance per frame
                shootingStars.push(new ShootingStar());
            }

            // Update and Draw Shooting Stars
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const s = shootingStars[i];
                s.update();
                s.draw();
                if (!s.active) {
                    shootingStars.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none bg-[#050510]" // Dark cosmic background
        />
    );
}
