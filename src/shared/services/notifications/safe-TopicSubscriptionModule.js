// Safe dummy module for TopicSubscriptionModule in Expo Go (Android)
const safeTopicSubscriptionModule = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: async () => null,
  unsubscribeFromTopicAsync: async () => null,
};

export default safeTopicSubscriptionModule;
