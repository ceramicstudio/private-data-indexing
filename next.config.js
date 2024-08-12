/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import CopyPlugin from "copy-webpack-plugin";

function patchWasmModuleImport(config, isServer) {
  config.experiments = {
    layers: true,
    asyncWebAssembly: true,
  };

  if (isServer) {
    config.output.webassemblyModuleFilename =
      "./../server/chunks/[modulehash].wasm";

    const patterns = [];

    const destinations = [
      "../static/wasm/[name][ext]", // -> .next/static/wasm
      "./static/wasm/[name][ext]", // -> .next/server/static/wasm
      ".", // -> .next/server/chunks (for some reason this is necessary)
    ];
    for (const dest of destinations) {
      patterns.push({
        context: ".next/server/chunks",
        from: ".",
        to: dest,
        filter: (resourcePath) => resourcePath.endsWith(".wasm"),
        noErrorOnMissing: true,
      });
    }

    config.plugins.push(new CopyPlugin({ patterns }));
  }
}

/** @type {import("next").NextConfig} */
const config = {
  // reactStrictMode: true,

  // /**
  //  * If you are using `appDir` then you must comment the below `i18n` config out.
  //  *
  //  * @see https://github.com/vercel/next.js/issues/41980
  //  */
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  // output: "export",
  webpack: (config, options) => {
    patchWasmModuleImport(config, options.isServer);
    return config;
  },
};

export default config;
