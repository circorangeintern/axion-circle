/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0E7C66",      // Primary Green — trust, cleanliness, environment
          amber: "#F59E0B",        // Accent Amber — visibility, alerts, action
          dark: "#1F2937",         // Dark Text — clarity, readability
          mint: "#EAF7F2",         // Soft Mint — calm, clean backgrounds
          white: "#FFFFFF",        // White — simplicity, space
        },
        status: {
          reported: "#F59E0B",     // Amber — awaiting review
          acknowledged: "#3B82F6", // Blue — under investigation
          inprogress: "#8B5CF6",   // Purple — being fixed
          resolved: "#10B981",     // Green — issue fixed
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
