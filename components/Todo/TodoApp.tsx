import React, { useState } from 'react';
import { Plus, Trash2, Check, Circle, Filter, User, X } from 'lucide-react';

// The structure of a Task
interface Task {
  id: string; // Unique identifier
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: number;
  userId: string; // Placeholder ID for structure compatibility
}

// Main Application Component
export default function App() {
  // Initial tasks data (now stored in local state, not fetched from DB)
  const initialTasks: Task[] = [
    { id: '1', title: 'Implement full-screen, non-scrolling UI as requested', completed: false, priority: 'high', category: 'Design', createdAt: Date.now() + 5, userId: 'local' },
    { id: '2', title: 'Verify full-width display on desktop monitors', completed: false, priority: 'high', category: 'Testing', createdAt: Date.now() + 4, userId: 'local' },
    { id: '3', title: 'Check mobile layout for vertical space efficiency', completed: false, priority: 'medium', category: 'Testing', createdAt: Date.now() + 3, userId: 'local' },
    { id: '4', title: 'Design documentation draft for next milestone', completed: true, priority: 'medium', category: 'Project', createdAt: Date.now() + 2, userId: 'local' },
    { id: '5', title: 'Schedule team sync-up meeting', completed: false, priority: 'low', category: 'Meeting', createdAt: Date.now() + 1, userId: 'local' },
    { id: '6', title: 'Review last week\'s performance metrics and prepare summary report', completed: false, priority: 'medium', category: 'Report', createdAt: Date.now(), userId: 'local' },
    { id: '7', title: 'Plan dinner menu for the upcoming weekend', completed: false, priority: 'low', category: 'Personal', createdAt: Date.now() - 1, userId: 'local' },
    { id: '8', title: 'Read Chapter 3 of "Clean Code" principles', completed: false, priority: 'low', category: 'Learning', createdAt: Date.now() - 2, userId: 'local' },
    { id: '9', title: 'Back up all project files to cloud storage', completed: false, priority: 'high', category: 'Maintenance', createdAt: Date.now() - 3, userId: 'local' },
    { id: '10', title: 'Call client to confirm project scope changes', completed: false, priority: 'high', category: 'Communication', createdAt: Date.now() - 4, userId: 'local' },
  ];

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedCategory, setSelectedCategory] = useState('Work');
  
  const userId = 'local-user-session';
  const isAppReady = true; 

  // --- CRUD Operations (Local State) ---

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: selectedPriority,
      category: selectedCategory,
      createdAt: Date.now(),
      userId: userId,
    };
    
    setTasks([newTask, ...tasks]); 
    setNewTaskTitle('');
  };

  const toggleTask = (id: string, completed: boolean) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // --- Filtering and Utilities ---

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const sortedFilteredTasks = filteredTasks.sort((a, b) => b.createdAt - a.createdAt);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border border-red-300';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border border-yellow-300';
      case 'low': return 'text-green-700 bg-green-50 border border-green-300';
      default: return 'text-gray-600 bg-gray-100 border border-gray-300';
    }
  };

  const categoryTagClass = "text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-300";

  return (
    // Outer container: h-screen prevents page scrolling. flex and p-0 ensure full-width design.
    <div className="h-screen w-screen bg-gray-100 flex justify-center p-0 font-sans">
      {/* Main App Container: Added max-w-4xl to limit the width and prevent overlap with right sidebar. */}
      <div className="w-full **max-w-4xl** bg-white flex flex-col h-full shadow-lg">
        
        {/* Header and Input Section (Fixed height) */}
        <div className="border-b border-gray-200 p-4 sm:p-6 flex-shrink-0 bg-white z-20 shadow-sm">
          
          {/* Title and Subtitle */}
          <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Tasks List 📋
              </h1>
              <span className="text-xs text-gray-500 flex items-center gap-1 p-1 bg-gray-50 rounded-full">
                  <User className="w-3 h-3 text-blue-500" />
                  {userId.substring(0, 8)}... (Local Session)
              </span>
          </div>

          {/* New Task Input Block */}
          <div className="flex flex-col gap-3 mb-4">
            
            {/* Primary Input and Add Button */}
            <div className="flex w-full">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Type new task here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 text-base"
              />
              <button
                onClick={addTask}
                className={`text-white px-4 py-2 rounded-r-lg flex items-center justify-center gap-1 transition duration-200 flex-shrink-0 font-medium text-sm ${
                  !newTaskTitle.trim() || !isAppReady 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={!newTaskTitle.trim() || !isAppReady}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            {/* Priority and Category Selectors (Responsive Row/Stack) */}
            <div className="flex gap-2 w-full text-sm">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-1/2 sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                >
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <input
                  type="text"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  placeholder="Category Tag (e.g., Work)"
                  className="w-1/2 sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
            </div>
          </div>

          {/* Filter Buttons Section */}
          <div className="flex items-center gap-1 sm:gap-2 text-sm overflow-x-auto pb-1 -mb-1 justify-start border-t border-gray-100 pt-3">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-500 font-semibold text-xs flex-shrink-0 mr-1 hidden sm:inline">VIEW:</span>
            
            {[
              { label: `All (${tasks.length})`, value: 'all' as const },
              { label: `Active (${tasks.filter(t => !t.completed).length})`, value: 'active' as const },
              { label: `Done (${tasks.filter(t => t.completed).length})`, value: 'completed' as const },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-3 py-1 rounded-full font-medium transition text-xs sm:text-sm flex-shrink-0 ${
                  filter === btn.value 
                    ? 'bg-blue-100 text-blue-700 border border-blue-400' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {btn.label}
              </button>
            ))}

            {/* Clear Filter Button - only visible if filter is not 'all' */}
            {filter !== 'all' && (
                <button
                    onClick={() => setFilter('all')}
                    className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition flex items-center gap-1"
                >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">Clear Filter</span>
                </button>
            )}
          </div>
        </div>
        
        {/* Task List Section (Scrollable Area) */}
        {/* flex-1 ensures this section takes all remaining vertical space. overflow-y-auto enables internal scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {sortedFilteredTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-4 transition duration-200 cursor-pointer 
                  ${task.completed ? 'bg-green-50/20' : 'bg-white hover:bg-blue-50/50'} 
                  border-l-4 ${task.completed ? 'border-green-500' : 'border-transparent'}`}
              >
                {/* Checkbox Button */}
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  className="flex-shrink-0 mt-0.5" 
                >
                  {task.completed ? (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border border-blue-600">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 transition border border-gray-400 rounded-full" />
                  )}
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <p className={`text-gray-900 font-medium break-words text-base ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {/* Priority Tag */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    {/* Category Tag */}
                    {task.category && (
                      <span className={categoryTagClass}>
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button (Aligned to the right) */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} // Stop propagation to prevent toggleTask from firing
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition flex-shrink-0 mt-0.5 ml-auto opacity-70 hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {sortedFilteredTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 border-t border-gray-100">
                <p className="text-lg font-semibold">No tasks match the current filter.</p>
                <p className="text-sm mt-1">Try adding a new task or selecting the "All" view.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer/Bottom Bar - fixed height */}
        <div className="p-2 border-t border-gray-200 text-center text-xs text-gray-500 flex-shrink-0">
            Total Tasks: {tasks.length}
        </div>
      </div>
    </div>
  );
}