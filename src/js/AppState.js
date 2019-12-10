
const appState = {
  noMessagePlaceholder: null,
  currentUserId       : null,
  currentUserNickname : null,
  placeholderAvatarUrl: null,
};

export const getAppState = () => appState;

export const setAppState = (overrides = {}) => {
  Object.assign(appState, overrides);
};
