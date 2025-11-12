
import React, { useState, useMemo } from 'react';
import { Task, TagData } from '../types';
import { calculateStats } from '../utils/time';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import DailyTimeline from './DailyTimeline';

type Period = 'day' | 'week' | 'month';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const hours = Math.floor(payload[0].value / 60);
    const minutes = payload[0].value % 60;
    const timeString = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
    return (
      <div className="bg-bunker-800 p-2 border border-bunker-700 rounded-md shadow-lg">
        <p className="font-semibold text-bunker-100">{`${payload[0].name} : ${timeString}`}</p>
      </div>
    );
  }
  return null;
};

interface StatsDashboardProps {
  tasks: Task[];
  tags: TagData[];
  selectedDate: Date;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ tasks, tags, selectedDate }) => {
  const [period, setPeriod] = useState<Period>('week');
  const tagColorMap = useMemo(() => new Map(tags.map(t => [t.name, t.color])), [tags]);
  const data = useMemo(() => calculateStats(tasks, period, selectedDate), [tasks, period, selectedDate]);

  const totalMinutes = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const tasksForDay = useMemo(() => {
    if (period !== 'day') return [];
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateString = `${yyyy}-${mm}-${dd}`;
    return tasks.filter(task => task.date === selectedDateString);
  }, [tasks, selectedDate, period]);

  return (
    <div className="space-y-8">
      <div className="bg-bunker-900 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Statistics</h2>
                <p className="text-bunker-400">Your time allocation overview.</p>
            </div>
            <div className="flex items-center gap-1 bg-bunker-800 p-1 rounded-lg mt-4 sm:mt-0">
            {(['day', 'week', 'month'] as Period[]).map(p => (
                <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${period === p ? 'bg-sky-600 text-white' : 'text-bunker-300 hover:bg-bunker-700'}`}
                >
                {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
            ))}
            </div>
        </div>

        {data.length > 0 ? (
            <>
            <div className="text-center mb-8">
                <p className="text-bunker-300 text-lg">Total Time Tracked This {period}</p>
                <p className="text-4xl font-bold text-white">{totalHours}<span className="text-2xl text-bunker-400">h</span> {remainingMinutes}<span className="text-2xl text-bunker-400">m</span></p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" isAnimationActive={false}>
                            {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={tagColorMap.get(entry.name) || '#7f8aa4'} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#485063" />
                            <XAxis dataKey="name" type="category" stroke="#99a3bb" tick={{fontSize: 12}}/>
                            <YAxis type="number" unit="m" stroke="#99a3bb"/>
                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#48506380'}}/>
                            <Bar dataKey="value" barSize={30}>
                                {data.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={tagColorMap.get(entry.name) || '#7f8aa4'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            </>
        ) : (
            <div className="text-center py-16 border-2 border-dashed border-bunker-700 rounded-lg">
            <p className="text-bunker-400">No data available for this period.</p>
            <p className="text-bunker-500 text-sm">Log some tasks to see your stats!</p>
            </div>
        )}
      </div>
      {period === 'day' && data.length > 0 && (
          <DailyTimeline tasks={tasksForDay} tags={tags} />
      )}
    </div>
  );
};

export default React.memo(StatsDashboard);
