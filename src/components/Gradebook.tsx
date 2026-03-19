import React, { useState, useRef, useEffect } from 'react';
import { Download, Filter, CheckSquare, Square } from 'lucide-react';
import { Student, Task, Term } from '../types';

interface GradebookProps {
  students: Student[];
  tasks: Task[];
  onGradeChange: (studentId: string, taskId: string, newGrade: number | null) => void;
}

export function Gradebook({ students, tasks, onGradeChange }: GradebookProps) {
  const [hiddenTasks, setHiddenTasks] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<Term | 'all'>('all');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const termFilteredTasks = tasks.filter(t => selectedTerm === 'all' || t.term === selectedTerm);
  const visibleTasks = termFilteredTasks.filter(t => !hiddenTasks.has(t.id));

  const calculateAverage = (student: Student) => {
    let sum = 0;
    let weightSum = 0;
    let bonus = 0;

    visibleTasks.forEach(task => {
      const grade = student.grades[task.id];
      if (grade != null) {
        if (task.type === 'opcional') {
          // Bonus calculation: (grade / 10) * (weight / 100) * 10 -> grade * weight / 100
          bonus += (grade * task.weight) / 100;
        } else {
          sum += grade * task.weight;
          weightSum += task.weight;
        }
      }
    });

    let average = weightSum > 0 ? (sum / weightSum) : 0;
    average += bonus;
    
    // Cap at 10
    if (average > 10) average = 10;

    return average.toFixed(2);
  };

  const toggleTaskVisibility = (taskId: string) => {
    setHiddenTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleAllTasks = () => {
    if (hiddenTasks.size === 0) {
      // Hide all currently filtered tasks
      setHiddenTasks(new Set(termFilteredTasks.map(t => t.id)));
    } else {
      // Show all
      setHiddenTasks(new Set());
    }
  };

  const handleExportCSV = () => {
    const headers = ['Alumne', 'Mitjana', ...visibleTasks.map(t => `"${t.name}"`)];
    
    const rows = students.map(student => {
      const row = [
        `"${student.name}"`,
        calculateAverage(student),
        ...visibleTasks.map(t => student.grades[t.id] ?? '')
      ];
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'qualificacions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const studentAverages = students.map(student => ({
    student,
    average: parseFloat(calculateAverage(student))
  }));

  const classAverage = studentAverages.length > 0
    ? (studentAverages.reduce((sum, { average }) => sum + average, 0) / studentAverages.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Trimestre:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value === 'all' ? 'all' : Number(e.target.value) as Term)}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-sm"
          >
            <option value="all">Tots els trimestres</option>
            <option value={1}>1r Trimestre</option>
            <option value={2}>2n Trimestre</option>
            <option value={3}>3r Trimestre</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 flex-wrap">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium shadow-sm ${
                isFilterOpen || hiddenTasks.size > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtre Tasques {hiddenTasks.size > 0 && `(${termFilteredTasks.length - hiddenTasks.size}/${termFilteredTasks.length})`}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Mostrar tasques</span>
                  <button 
                    onClick={toggleAllTasks}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {hiddenTasks.size === 0 ? 'Ocultar totes' : 'Mostrar totes'}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {termFilteredTasks.map(task => {
                    const isVisible = !hiddenTasks.has(task.id);
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTaskVisibility(task.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                      >
                        {isVisible ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm truncate ${isVisible ? 'text-slate-700' : 'text-slate-400'}`}>
                          {task.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors text-sm font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Resum de Qualificacions</h3>
        <div className="mb-6">
          <div className="inline-block bg-indigo-50 p-4 rounded-xl border border-indigo-100 min-w-[200px]">
            <p className="text-sm text-indigo-600 font-medium mb-1">Mitjana de la Classe</p>
            <p className="text-3xl font-bold text-indigo-900">{classAverage}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Mitjanes per Alumne</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {studentAverages.map(({ student, average }) => (
              <div key={student.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-sm font-medium text-slate-700 truncate mr-2" title={student.name}>
                  {student.name}
                </span>
                <span className={`text-sm font-bold ${average >= 5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {average.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold min-w-[200px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                Alumnes
              </th>
              <th scope="col" className="px-4 py-4 font-semibold text-center bg-indigo-50 text-indigo-900 border-r border-slate-200">
                Mitjana
              </th>
              {visibleTasks.map(task => (
                <th key={task.id} scope="col" className={`px-2 py-4 font-semibold text-center min-w-[120px] max-w-[150px] ${task.type === 'opcional' ? 'bg-purple-50/50 text-purple-900' : ''}`}>
                  <div className="[writing-mode:vertical-rl] transform rotate-180 h-40 mx-auto text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                    {task.name}
                    {task.type === 'opcional' && <span className="text-purple-600 font-bold"> (+{task.weight}%)</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="px-6 py-3 font-medium text-slate-900 sticky left-0 bg-inherit border-r border-slate-200">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-center font-bold text-indigo-700 bg-indigo-50/30 border-r border-slate-200">
                  {calculateAverage(student)}
                </td>
                {visibleTasks.map(task => (
                  <td key={task.id} className="px-2 py-3 text-center border-r border-slate-100 last:border-r-0">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-16 text-center p-1 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      value={student.grades[task.id] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onGradeChange(student.id, task.id, val === '' ? null : parseFloat(val));
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
