import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors:{
        "blue":"#006A82",
        "green":"#026D13",
        "red":"#860000",
        "yellow":"#FFC400",
        "navy-blue":"#293040"
      }
    },
  },
  safelist:[
    {
      pattern: /bg-(green|blue|yellow|red|navy-blue|black|white)/
    },
    {
      pattern: /text-(green|blue|yellow|red|navy-blue|black|white)/
    },
    {
      pattern: /border-(green|blue|yellow|red|navy-blue|black|white)/
    },
  ],
  plugins: [],
};
export default config;
