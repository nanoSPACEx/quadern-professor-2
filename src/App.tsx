import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, GraduationCap, Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react';
import { DEFAULT_GROUP } from './data';
import { Group } from './types';
import { Gradebook } from './components/Gradebook';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'gradebook' | 'reports' | 'settings'>('gradebook');
  
  // Load groups from localStorage or use default
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('gradebook_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved groups', e);
      }
    }
    return [DEFAULT_GROUP];
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || '');

  // Save to localStorage whenever groups change
  useEffect(() => {
    localStorage.setItem('gradebook_groups', JSON.stringify(groups));
  }, [groups]);

  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0];

  const handleCreateGroup = () => {
    const newGroup: Group = {
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: 'Nou Grup',
      year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      tasks: [],
      students: []
    };
    setGroups([...groups, newGroup]);
    setActiveGroupId(newGroup.id);
    setActiveTab('settings');
  };

  const handleDeleteGroup = () => {
    if (groups.length <= 1) {
      alert("No pots eliminar l'últim grup. Crea'n un de nou primer.");
      return;
    }
    if (!confirm(`Estàs segur que vols eliminar el grup "${activeGroup.name}" i totes les seves dades?`)) return;
    
    const newGroups = groups.filter(g => g.id !== activeGroupId);
    setGroups(newGroups);
    setActiveGroupId(newGroups[0].id);
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleGradeChange = (studentId: string, taskId: string, newGrade: number | null) => {
    if (!activeGroup) return;
    
    const updatedStudents = activeGroup.students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          grades: {
            ...student.grades,
            [taskId]: newGrade
          }
        };
      }
      return student;
    });

    handleUpdateGroup({ ...activeGroup, students: updatedStudents });
  };

  if (!activeGroup) return <div className="p-8 text-center">Carregant...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden md:block">
                Quadern de Professor
              </h1>
              
              {/* Group Selector */}
              <div className="flex items-center gap-2 ml-0 md:ml-4 border-l-0 md:border-l border-slate-200 pl-0 md:pl-4">
                <select
                  value={activeGroupId}
                  onChange={(e) => setActiveGroupId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-medium"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.year})</option>
                  ))}
                </select>
                <button
                  onClick={handleCreateGroup}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Crear nou grup"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab('gradebook')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'gradebook'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Qualificacions
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Informes
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                Configuració
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {activeTab === 'gradebook' && 'Qualificacions'}
              {activeTab === 'reports' && 'Resum de Rendiment'}
              {activeTab === 'settings' && 'Configuració del Grup'}
            </h2>
            <p className="text-slate-500">
              {activeTab === 'gradebook' && `Gestiona les qualificacions de ${activeGroup.name}.`}
              {activeTab === 'reports' && `Analitza les estadístiques clau de ${activeGroup.name}.`}
              {activeTab === 'settings' && `Afegeix o elimina alumnes i tasques per a ${activeGroup.name}.`}
            </p>
          </div>
          
          {activeTab === 'settings' && (
            <button
              onClick={handleDeleteGroup}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Grup
            </button>
          )}
        </div>

        {activeTab === 'gradebook' && (
          <Gradebook 
            students={activeGroup.students} 
            tasks={activeGroup.tasks} 
            onGradeChange={handleGradeChange} 
          />
        )}
        
        {activeTab === 'reports' && (
          <Reports 
            students={activeGroup.students} 
            tasks={activeGroup.tasks} 
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            group={activeGroup} 
            onUpdateGroup={handleUpdateGroup} 
          />
        )}
      </main>
    </div>
  );
}
