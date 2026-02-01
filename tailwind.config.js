/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./App.tsx",
      "./types.ts",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Permet d'activer le mode sombre manuellement
    theme: {
      extend: {
        colors: {
          // Optionnel : tu peux ajouter les couleurs officielles FSTI ici
          brand: {
            blue: '#2563eb',
            dark: '#0f172a',
          }
        },
      },
    },
    plugins: [],
  }