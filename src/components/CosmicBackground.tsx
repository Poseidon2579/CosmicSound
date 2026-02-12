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
        const starCount = 400;

        class Star {
            x: number;
            y: number;
            size: number;
            opacity: number;
            speed: number;
            pulseSpeed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random();
                this.speed = Math.random() * 0.02;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
            }

            update() {
                this.opacity += this.pulseSpeed;
                if (this.opacity > 1 || this.opacity < 0.2) {
                    this.pulseSpeed = -this.pulseSpeed;
                }
                // Subtle drift
                this.x += this.speed;
                if (this.x > width) this.x = 0;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.shadowBlur = this.size * 2;
                ctx.shadowColor = "white";
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

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
                this.y = Math.random() * height * 0.4;
                this.length = Math.random() * 100 + 50;
                this.speed = Math.random() * 15 + 10;
                this.angle = Math.PI / 4;
                this.opacity = 1;
                this.active = true;
            }

            update() {
                this.x += this.speed * Math.cos(this.angle);
                this.y += this.speed * Math.sin(this.angle);
                this.opacity -= 0.015;

                if (this.opacity <= 0) {
                    this.active = false;
                }
            }

            draw() {
                if (!ctx) return;
                const grad = ctx.createLinearGradient(
                    this.x, this.y,
                    this.x - this.length * Math.cos(this.angle),
                    this.y - this.length * Math.sin(this.angle)
                );
                grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.strokeStyle = grad;
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

        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            // Nebula Background
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
            gradient.addColorStop(0, 'rgba(30, 15, 60, 0.3)');
            gradient.addColorStop(0.5, 'rgba(10, 5, 30, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            if (Math.random() < 0.005) { // Adjusted frequency
                shootingStars.push(new ShootingStar());
            }

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const s = shootingStars[i];
                s.update();
                s.draw();
                if (!s.active) shootingStars.splice(i, 1);
            }

            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Update star positions for new width/height
            stars.forEach(s => {
                if (s.x > width) s.x = Math.random() * width;
                if (s.y > height) s.y = Math.random() * height;
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-50 pointer-events-none bg-[#020208]"
        />
    );
}
