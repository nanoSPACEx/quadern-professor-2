import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Student, Task } from '../types';

interface ReportsProps {
  students: Student[];
  tasks: Task[];
}

export function Reports({ students, tasks }: ReportsProps) {
  // 1. Mitjana per estudiant
  const studentAverages = useMemo(() => {
    return students.map(student => {
      let sum = 0;
      let weightSum = 0;
      tasks.forEach(task => {
        const grade = student.grades[task.id];
        if (grade != null) {
          sum += grade * task.weight;
          weightSum += task.weight;
        }
      });
      const avg = weightSum > 0 ? sum / weightSum : 0;
      return {
        name: student.name,
        average: parseFloat(avg.toFixed(2)),
        isHigh: avg >= 8,
        isLow: avg < 5
      };
    }).sort((a, b) => b.average - a.average);
  }, [students, tasks]);

  // 2. Mitjana per tasca
  const taskAverages = useMemo(() => {
    return tasks.map(task => {
      const grades = students.map(s => s.grades[task.id]).filter(g => g != null) as number[];
      const avg = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
      return {
        name: task.name,
        average: parseFloat(avg.toFixed(2))
      };
    });
  }, [students, tasks]);

  // 3. Estudiants amb rendiment alt i baix
  const highPerformers = studentAverages.filter(s => s.isHigh);
  const lowPerformers = studentAverages.filter(s => s.isLow);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High Performers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Rendiment Alt (≥ 8.0)
          </h3>
          {highPerformers.length > 0 ? (
            <ul className="space-y-3">
              {highPerformers.map(s => (
                <li key={s.name} className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="font-bold text-emerald-600">{s.average}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">Cap estudiant en aquesta categoria.</p>
          )}
        </div>

        {/* Low Performers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
          <h3 className="text-lg font-semibold text-rose-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Rendiment Baix (&#60; 5.0)
          </h3>
          {lowPerformers.length > 0 ? (
            <ul className="space-y-3">
              {lowPerformers.map(s => (
                <li key={s.name} className="flex justify-between items-center p-3 bg-rose-50/50 rounded-lg">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="font-bold text-rose-600">{s.average}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">Cap estudiant en aquesta categoria.</p>
          )}
        </div>
      </div>

      {/* Chart: Mitjana per Estudiant */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Mitjana de Qualificacions per Estudiant</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentAverages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                {studentAverages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.average >= 5 ? '#6366f1' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart: Mitjana per Tasca */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Qualificació Mitjana per Tasca</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskAverages} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 10}} 
                tickLine={false} 
                axisLine={false} 
                angle={-45} 
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 10]} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="average" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
