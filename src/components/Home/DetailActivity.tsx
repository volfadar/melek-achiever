'use client';
import { actions, useStore } from '@/state';
import { Activity, Total } from '@/types/activity';

export function DetailActivity({ data }: { data: Activity }) {
  const { title, app } = data.data;
  const filters = useStore().activity.filters();

  return (
    <div className='card-activity flex justify-between px-5 py-4  rounded-md shadow-lg bg-white gap-2 flex-col'>
      <div className='flex flex-col gap-2'>
        <div
          className='py-2 px-3 cursor-pointer text-sm font-bold flex w-fit bg-slate-100 rounded-md text-slate-600'
          onClick={() => {
            const newFilter = { by: 'app' as const, value: [app!] };
            actions.activity.filters([...filters, newFilter]);
          }}
        >
          {app}
        </div>
        <h3 className='ml-1.5 font-semibold text-lg text-wrap overflow-hidden'>
          {title}
        </h3>
      </div>
      <p className='ml-1.5 text-sm text-slate-500 font-normal'>
        {Math.round(data.duration / 6) / 10} minutes -{' '}
        {new Date(data.timestamp).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        WIB
      </p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className='grid grid-cols-4 gap-3'>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className='flex justify-between px-5 py-4 opacity-0 -translate-y-1 rounded-md shadow-lg bg-white gap-4 flex-col animate-pulse'
        >
          <div className='font-semibold text-lg h-5 bg-slate-200 w-8/12'></div>
          <div className='flex flex-col gap-3'>
            <div className='text-sm text-slate-500 font-normal h-3 bg-slate-100 w-10/12'></div>
            <div className='text-sm text-slate-500 font-normal h-3 bg-slate-100 w-10/12'></div>
            <div className='text-sm text-slate-500 font-normal h-3 bg-slate-100 w-4/12'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SelectDate() {
  const date = useStore().activity.dateFormatted();
  const total = useStore().activity.total();
  const loading = useStore().state.loading();

  return (
    <div>
      <div className='flex gap-2 items-center'>
        <div
          id='previous-date'
          className='font-bold text-2xl material-symbols-rounded text-slate-400 duration-300 hover:text-slate-700 cursor-pointer'
          onClick={() =>
            actions.activity.dateStore(date.setDate(date.getDate() - 1))
          }
        >
          arrow_circle_left
        </div>
        <div className='p-3 border-2 border-slate-200 font-semibold text-lg text-blue-700 rounded-lg'>
          {date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: '2-digit',
            month: 'short',
            day: 'numeric',
          })}
        </div>
        <div
          id='next-date'
          className='material-symbols-rounded font-bold text-2xl text-slate-400 duration-300 hover:text-slate-700 cursor-pointer'
          onClick={() =>
            actions.activity.dateStore(date.setDate(date.getDate() + 1))
          }
        >
          arrow_circle_right
        </div>
      </div>

      <div className='text-2xl font-normal text-slate-500 flex gap-2 items-center'>
        Total :
        {!loading ? (
          <div className='text-slate-500 font-semibold'>
            {Object.keys(total).map((e, i) => (
              <span key={i}>
                <span className='text-blue-600'>{total[e as keyof Total]}</span>
                <span>
                  {i + 1 !== Object.keys(total).length ? ` ${e}, ` : ` ${e}`}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div className='w-16 h-8 bg-slate-200 animate-pulse rounded-md'></div>
        )}
      </div>
    </div>
  );
}
