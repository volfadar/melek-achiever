import { Activity, ActivityState } from '@/types/activity';
import { createStore } from 'zustand-x';
import { actions, store } from '.';
import { createJSONStorage } from 'zustand/middleware';

export const activityRoute = createStore('repo')<ActivityState>(
  {
    list: [],
    date: new Date().toISOString(),
    filters: [],
  },
  {
    persist: {
      enabled: true,
      name: 'activity',
    },
  }
)
  .extendSelectors((set, get, api) => ({
    total: () => {
      const data = get.list();
      const total = Math.floor(data.reduce((acc, e) => acc + e.duration, 0));
      const countMinutes = (time: number) => Math.floor(time / 60);
      const countHours = (time: number) => Math.floor(countMinutes(time) / 60);
      if (total < 60) return { seconds: total } as const;
      if (total < 3600)
        return { minutes: countMinutes(total), seconds: total % 60 } as const;
      if (total < 86400)
        return {
          hours: countHours(total),
          minutes: countMinutes(total) % 60,
          seconds: total % 60,
        } as const;
      return { seconds: total } as const;
    },
    dateFormatted: () => new Date(get.date()),
  }))
  .extendActions((set, get, api) => ({
    dateStore: (date: Date | number) => {
      if (date instanceof Date) set.date(date.toISOString());
      set.date(new Date(date).toISOString());
    },
  }));
