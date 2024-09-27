module.exports = {
    apps : [
      {
        name:"shoplexify-dev",
        script: "C:\\Users\\admin\\AppData\\Roaming\\npm\\node_modules\\pnpm\\bin\\pnpm.cjs",
        args: 'run dev',
        env: {
          NODE_ENV: 'production',
        },
      },
      {
        name:"shoplexify-production",
        script: "C:\\Users\\admin\\AppData\\Roaming\\npm\\node_modules\\pnpm\\bin\\pnpm.cjs",
        args: 'run start',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  