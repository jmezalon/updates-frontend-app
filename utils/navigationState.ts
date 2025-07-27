// Global navigation state management
let globalSourceEventId: string | null = null;

export const setGlobalSourceEventId = (id: string | null) => {
  globalSourceEventId = id;
};

export const getGlobalSourceEventId = () => {
  return globalSourceEventId;
};

export const clearGlobalSourceEventId = () => {
  globalSourceEventId = null;
};
