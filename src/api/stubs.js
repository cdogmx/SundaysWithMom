// Stub API implementations - replace with your own backend API calls

export const stubAPI = {
  // Entity stubs
  entities: {
    Location: {
      filter: async () => [],
      list: async () => [],
      create: async () => ({ id: Date.now() }),
      update: async () => ({}),
      delete: async () => ({}),
    },
    Event: {
      filter: async () => [],
      list: async () => [],
      create: async () => ({ id: Date.now() }),
      update: async () => ({}),
      delete: async () => ({}),
    },
    FeedActivity: {
      list: async () => [],
      create: async () => ({ id: Date.now() }),
    },
    Review: {
      filter: async () => [],
      create: async () => ({ id: Date.now() }),
      update: async () => ({}),
      delete: async () => ({}),
    },
    Deal: {
      filter: async () => [],
      create: async () => ({ id: Date.now() }),
    },
    Conversation: {
      list: async () => [],
      create: async () => ({ id: Date.now() }),
      update: async () => ({}),
    },
    Message: {
      filter: async () => [],
      list: async () => [],
      create: async () => ({ id: Date.now() }),
      update: async () => ({}),
    },
    User: {
      filter: async () => [],
      list: async () => [],
      update: async () => ({}),
    },
    Offer: {
      filter: async () => [],
      update: async () => ({}),
    },
    Favorite: {
      filter: async () => [],
    },
    HiddenContent: {
      filter: async () => [],
      delete: async () => ({}),
    },
    Report: {
      filter: async () => [],
    },
    Notification: {
      filter: async () => [],
      update: async () => ({}),
    },
    NotificationPreference: {
      filter: async () => [],
      create: async () => ({ id: Date.now() }),
      update: async () => ({}),
    },
    EventSubscription: {
      filter: async () => [],
      create: async () => ({ id: Date.now() }),
      delete: async () => ({}),
    },
    SavedEvent: {
      filter: async () => [],
      delete: async () => ({}),
    },
    OrganizerFollow: {
      filter: async () => [],
    },
  },
  // Auth stubs
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    updateMe: async () => ({}),
    logout: () => {},
    redirectToLogin: () => {
      window.location.href = '/login';
    },
  },
  // Integration stubs
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
      InvokeLLM: async () => ({}),
      SendEmail: async () => ({}),
      SendSMS: async () => ({}),
      GenerateImage: async () => ({}),
      ExtractDataFromUploadedFile: async () => ({}),
    },
  },
  // App logs stub
  appLogs: {
    logUserInApp: async () => {},
  },
};

