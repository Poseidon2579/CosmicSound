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
                'primary': '#2513ec',
                'background-dark': '#121022',
                'surface-dark': '#1c1c2e',
                'cosmic-bg': '#121022',
                'cosmic-card': '#1c1c2e',
                'cosmic-accent': '#2513ec',
                'deep-void': '#0a0a1a',
                'text-main': '#F3F4F6',
                'text-muted': '#9CA3AF',
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
