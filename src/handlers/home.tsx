import { actions, store } from '@/state';
import { Activity } from '@/types/activity';
import { invoke } from '@tauri-apps/api';

import { toast } from 'sonner';

export function filter_events(res: Activity[][]) {
  const filters = store.activity.filters();

  const result = res[0];
  const simplify: Activity[] = [];

  result.forEach(async (e, i) => {
    if (e.data.incognito) return;
    if (e.duration < 2 && /new tab/gi.test(e.data.title)) return;
    const day = new Date(e.timestamp).getDate();

    e.data.title = e.data.title
      .replace(/\s*\(\d{1,}([,.]\d{1,})?\)/g, '')
      .replace(/[^\w\s,./\\\-_]/g, '')
      .trim();

    const detail = makeTitle(e.data.title);
    detail.app
      ? (e.data.app = detail.app)
      : e.data.app || (e.data.app = 'Google Chrome');
    e.data.title = detail.title;

    let { title, app, url } = e.data;

    if (filters.length > 0) {
      let isFiltered = false;
      filters.forEach((filter) => {
        const regex = new RegExp(filter.value!.join('|'), 'i');
        switch (filter.by) {
          case 'app':
            if (!app?.match(regex)) return (isFiltered = true);
            break;
          case 'title':
            if (!title.match(regex)) return (isFiltered = true);
            break;
          case 'url':
            if (!url?.match(regex)) return (isFiltered = true);
            break;
        }
      });
      if (isFiltered) return;
    }

    const isThere = simplify[0]
      ? simplify.findIndex((e) => {
          const { title: titleE } = e.data;
          const sameTitle = titleE === title;
          const sameDay = new Date(e.timestamp).getDate() === day;

          return sameTitle && sameDay;
        })
      : -1;

    if (isThere === -1) return simplify.push(e);

    simplify[isThere].duration += e.duration;
    simplify[isThere].timestamp = e.timestamp;
  });

  simplify.sort((a, b) => b.duration - a.duration);

  actions.activity.list(simplify);
  actions.state.loading(false);
}

export function makeTitle(title: string) {
  const words = title.split('-');
  if (words.length < 2 || words.at(-1)!.split(' ').length > 3) {
    return { title };
  }
  return {
    title: words.slice(0, -1).join('-'),
    app: words.at(-1)!,
  };
}

export function changeDate() {
  const date = store.activity.dateFormatted();
  actions.state.loading(true);

  const start_date = new Date(date.setHours(0, 0, 0, 0)).toISOString();
  const end_date = new Date(date.setHours(23, 59, 59, 999)).toISOString();

  invoke<Activity[][]>('filter_events', {
    timestamp: { start_date, end_date },
  })
    .then(filter_events)
    .catch((e) => {
      console.log({ e });
      toast.error(e.message);
    });
}
