// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

const path = require('path');

const finalConfig = withNativeWind(config, { input: './global.css' });
if (finalConfig.transformer) {
  finalConfig.transformer.cssInterop_outputDirectory = path.resolve(
    __dirname,
    'node_modules/react-native-css-interop/.cache'
  );
}

module.exports = finalConfig;

