/** @type {import('tailwindcss').Config} */
// Lives at frontend/ root (where the Tailwind/PostCSS toolchain looks for it).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // TAYU official brand palette (exact hex from brand spec)
        electric: '#1464F0', // primary buttons, headings, links
        navy: '#071748', // background, text, navigation
        teal: '#00DCA0', // accents, highlights, success
        brandpurple: '#7850F0', // secondary accents, interactive
        lightbg: '#F9F9F9',

        // Jar semantics (kept for the allocation activity)
        spend: '#1464F0', // electric blue — spend
        save: '#00DCA0', // teal — save
        give: '#7850F0', // purple — give
        highlight: '#00DCA0', // success/highlight -> teal
        tayubg: '#071748', // deep navy background
      },
      fontFamily: {
        display: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
