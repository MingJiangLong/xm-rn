module.exports = {
  presets: ["@babel/preset-env",],
};

module.exports = {
  plugins: [
    [
      "module-resolver", {
        root: ["./src"],
        extensions: [
          ".ios.tsx", ".android.tsx", ".ios.ts",
          ".android.ts", ".ts", ".tsx", ".json", ".js"
        ],
        alias: {
          "@": ["./src"]
        }
      }
    ],
  ]
};