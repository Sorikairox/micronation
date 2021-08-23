module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      primary: {
        base: "#1672EC",
        dark: "#0F56B3",
        light: "#8AB9F6",
      },
      grey: {
        base: "#839199",
        dark: "#142130",
        light: "#DCDEE4",
      },
      white: "#FAFBFF",
      black: "#17161A",
      negative: {
        base: "#D52941",
        dark: "#9C001B",
        light: "#FAC8C8",
      },
      positive: {
        base: "#26CF7D",
        dark: "#009D50",
        light: "#C8FADC",
      },
    },
    extend: {
      screens: {
        sm: "640px",
        // => @media (min-width: 640px) { ... }

        md: "768px",
        // => @media (min-width: 768px) { ... }

        lg: "1024px",
        // => @media (min-width: 1024px) { ... }

        xl: "1280px",
        // => @media (min-width: 1280px) { ... }

        "2xl": "1536px",
        // => @media (min-width: 1536px) { ... }
      },
      fontFamily: {
        montserrat: ["Montserrat"],
        roboto: ["Roboto"],
      },
      typography: {
        montserrat: {
          css: {
            fontFamily: "Montserrat",
            h1: {
              fontWeight: "bold",
              fontSize: 96,
            },
            h2: {
              fontWeight: "bold",
              fontSize: 60,
            },
            h3: {
              fontWeight: "bold",
              fontSize: 48,
            },
            h4: {
              fontWeight: "bold",
              fontSize: 34,
            },
            h5: {
              fontWeight: "bold",
              fontSize: 24,
            },
            h6: {
              fontWeight: "bold",
              fontSize: 20,
            },
            ".body-1": {
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "0.01em",
            },
            ".body-2": {
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "0.005em",
            },
            ".subtitle": {
              fontWeight: 500, //medium
              fontSize: 14,
              letterSpacing: "0.1px",
              lineHeight: "24px",
            },
            ".button": {
              fontWeight: 500, //medium
              fontSize: 14,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              lineHeight: "17px",
            },
          },
        },
        roboto: {
          css: {
            fontFamily: "Roboto",
            h1: {
              fontWeight: "bold",
              fontSize: 96,
            },
            h2: {
              fontWeight: "bold",
              fontSize: 60,
            },
            h3: {
              fontWeight: "bold",
              fontSize: 48,
            },
            h4: {
              fontWeight: "bold",
              fontSize: 34,
            },
            h5: {
              fontWeight: "bold",
              fontSize: 24,
            },
            h6: {
              fontWeight: "bold",
              fontSize: 20,
            },
            ".body-1": {
              fontSize: 16,
              lineHeight: "19px",
              letterSpacing: "0.01em",
            },
            ".body-2": {
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "0.005em",
            },
            ".subtitle": {
              fontWeight: 500, //medium
              fontSize: 14,
              letterSpacing: "0.1px",
              lineHeight: "24px",
            },
            ".button": {
              fontWeight: 500, //medium
              fontSize: 14,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              lineHeight: "16px",
            },
          },
        },
      },
    },
  },
  variants: { extends: {} },
  plugins: [require("@tailwindcss/typography")],
};
