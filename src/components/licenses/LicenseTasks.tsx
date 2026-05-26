import React, { useState, useMemo } from 'react';
import { StateLicense, LicenseTask } from '@/types/schema';
import { CheckCircle2, Circle, Plus, ListTodo, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

interface LicenseTasksProps {
  license: StateLicense;
  onUpdate: (updatedData: Partial<StateLicense>) => Promise<void>;
}

export const LicenseTasks: React.FC<LicenseTasksProps> = ({ license, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');

  const tasks = license.tasks || [];

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) {
        // Sort by creation date if both have same completion status
        const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : (a.createdAt as any)?.seconds * 1000 || 0;
        const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : (b.createdAt as any)?.seconds * 1000 || 0;
        return timeB - timeA; // newest first
      }
      return a.completed ? 1 : -1; // incomplete first
    });
  }, [tasks]);

  const displayedTasks = showAll ? sortedTasks : sortedTasks.slice(0, 3);

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const completed = !t.completed;
        return {
          ...t,
          completed,
          completedAt: completed ? serverTimestamp() as Timestamp : null
        };
      }
      return t;
    });
    await onUpdate({ tasks: updatedTasks });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let dueDateTimestamp: Timestamp | null = null;
    if (newTaskDueDate) {
      const dateObj = new Date(newTaskDueDate);
      // add timezone offset or assume local
      dueDateTimestamp = Timestamp.fromDate(dateObj);
    }

    const newTask: LicenseTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      completed: false,
      dueDate: dueDateTimestamp,
      createdAt: serverTimestamp() as Timestamp,
      completedAt: null
    };

    const updatedTasks = [...tasks, newTask];
    await onUpdate({ tasks: updatedTasks });
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setIsAdding(false);
  };

  const startEditing = (task: LicenseTask) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    if (task.dueDate) {
      const date = (task.dueDate as any)?.toDate?.() || new Date((task.dueDate as any)?.seconds * 1000);
      // Format as YYYY-MM-DD for input type="date"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setEditTaskDueDate(`${year}-${month}-${day}`);
    } else {
      setEditTaskDueDate('');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskTitle.trim() || !editingTaskId) return;

    let dueDateTimestamp: Timestamp | null = null;
    if (editTaskDueDate) {
      const dateObj = new Date(editTaskDueDate);
      dueDateTimestamp = Timestamp.fromDate(dateObj);
    }

    const updatedTasks = tasks.map(t => {
      if (t.id === editingTaskId) {
        return {
          ...t,
          title: editTaskTitle.trim(),
          dueDate: dueDateTimestamp
        };
      }
      return t;
    });

    await onUpdate({ tasks: updatedTasks });
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await onUpdate({ tasks: updatedTasks });
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-indigo-400" />
          License Tasks
        </h2>
        {tasks.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      {tasks.length === 0 && !isAdding ? (
        <div className="text-center py-4 text-zinc-500 text-xs font-medium">
          No tasks for this license yet.
        </div>
      ) : (
        <ul className="space-y-2 mb-4">
          {displayedTasks.map(task => (
            <li key={task.id} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              {editingTaskId === task.id ? (
                <form onSubmit={handleSaveEdit} className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <input
                    type="text"
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 mb-2"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editTaskDueDate}
                      onChange={(e) => setEditTaskDueDate(e.target.value)}
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => setEditingTaskId(null)} className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-300">
                        Cancel
                      </button>
                      <button type="submit" disabled={!editTaskTitle.trim()} className="px-3 py-1.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 disabled:opacity-50 transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0 text-zinc-400 hover:text-indigo-400 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className={`flex-1 min-w-0 ${task.completed ? 'opacity-50' : ''}`}>
                    <p className={`text-sm font-medium text-zinc-200 truncate ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500 font-medium">
                        <Calendar className="w-3 h-3" />
                        Due: {(task.dueDate as any)?.toDate?.()?.toLocaleDateString() || new Date((task.dueDate as any)?.seconds * 1000).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdding ? (
        <form onSubmit={handleAddTask} className="bg-white/5 p-3 rounded-xl border border-white/10 mt-3">
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 mb-2"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 [color-scheme:dark]"
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-300">
                Cancel
              </button>
              <button type="submit" disabled={!newTaskTitle.trim()} className="px-3 py-1.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 disabled:opacity-50 transition-colors">
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full mt-2 inline-flex justify-center items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      )}
    </div>
  );
};
