// Centralized configuration for the app
export const Config = {
  API: {
    BASE_URL: !__DEV__ 
      ? 'http://localhost:3001/api' 
      : 'https://updates-backend-api-beebc8cc747c.herokuapp.com/api',
    PRODUCTION_BASE_URL: 'https://updates-backend-api-beebc8cc747c.herokuapp.com',
  },
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },
  UI: {
    ANIMATION_DURATION: 300,
    CARD_BORDER_RADIUS: 12,
    SHADOW_OPACITY: 0.1,
  },
};
