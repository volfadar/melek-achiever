import { mapValuesKey } from 'zustand-x';
import { activityRoute } from './activity';
import { stateRoute } from './state';

export const rootStore = {
  activity: activityRoute,
  state: stateRoute,
};

export const useStore = () => mapValuesKey('use', rootStore);

// Global tracked hook selectors
export const useTrackedStore = () => mapValuesKey('useTracked', rootStore);

// Global getter selectors
export const store = mapValuesKey('get', rootStore);

// Global actions
export const actions = mapValuesKey('set', rootStore);
