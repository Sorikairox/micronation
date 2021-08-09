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
      fontFamily: {
        montserrat: ["Montserrat"],
        roboto: ["Roboto"],
      },
      typography: {
        montserrat: {
          css: {
            fontFamily: "Montserrat",
            h1: {
              fontSize: 96,
            },
            h2: {
              fontSize: 60,
            },
            h3: {
              fontSize: 48,
            },
            h4: {
              fontSize: 34,
            },
            h5: {
              fontSize: 24,
            },
            h6: {
              fontSize: 20,
            },
            ".body-1": {
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "0.01em",
            },
            ".body-2": {
              fontSize: 14,
              lineHeihgt: "20px",
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
              fontSize: 96,
            },
            h2: {
              fontSize: 60,
            },
            h3: {
              fontSize: 48,
            },
            h4: {
              fontSize: 34,
            },
            h5: {
              fontSize: 24,
            },
            h6: {
              fontSize: 20,
            },
            ".body-1": {
              fontSize: 16,
              lineHeight: "19px",
              letterSpacing: "0.01em",
            },
            ".body-2": {
              fontSize: 14,
              lineHeihgt: "20px",
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
