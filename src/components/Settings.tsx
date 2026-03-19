import React, { useState, useRef } from 'react';
import { Group, Task, Student, TaskType, Term } from '../types';
import { Plus, Trash2, Users, FileText, Settings as SettingsIcon, Edit, X, Upload } from 'lucide-react';

interface SettingsProps {
  group: Group;
  onUpdateGroup: (updatedGroup: Group) => void;
}

export function Settings({ group, onUpdateGroup }: SettingsProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('treball');
  const [newTaskWeight, setNewTaskWeight] = useState<number>(1);
  const [newTaskTerm, setNewTaskTerm] = useState<Term>('1r Trimestre');
  const [bulkStudents, setBulkStudents] = useState('');

  // Bulk edit state
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditType, setBulkEditType] = useState<TaskType | ''>('');
  const [bulkEditWeight, setBulkEditWeight] = useState<number | ''>('');
  const [bulkEditTerm, setBulkEditTerm] = useState<Term | ''>('');

  // Single edit state
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    if (editingTask.type === 'opcional') {
      if (editingTask.weight < 0.1 || editingTask.weight > 100) {
        alert('El pes per a tasques opcionals ha de ser entre 0.1 i 100.');
        return;
      }
    } else {
      if (editingTask.weight <= 0) {
        alert('El pes per a treballs i exàmens ha de ser superior a 0.');
        return;
      }
    }
    
    onUpdateGroup({
      ...group,
      tasks: group.tasks.map(t => t.id === editingTask.id ? editingTask : t)
    });
    setEditingTask(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    if (newTaskType === 'opcional') {
      if (newTaskWeight < 0.1 || newTaskWeight > 100) {
        alert('El pes per a tasques opcionals ha de ser entre 0.1 i 100.');
        return;
      }
    } else {
      if (newTaskWeight <= 0) {
        alert('El pes per a treballs i exàmens ha de ser superior a 0.');
        return;
      }
    }

    const newTask: Task = {
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newTaskName.trim(),
      type: newTaskType,
      weight: newTaskWeight,
      term: newTaskTerm
    };

    onUpdateGroup({
      ...group,
      tasks: [...group.tasks, newTask]
    });
    setNewTaskName('');
    setNewTaskType('treball');
    setNewTaskWeight(1);
    // Keep the same term selected to make adding multiple tasks to the same term easier
  };

  const handleRemoveTask = (taskId: string) => {
    if (!confirm("Estàs segur que vols eliminar aquesta tasca? S'esborraran també les notes associades.")) return;
    
    // Remove task from tasks array
    const updatedTasks = group.tasks.filter(t => t.id !== taskId);
    
    // Remove task grades from all students
    const updatedStudents = group.students.map(student => {
      const newGrades = { ...student.grades };
      delete newGrades[taskId];
      return { ...student, grades: newGrades };
    });

    onUpdateGroup({
      ...group,
      tasks: updatedTasks,
      students: updatedStudents
    });

    // Remove from selected tasks if it was selected
    if (selectedTasks.has(taskId)) {
      const newSelected = new Set(selectedTasks);
      newSelected.delete(taskId);
      setSelectedTasks(newSelected);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
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
    if (selectedTasks.size === group.tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(group.tasks.map(t => t.id)));
    }
  };

  const handleBulkEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasValidationError = false;

    const updatedTasks = group.tasks.map(task => {
      if (selectedTasks.has(task.id)) {
        const newType = bulkEditType !== '' ? bulkEditType as TaskType : task.type;
        const newWeight = bulkEditWeight !== '' ? Number(bulkEditWeight) : task.weight;
        
        if (newType === 'opcional') {
          if (newWeight < 0.1 || newWeight > 100) {
            hasValidationError = true;
          }
        } else {
          if (newWeight <= 0) {
            hasValidationError = true;
          }
        }

        return {
          ...task,
          type: newType,
          weight: newWeight,
          term: bulkEditTerm !== '' ? bulkEditTerm as Term : task.term,
        };
      }
      return task;
    });

    if (hasValidationError) {
      alert('Error de validació: El pes per a tasques opcionals ha de ser entre 0.1 i 100. El pes per a treballs i exàmens ha de ser superior a 0.');
      return;
    }

    onUpdateGroup({
      ...group,
      tasks: updatedTasks
    });

    setIsBulkEditModalOpen(false);
    setSelectedTasks(new Set());
    setBulkEditType('');
    setBulkEditWeight('');
    setBulkEditTerm('');
  };

  const handleBulkAddStudents = () => {
    if (!bulkStudents.trim()) return;
    
    const names = bulkStudents.split('\n').map(n => n.trim()).filter(n => n);
    const newStudents: Student[] = names.map(name => ({
      id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      grades: {}
    }));

    onUpdateGroup({
      ...group,
      students: [...group.students, ...newStudents]
    });
    setBulkStudents('');
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!confirm('Estàs segur que vols eliminar aquest alumne i totes les seves notes?')) return;
    
    onUpdateGroup({
      ...group,
      students: group.students.filter(s => s.id !== studentId)
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTasks = JSON.parse(content);
        
        if (!Array.isArray(importedTasks)) {
          throw new Error('El fitxer ha de contenir un array de tasques.');
        }

        interface ImportedTask extends Task {
          grades?: Record<string, number>;
        }

        const validTasks = importedTasks.filter((task: any) => 
          task.id && typeof task.id === 'string' &&
          task.name && typeof task.name === 'string' &&
          task.type && (task.type === 'treball' || task.type === 'exam' || task.type === 'opcional') &&
          typeof task.weight === 'number' &&
          (task.term === '1r Trimestre' || task.term === '2n Trimestre' || task.term === '3r Trimestre')
        ) as ImportedTask[];

        if (validTasks.length === 0) {
          throw new Error('No s\'han trobat tasques vàlides al fitxer.');
        }

        const hasGrades = validTasks.some(task => task.grades && Object.keys(task.grades).length > 0);
        let importGrades = false;
        
        if (hasGrades) {
          importGrades = window.confirm('El fitxer conté notes associades a les tasques. Vols importar també les notes?');
        }

        let updatedStudents = [...group.students];
        
        if (importGrades) {
          updatedStudents = updatedStudents.map(student => {
            const newGrades = { ...student.grades };
            validTasks.forEach(task => {
              if (task.grades) {
                if (task.grades[student.id] !== undefined) {
                  newGrades[task.id] = task.grades[student.id];
                } else if (task.grades[student.name] !== undefined) {
                  newGrades[task.id] = task.grades[student.name];
                }
              }
            });
            return { ...student, grades: newGrades };
          });
        }

        // Remove grades from tasks before saving
        const newTasks: Task[] = validTasks.map(({ grades, ...task }) => task as Task);

        onUpdateGroup({
          ...group,
          tasks: [...group.tasks, ...newTasks],
          students: updatedStudents
        });

        alert(`S'han importat ${validTasks.length} tasques correctament.`);
      } catch (error) {
        alert('Error en importar les tasques. Assegura\'t que el format del fitxer JSON és correcte.');
        console.error(error);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Group Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600" />
          Dades del Grup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom del Grup</label>
            <input
              type="text"
              value={group.name}
              onChange={(e) => onUpdateGroup({ ...group, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Curs Acadèmic</label>
            <input
              type="text"
              value={group.year}
              onChange={(e) => onUpdateGroup({ ...group, year: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Tasques ({group.tasks.length})
            </h3>
            <div>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportTasks}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors text-sm font-medium shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
            </div>
          </div>
          
          <form onSubmit={handleAddTask} className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nom de la nova tasca..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white min-w-[120px]"
              >
                <option value="treball">Treball</option>
                <option value="exam">Examen</option>
                <option value="opcional">Opcional</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex items-center gap-2 flex-1 w-full">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Trimestre:</label>
                <select
                  value={newTaskTerm}
                  onChange={(e) => setNewTaskTerm(e.target.value as Term)}
                  className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white flex-1"
                >
                  <option value="1r Trimestre">1r Trimestre</option>
                  <option value="2n Trimestre">2n Trimestre</option>
                  <option value="3r Trimestre">3r Trimestre</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 w-full">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  {newTaskType === 'opcional' ? 'Pes (bonus %):' : 'Pes (multiplicador):'}
                </label>
                <input
                  type="number"
                  min={newTaskType === 'opcional' ? "0.1" : "0.01"}
                  max={newTaskType === 'opcional' ? "100" : undefined}
                  step="0.01"
                  value={newTaskWeight}
                  onChange={(e) => setNewTaskWeight(Number(e.target.value))}
                  className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white flex-1"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!newTaskName.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Afegir
              </button>
            </div>
          </form>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={group.tasks.length > 0 && selectedTasks.size === group.tasks.length}
                onChange={toggleAllTasks}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600 font-medium">Seleccionar totes</span>
            </div>
            {selectedTasks.size > 0 && (
              <button
                onClick={() => setIsBulkEditModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar {selectedTasks.size} tasques
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
            {group.tasks.map(task => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-slate-50 border border-slate-100 rounded-lg group gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={selectedTasks.has(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mr-2 cursor-pointer"
                  />
                  <span className="font-medium text-slate-700">{task.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    task.type === 'exam' ? 'bg-rose-100 text-rose-700' : 
                    task.type === 'opcional' ? 'bg-purple-100 text-purple-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.type === 'exam' ? 'Examen' : task.type === 'opcional' ? 'Opcional' : 'Treball'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                    {task.term}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                    {task.type === 'opcional' ? `Bonus: +${task.weight}%` : `Pes: ${task.weight}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-slate-400 hover:text-indigo-600 sm:opacity-0 group-hover:opacity-100 transition-all"
                    title="Editar tasca"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 sm:opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar tasca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {group.tasks.length === 0 && (
              <p className="text-slate-500 text-sm italic text-center py-4">No hi ha tasques en aquest grup.</p>
            )}
          </div>
        </div>

        {/* Students Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Alumnes ({group.students.length})
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Afegir alumnes (un per línia)</label>
            <textarea
              rows={4}
              placeholder="Cognoms, Nom&#10;Cognoms, Nom"
              value={bulkStudents}
              onChange={(e) => setBulkStudents(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-2"
            />
            <button
              onClick={handleBulkAddStudents}
              disabled={!bulkStudents.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Afegir Alumnes
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
            {group.students.map(student => (
              <div key={student.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                <span className="font-medium text-slate-700 truncate mr-2" title={student.name}>{student.name}</span>
                <button
                  onClick={() => handleRemoveStudent(student.id)}
                  className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  title="Eliminar alumne"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {group.students.length === 0 && (
              <p className="text-slate-500 text-sm italic text-center py-4">No hi ha alumnes en aquest grup.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                Edició Múltiple ({selectedTasks.size} tasques)
              </h3>
              <button 
                onClick={() => setIsBulkEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipus de tasca</label>
                <select
                  value={bulkEditType}
                  onChange={(e) => setBulkEditType(e.target.value as TaskType | '')}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">-- No modificar --</option>
                  <option value="treball">Treball</option>
                  <option value="exam">Examen</option>
                  <option value="opcional">Opcional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trimestre</label>
                <select
                  value={bulkEditTerm}
                  onChange={(e) => setBulkEditTerm(e.target.value === '' ? '' : e.target.value as Term)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">-- No modificar --</option>
                  <option value="1r Trimestre">1r Trimestre</option>
                  <option value="2n Trimestre">2n Trimestre</option>
                  <option value="3r Trimestre">3r Trimestre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {(() => {
                    if (bulkEditType === 'opcional') return 'Pes (bonus %)';
                    if (bulkEditType === 'treball' || bulkEditType === 'exam') return 'Pes (multiplicador)';
                    
                    const selectedTaskObjects = group.tasks.filter(t => selectedTasks.has(t.id));
                    const allOptional = selectedTaskObjects.length > 0 && selectedTaskObjects.every(t => t.type === 'opcional');
                    const allRegular = selectedTaskObjects.length > 0 && selectedTaskObjects.every(t => t.type !== 'opcional');
                    
                    if (allOptional) return 'Pes (bonus %)';
                    if (allRegular) return 'Pes (multiplicador)';
                    return 'Pes (multiplicador / bonus %)';
                  })()}
                </label>
                <input
                  type="number"
                  min={bulkEditType === 'opcional' ? "0.1" : "0.01"}
                  max={bulkEditType === 'opcional' ? "100" : undefined}
                  step="0.01"
                  value={bulkEditWeight}
                  onChange={(e) => setBulkEditWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="-- No modificar --"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Aplicar Canvis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Single Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                Editar Tasca
              </h3>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la tasca</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipus de tasca</label>
                <select
                  value={editingTask.type}
                  onChange={(e) => setEditingTask({ ...editingTask, type: e.target.value as TaskType })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="treball">Treball</option>
                  <option value="exam">Examen</option>
                  <option value="opcional">Opcional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trimestre</label>
                <select
                  value={editingTask.term}
                  onChange={(e) => setEditingTask({ ...editingTask, term: e.target.value as Term })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="1r Trimestre">1r Trimestre</option>
                  <option value="2n Trimestre">2n Trimestre</option>
                  <option value="3r Trimestre">3r Trimestre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingTask.type === 'opcional' ? 'Pes (bonus %)' : 'Pes (multiplicador)'}
                </label>
                <input
                  type="number"
                  min={editingTask.type === 'opcional' ? "0.1" : "0.01"}
                  max={editingTask.type === 'opcional' ? "100" : undefined}
                  step="0.01"
                  value={editingTask.weight}
                  onChange={(e) => setEditingTask({ ...editingTask, weight: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Desar Canvis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
