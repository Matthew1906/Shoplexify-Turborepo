import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  mode:"jit",
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
    'h-60',
    'z-50',
    'bg-transparent',
    'overflow-y-auto',
    'fixed', 'relative',
    'top-0',
    'left-0',
    {
      pattern: /animate-\[.*\]/,
    },
    {
      pattern: /max-h-\[.*\]/,
    }
  ],
  plugins: [],
};

export default config;
