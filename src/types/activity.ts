export type Data = {
  title: string;
  app?: string;
  audible?: boolean;
  incognito?: boolean;
  tabcount?: number;
  url?: string;
};

export type Activity = {
  timestamp: string;
  id: string;
  duration: number;
  data: Data;
};

export type ActivityFilter = {
  by: 'app' | 'title' | 'url';
  value?: string[];
};

export type ActivityState = {
  list: Activity[];
  date: string;
  filters: ActivityFilter[];
};

export type Total = {
  seconds: number;
  minutes?: number;
  hours?: number;
};
