const path = require("node:path");
const { unstable_transformerPath } = require("expo/metro-config");

const expoTransformer = require(unstable_transformerPath);
const reactNativeCssRoot = path.dirname(
  require.resolve("react-native-css/package.json")
);
const reactNativeCssTransformer = require(path.join(
  reactNativeCssRoot,
  "dist/commonjs/metro/metro-transformer.js"
));

function isExpoLogBoxCssModule(filePath) {
  return (
    filePath.endsWith(".module.css") &&
    filePath.includes(`${path.sep}@expo${path.sep}log-box${path.sep}`)
  );
}

async function transform(config, projectRoot, filePath, data, options) {
  if (options.platform !== "web" && isExpoLogBoxCssModule(filePath)) {
    const result = await expoTransformer.transform(
      config,
      projectRoot,
      filePath,
      data,
      {
        ...options,
        platform: "web",
      }
    );

    if (result.output?.[0]?.data?.css) {
      result.output[0].data.css = {
        skipCache: true,
        code: "",
      };
    }

    return result;
  }

  return reactNativeCssTransformer.transform(
    config,
    projectRoot,
    filePath,
    data,
    options
  );
}

module.exports = {
  ...expoTransformer,
  ...reactNativeCssTransformer,
  transform,
};
