const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const nativewindConfig = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false
});

nativewindConfig.transformerPath = require.resolve("./metro-transformer");

module.exports = nativewindConfig;
