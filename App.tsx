import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TimeEntryTable } from './components/TimeEntryTable';
import { CalendarView } from './components/CalendarView';
import { ProjectsPage } from './components/ProjectsPage';
import { TasksPage } from './components/TasksPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { ClientsPage } from './components/ClientsPage';
import { ManualTimeEntryModal } from './components/ManualTimeEntryModal';
import { TimeEntry, Project, Task, Client, NewClientPayload, NewProjectPayload, NewTaskPayload } from './types';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/auth/AuthModal';
import { TimeWiseLogo } from './components/icons/TimeWiseLogo';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { createTimestampsFromDateAndTime, createTimestampsFromDateAndDuration } from './utils/time';

export type View = 'Dashboard' | 'List' | 'Calendar' | 'Projects' | 'Tasks' | 'Reports' | 'Settings' | 'Clients';

interface ManualTimeEntryData {
  id?: string; // Include ID when editing
  description: string;
  projectId: string;
  taskId?: string;
  date: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  billable: boolean;
}

// Helper function to create initial data for a user
// Returns empty arrays to ensure new accounts start clean with no sample data
const createInitialDataForUser = (userId: string) => {
  const clients: Client[] = [];
  const projects: Project[] = [];
  const tasks: Task[] = [];
  const entries: TimeEntry[] = [];

  return { clients, projects, tasks, entries };
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<View>('Dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User-specific data state
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Initialize user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userStorageKey = `timeEntries_${user.id}`;
      const clientsStorageKey = `clients_${user.id}`;
      const projectsStorageKey = `projects_${user.id}`;
      const tasksStorageKey = `tasks_${user.id}`;

      // Load or create initial data for the user
      const savedEntries = localStorage.getItem(userStorageKey);
      const savedClients = localStorage.getItem(clientsStorageKey);
      const savedProjects = localStorage.getItem(projectsStorageKey);
      const savedTasks = localStorage.getItem(tasksStorageKey);

      if (savedEntries || savedClients || savedProjects || savedTasks) {
        // Load existing data
        try {
          setEntries(savedEntries ? JSON.parse(savedEntries) : []);
          setClients(savedClients ? JSON.parse(savedClients) : []);
          setProjects(savedProjects ? JSON.parse(savedProjects) : []);
          setTasks(savedTasks ? JSON.parse(savedTasks) : []);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Create initial data if loading fails
          const initialData = createInitialDataForUser(user.id);
          setEntries(initialData.entries);
          setClients(initialData.clients);
          setProjects(initialData.projects);
          setTasks(initialData.tasks);
        }
      } else {
        // Create initial data for new user
        const initialData = createInitialDataForUser(user.id);
        setEntries(initialData.entries);
        setClients(initialData.clients);
        setProjects(initialData.projects);
        setTasks(initialData.tasks);
      }
    } else if (!isAuthenticated && !isLoading) {
      // Clear data when not authenticated
      setEntries([]);
      setClients([]);
      setProjects([]);
      setTasks([]);

      // Clear timer state when not authenticated
      setDescription('');
      setIsActive(false);
      setStartTime(0);
      setElapsedTime(0);
      setSelectedProjectId(undefined);
      setSelectedTaskId(undefined);
      setIsTimerBillable(true);
    }
  }, [isAuthenticated, user, isLoading]);

  // Timer state
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isTimerBillable, setIsTimerBillable] = useState(true);

  // Time entry editing state
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load timer state from localStorage on app initialization
  useEffect(() => {
    if (isAuthenticated && user) {
      const timerStorageKey = `timerState_${user.id}`;
      const savedTimerState = localStorage.getItem(timerStorageKey);

      if (savedTimerState) {
        try {
          const timerState = JSON.parse(savedTimerState);

          // Restore timer state
          setDescription(timerState.description || '');
          setSelectedProjectId(timerState.selectedProjectId);
          setSelectedTaskId(timerState.selectedTaskId);
          setIsTimerBillable(timerState.isTimerBillable ?? true);

          // If timer was active, calculate elapsed time and resume
          if (timerState.isActive && timerState.startTime) {
            const now = Date.now();
            const calculatedElapsedTime = now - timerState.startTime;
            setStartTime(timerState.startTime);
            setElapsedTime(calculatedElapsedTime);
            setIsActive(true);
          }
        } catch (error) {
          console.error('Error loading timer state:', error);
          // Clear corrupted timer state
          localStorage.removeItem(timerStorageKey);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Set default project on load
  useEffect(() => {
      if(!selectedProjectId && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
  }, [projects, selectedProjectId]);

  // Save user data to localStorage
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem(`timeEntries_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user, isAuthenticated]);

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem(`clients_${user.id}`, JSON.stringify(clients));
    }
  }, [clients, user, isAuthenticated]);

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem(`projects_${user.id}`, JSON.stringify(projects));
    }
  }, [projects, user, isAuthenticated]);

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user, isAuthenticated]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (user && isAuthenticated) {
      const timerStorageKey = `timerState_${user.id}`;
      const timerState = {
        description,
        isActive,
        startTime,
        selectedProjectId,
        selectedTaskId,
        isTimerBillable,
      };
      localStorage.setItem(timerStorageKey, JSON.stringify(timerState));
    }
  }, [description, isActive, startTime, selectedProjectId, selectedTaskId, isTimerBillable, user, isAuthenticated]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else if (!isActive && elapsedTime !== 0) {
      if(interval) clearInterval(interval);
    }
    return () => {
      if(interval) clearInterval(interval);
    };
  }, [isActive, startTime]);
  
  // Effect to update default billable status and reset task when project changes
  useEffect(() => {
    if (selectedProjectId) {
        const project = projects.find(p => p.id === selectedProjectId);
        setIsTimerBillable(project?.isBillable ?? true);
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
        setSelectedTaskId(projectTasks[0]?.id);
    } else {
        setSelectedTaskId(undefined);
    }
  }, [selectedProjectId, projects, tasks]);

  const handleStart = useCallback(() => {
    if (isActive) return;
    const now = Date.now();
    setStartTime(now - elapsedTime);
    setIsActive(true);
  }, [isActive, elapsedTime]);

  const handleStop = useCallback(() => {
    if (!isActive || !user) return;
    const endTime = Date.now();
    const newEntry: TimeEntry = {
      id: uuidv4(),
      description: description || t('app.noDescription'),
      startTime: startTime,
      endTime: endTime,
      projectId: selectedProjectId,
      taskId: selectedTaskId,
      billable: isTimerBillable,
      userId: user.id,
    };
    setEntries(prev => [newEntry, ...prev]);
    setIsActive(false);
    setDescription('');
    setElapsedTime(0);
    setStartTime(0);

    // Clear timer state from localStorage when stopped
    const timerStorageKey = `timerState_${user.id}`;
    localStorage.removeItem(timerStorageKey);
  }, [isActive, description, startTime, selectedProjectId, selectedTaskId, isTimerBillable, t, user]);
  
  const handleStartNewTimer = (entryToRestart: TimeEntry) => {
    if (isActive) {
        handleStop();
    }
    setDescription(entryToRestart.description);
    setSelectedProjectId(entryToRestart.projectId);
    setSelectedTaskId(entryToRestart.taskId);
    setIsTimerBillable(entryToRestart.billable);
    setElapsedTime(0);
    const now = Date.now();
    setStartTime(now);
    setIsActive(true);
  }

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const handleManualEntryAdd = useCallback((data: ManualTimeEntryData) => {
    if (!user) return;

    try {
      let timestamps: { startTimestamp: number; endTimestamp: number } | null = null;

      if (data.startTime && data.endTime) {
        // Use time range
        timestamps = createTimestampsFromDateAndTime(data.date, data.startTime, data.endTime);
      } else if (data.duration) {
        // Use duration
        timestamps = createTimestampsFromDateAndDuration(data.date, data.duration);
      }

      if (!timestamps) {
        console.error('Failed to create timestamps for entry');
        return;
      }

      if (data.id) {
        // Editing existing entry
        const updatedEntry: TimeEntry = {
          id: data.id,
          description: data.description,
          startTime: timestamps.startTimestamp,
          endTime: timestamps.endTimestamp,
          projectId: data.projectId,
          taskId: data.taskId,
          billable: data.billable,
          userId: user.id,
          isManual: true, // Mark as manual since it was edited
        };

        setEntries(prev => prev.map(entry => entry.id === data.id ? updatedEntry : entry));
        setEditingTimeEntry(null);
        setIsEditModalOpen(false);
        console.log('Time entry updated successfully');
      } else {
        // Adding new entry
        const newEntry: TimeEntry = {
          id: uuidv4(),
          description: data.description,
          startTime: timestamps.startTimestamp,
          endTime: timestamps.endTimestamp,
          projectId: data.projectId,
          taskId: data.taskId,
          billable: data.billable,
          userId: user.id,
          isManual: true,
        };

        setEntries(prev => [newEntry, ...prev]);
        console.log('Manual time entry added successfully');
      }
    } catch (error) {
      console.error('Error processing time entry:', error);
    }
  }, [user]);

  const handleEditTimeEntry = useCallback((entry: TimeEntry) => {
    setEditingTimeEntry(entry);
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setEditingTimeEntry(null);
    setIsEditModalOpen(false);
  }, []);

  // Client CRUD Handlers
  const handleAddClient = (clientPayload: NewClientPayload) => {
    if (!user) return;
    const newClient: Client = { id: uuidv4(), ...clientPayload, userId: user.id };
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (clientId: string) => {
    const isClientInUse = projects.some(p => p.clientId === clientId);
    if (isClientInUse) {
        alert(t('app.alerts.clientInUse'));
        return;
    }
    if (window.confirm(t('app.alerts.confirmDeleteClient'))) {
        setClients(prev => prev.filter(c => c.id !== clientId));
    }
  };

  // Project CRUD Handlers
  const handleAddProject = (projectPayload: NewProjectPayload) => {
    if (!user) return;
    const newProject: Project = { id: uuidv4(), ...projectPayload, userId: user.id };
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
     setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
    const isProjectInUse = tasks.some(t => t.projectId === projectId);
    if (isProjectInUse) {
        alert(t('app.alerts.projectInUse'));
        return;
    }
    if (window.confirm(t('app.alerts.confirmDeleteProject'))) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };
  
  // Task CRUD Handlers
  const handleAddTask = (taskPayload: NewTaskPayload) => {
    if (!user) return;
    const newTask: Task = { id: uuidv4(), ...taskPayload, userId: user.id };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm(t('app.alerts.confirmDeleteTask'))) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const renderView = () => {
    const dashboardProps = {
        entries,
        description,
        onDescriptionChange: setDescription,
        onStart: isActive ? handleStop : handleStart,
        onStop: handleStop,
        onDelete: handleDeleteEntry,
        onEdit: handleEditTimeEntry,
        isActive,
        elapsedTime,
        onRestart: handleStartNewTimer,
        projects,
        tasks,
        selectedProjectId,
        onProjectChange: setSelectedProjectId,
        selectedTaskId,
        onTaskChange: setSelectedTaskId,
        isTimerBillable,
        onBillableChange: setIsTimerBillable,
        onManualEntryAdd: handleManualEntryAdd,
    };

    switch (view) {
      case 'Dashboard':
        return <Dashboard {...dashboardProps} />;
      case 'List':
        return <TimeEntryTable entries={entries} onDelete={handleDeleteEntry} onEdit={handleEditTimeEntry} projects={projects} tasks={tasks} />;
      case 'Calendar':
        return <CalendarView entries={entries} onDelete={handleDeleteEntry} projects={projects} tasks={tasks} />;
      case 'Projects':
        return <ProjectsPage 
                    projects={projects} 
                    clients={clients} 
                    onAddProject={handleAddProject}
                    onUpdateProject={handleUpdateProject}
                    onDeleteProject={handleDeleteProject}
                />;
      case 'Clients':
        return <ClientsPage 
                    clients={clients}
                    onAddClient={handleAddClient}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                />;
      case 'Tasks':
        return <TasksPage 
                    tasks={tasks} 
                    projects={projects}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />;
      case 'Reports':
        return <ReportsPage entries={entries} projects={projects} tasks={tasks} clients={clients} />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <Dashboard {...dashboardProps} />;
    }
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col text-white group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center min-h-screen bg-[#111827]">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <TimeWiseLogo className="h-20 w-20" size={80} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">TimeWise</h1>
            <p className="text-gray-400 mb-8">Loading...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38e07b] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication modal for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="relative flex size-full min-h-screen flex-col text-white group/design-root overflow-x-hidden">
        <div className="flex items-center justify-center min-h-screen bg-[#111827]">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <TimeWiseLogo className="h-20 w-20" size={80} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">TimeWise</h1>
            <p className="text-gray-400 mb-8">Modern Time Tracking & Reports</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-[#38e07b] hover:bg-[#2dd46f] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative flex size-full min-h-screen flex-col text-white group/design-root overflow-x-hidden">
        <Header
          currentView={view}
          setView={setView}
        />
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-8">
          <div className="layout-content-container mx-auto flex max-w-7xl flex-col">
              {renderView()}
          </div>
        </main>

        {/* Time Entry Edit Modal */}
        <ManualTimeEntryModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSave={handleManualEntryAdd}
          projects={projects}
          tasks={tasks}
          editingEntry={editingTimeEntry}
        />
      </div>
    </ProtectedRoute>
  );
};

export default App;