// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

const path = require('path');

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.endsWith('warnOfExpoGoPushUsage') ||
    moduleName.endsWith('warnOfExpoGoPushUsage.js')
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        'src/shared/services/notifications/safe-warnOfExpoGoPushUsage.js'
      ),
      type: 'sourceFile',
    };
  }
  if (
    moduleName.endsWith('TopicSubscriptionModule') ||
    moduleName.endsWith('TopicSubscriptionModule.android') ||
    moduleName.endsWith('TopicSubscriptionModule.android.js') ||
    moduleName.endsWith('TopicSubscriptionModule.js')
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        'src/shared/services/notifications/safe-TopicSubscriptionModule.js'
      ),
      type: 'sourceFile',
    };
  }
  if (
    moduleName.endsWith('PushTokenManager') ||
    moduleName.endsWith('PushTokenManager.native') ||
    moduleName.endsWith('PushTokenManager.native.js') ||
    moduleName.endsWith('PushTokenManager.js')
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        'src/shared/services/notifications/safe-PushTokenManager.js'
      ),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
