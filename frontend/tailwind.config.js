/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paragraph: "#344054",
        primary: "#127C2F",
        accent: "#FEAA01",
        black: Object.assign("#001310", {
          DEFAULT: "#001310",
          main: "#001310",
          placeholder: "#80838D",
          icon: "#667085",
        }),
        white: {
          DEFAULT: "#FFFFFF",
          stroke: "#D0D5DD",
          bg: "#F9FAFB",
          bg2: "#F2F4F7",
        },
        alert: {
          error: "#DB0404",
          errorLight: "#FFE8E8",
          errorStroke: "#FFC4C4",
          info: "#006FED",
          infoLight: "#EBF9FF",
          infoStroke: "#B2DDFF",
          inprogress: "#8B5CF6",
          inprogressLight: "#F7F3FF",
          inprogressStroke: "#D4C0FF",
          progress: "#8B5CF6",
          progressLight: "#F7F3FF",
          warning: "#FEAA01",
          warningLight: "#FFFDE7",
          warningStroke: "#FEEFD1",
          success: "#127C2F",
          successLight: "#E9FFEA",
          successStroke: "#ABEFC6",
        },
        brand: {
          primary: "#127C2F",
          amber: "#FEAA01",
          accent: "#FEAA01",
          dark: "#001310",
          blackMain: "#001310",
          mint: "#E9FFEA",
          white: "#FFFFFF",
        },
        status: {
          reported: "#FEAA01",
          acknowledged: "#006FED",
          inprogress: "#8B5CF6",
          resolved: "#127C2F",
        },
      },
      maxWidth: {
        'auth-form': '480px',
      },
      fontSize: {
        'auth-heading': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'auth-subtext': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
