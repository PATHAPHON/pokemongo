export const warnOfExpoGoPushUsage = () => {
  // No-op by design: push is disabled in Expo Go Android SDK 53+,
  // local and background notifications remain active.
};

export default warnOfExpoGoPushUsage;
