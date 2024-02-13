import { StateZustand } from '@/types/state';
import { createStore } from 'zustand-x';

export const stateRoute = createStore('repo')<StateZustand>({
  loading: false,
});
