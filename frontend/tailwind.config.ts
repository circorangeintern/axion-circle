import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1B5E20",
          secondary: "#4CAF50",
          light: "#E8F5E9",
          dark: "#0D3B13",
        },
        status: {
          reported: "#F59E0B",
          acknowledged: "#3B82F6",
          inprogress: "#8B5CF6",
          resolved: "#10B981",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
