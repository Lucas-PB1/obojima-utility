import { isDevMode, getDevState } from '@/features/dev-mode';

export function isE2EMode(): boolean {
  return isDevMode();
}

const state = getDevState();
const activeUser = state.users.find((user) => user.uid === state.activeUserId) || state.users[0];

export const e2eUser = {
  uid: activeUser.uid,
  email: activeUser.email,
  displayName: activeUser.displayName,
  photoURL: activeUser.photoURL
};

export const e2eIngredients = state.ingredientsByUser[state.activeUserId] || [];
export const e2eIngredient = e2eIngredients[0]?.ingredient;
export const e2eAttempts = state.attemptsByUser[state.activeUserId] || [];
export const e2ePotions = state.potionsByUser[state.activeUserId] || [];
export const e2eFriends = state.friendsByUser[state.activeUserId] || [];
export const e2eRequests = state.incomingRequestsByUser[state.activeUserId] || [];
