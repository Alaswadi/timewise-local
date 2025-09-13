// FIX: Removed unused import from 'os'.
// import { type } from "os";

export interface TimeEntry {
  id: string;
  description: string;
  startTime: number;
  endTime: number;
  projectId?: string;
  taskId?: string;
  billable: boolean;
  userId: string; // Now required for authentication
  isManual?: boolean; // Flag to indicate manually added entries
  // FIX: Added optional properties for legacy multi-tenant components.
  workspaceId?: string;
}

export interface Client {
    id: string;
    name: string;
    userId: string; // Now required for authentication
    // FIX: Added optional property for legacy multi-tenant components.
    workspaceId?: string;
}

export interface Project {
    id: string;
    name: string;
    clientId: string;
    userId: string; // Now required for authentication
    isBillable: boolean;
    hourlyRate: number;
    // FIX: Added optional property for legacy multi-tenant components.
    workspaceId?: string;
}

export interface Task {
    id:string;
    name: string;
    projectId: string;
    userId: string; // Now required for authentication
    // FIX: Added optional property for legacy multi-tenant components.
    workspaceId?: string;
}

// Updated User interface for authentication system
export interface User {
    id: string;
    email: string;
    username: string;
    created_at: string;
    updated_at: string;
}

export interface Workspace {
    id: string;
    name: string;
}

export interface Membership {
    userId: string;
    workspaceId: string;
}

export interface ProjectReport {
    id: string;
    name: string;
    timeSpent: string;
    totalEarnings: string;
    progress: number;
}

export interface TeamMemberPerformance {
    id: string;
    name: string;
    timeLogged: string;
    tasksCompleted: number;
    efficiency: 'High' | 'Medium' | 'Low';
}

// FIX: Added type for the TeamReport component.
export interface TeamMemberReport {
    id: string;
    name: string;
    avatarUrl: string;
    timeLogged: string;
    totalEarnings: string;
}

export type NewClientPayload = Omit<Client, 'id'>;
export type NewProjectPayload = Omit<Project, 'id'>;
export type NewTaskPayload = Omit<Task, 'id'>;
