import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#9d4edd',
                'secondary': '#e0aaff',
                'accent': '#ff007f',
                'background-light': '#ffffff',
                'background-dark': '#050510',
                'surface-light': '#f3f4f6',
                'surface-dark': 'rgba(20, 20, 40, 0.7)',
                'text-primary-light': '#1f2937',
                'text-primary-dark': '#f9fafb',
                'text-secondary-light': '#6b7280',
                'text-secondary-dark': '#9ca3af',
                'cosmic-bg': '#050510',
                'cosmic-card': 'rgba(20, 20, 40, 0.7)',
                'cosmic-accent': '#9d4edd',
                'deep-void': '#050510',
                'text-main': '#f9fafb',
                'text-muted': '#9ca3af',
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "sans": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
        },
    },
    plugins: [
        containerQueries,
    ],
};
export default config;
