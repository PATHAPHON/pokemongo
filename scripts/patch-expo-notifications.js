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

const fxPath = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/DevicePushTokenAutoRegistration.fx.js'
);

if (fs.existsSync(fxPath)) {
  let fxContent = fs.readFileSync(fxPath, 'utf8');
  if (!fxContent.includes('// __PATCHED_SAFE_AUTO_REG__')) {
    if (fxContent.includes('if (ServerRegistrationModule.getRegistrationInfoAsync) {')) {
      fxContent = fxContent.replace(
        'if (ServerRegistrationModule.getRegistrationInfoAsync) {',
        '// __PATCHED_SAFE_AUTO_REG__\ntry {\nif (ServerRegistrationModule.getRegistrationInfoAsync) {'
      );
      // Close the try-catch at the end of the file or after the else block
      const targetElseEnd =
        "new UnavailabilityError('ServerRegistrationModule', 'getRegistrationInfoAsync'));\n}";
      if (fxContent.includes(targetElseEnd)) {
        fxContent = fxContent.replace(
          targetElseEnd,
          targetElseEnd +
            "\n} catch (e) {\n  console.warn('[expo-notifications] Skipped auto-registration in Expo Go:', e);\n}"
        );
      }
      fs.writeFileSync(fxPath, fxContent, 'utf8');
      console.log(
        '[patch-expo-notifications] Successfully patched DevicePushTokenAutoRegistration.fx.js with try-catch safe guard.'
      );
    }
  } else {
    console.log(
      '[patch-expo-notifications] DevicePushTokenAutoRegistration.fx.js is already patched.'
    );
  }
}
