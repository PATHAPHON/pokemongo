// Safe dummy module for PushTokenManager in Expo Go (Android)
const safePushTokenManager = {
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
  removeAllListeners: () => {},
  emit: () => {},
  listenerCount: () => 0,
};

export default safePushTokenManager;
