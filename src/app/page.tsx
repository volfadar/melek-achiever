'use client';
import {
  DetailActivity,
  SelectDate,
  SkeletonCard,
} from '@/components/Home/DetailActivity';
import { changeDate, filter_events } from '@/handlers/home';
import { useStore } from '@/state';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification';
import { checkUpdate } from '@tauri-apps/api/updater';
import { useEffect, useState } from 'react';

export default function Home() {
  const data = useStore().activity.list();
  const loading = useStore().state.loading();
  const date = useStore().activity.date();
  const filters = useStore().activity.filters(Object.is);
  const [client, setClient] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => filter_events([data]), [filters]);
  useEffect(() => changeDate(), [date]);
  useEffect(() => {
    setClient(true);
    checkUpdate().then(({ shouldUpdate, manifest }) => {
      console.log({ shouldUpdate, manifest });
    });
  }, []);

  if (!client) return <></>;

  return (
    <div className='flex flex-col gap-9 bg-white w-10/12 max-w-[1100px] m-auto my-11'>
      <div
        id='notification'
        className='absolute top-10 right-10 material-symbols-rounded text-slate-500 bg-slate-100 p-2 rounded-full cursor-pointer duration-300 hover:text-slate-700 hover:bg-slate-200'
        onClick={async () => {
          let permissionGranted = await isPermissionGranted();

          if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
          }

          if (permissionGranted) {
            sendNotification({ title: 'Tauri', body: 'Tauri is awesome!' });
          }
        }}
      >
        notifications
      </div>
      <SelectDate />
      {loading ? (
        <SkeletonCard />
      ) : (
        <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-3 grid-cols-1'>
          {data.map((e, i) => (
            <DetailActivity data={e} key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
