const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/warnOfExpoGoPushUsage.js'
);

if (fs.existsSync(targetPath)) {
  let content = fs.readFileSync(targetPath, 'utf8');
  if (content.includes('throw new Error(message);')) {
    content = content.replace(
      'throw new Error(message);',
      'console.warn(message);'
    );
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('[patch-expo-notifications] Successfully patched warnOfExpoGoPushUsage.js to prevent fatal throw in Expo Go Android.');
  } else {
    console.log('[patch-expo-notifications] warnOfExpoGoPushUsage.js is already patched.');
  }
} else {
  console.log('[patch-expo-notifications] expo-notifications not found in node_modules.');
}
