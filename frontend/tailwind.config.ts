import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1B5E20",
          secondary: "#4CAF50",
          light: "#E8F5E9",
        },
        status: {
          reported: "#F59E0B",    // Amber
          acknowledged: "#3B82F6", // Blue
          inprogress: "#8B5CF6",  // Purple
          resolved: "#10B981",    // Green
        },
      },
    },
  },
  plugins: [],
};

export default config;
