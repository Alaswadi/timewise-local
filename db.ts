import { User, Workspace, Membership, Client, Project, Task, TimeEntry } from './types';
import { v4 as uuidv4 } from 'uuid';

// This file acts as a simple in-memory database.
// In a real application, this data would come from a backend API.

export let users: User[] = [
    { id: 'user-1', name: 'Alex Doe', avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
    { id: 'user-2', name: 'Maria Garcia', avatarUrl: 'https://i.pravatar.cc/150?u=maria' },
];

export let workspaces: Workspace[] = [
    { id: 'ws-1', name: 'Personal Workspace' },
    { id: 'ws-2', name: 'Freelance Hub' },
];

export let memberships: Membership[] = [
    { userId: 'user-1', workspaceId: 'ws-1' },
    { userId: 'user-1', workspaceId: 'ws-2' },
    { userId: 'user-2', workspaceId: 'ws-2' },
];

export let clients: Client[] = [
  { id: 'client-1', name: 'Internal', workspaceId: 'ws-1' },
  { id: 'client-2', name: 'RetailCorp', workspaceId: 'ws-2' },
  { id: 'client-3', name: 'Data Inc.', workspaceId: 'ws-2' },
];

export let projects: Project[] = [
  { id: 'proj-1', name: 'Time Tracker App', clientId: 'client-1', isBillable: true, hourlyRate: 50, workspaceId: 'ws-1' },
  { id: 'proj-2', name: 'E-commerce Platform', clientId: 'client-2', isBillable: true, hourlyRate: 75, workspaceId: 'ws-2' },
  { id: 'proj-3', name: 'Data Analytics Dashboard', clientId: 'client-3', isBillable: false, hourlyRate: 0, workspaceId: 'ws-2' },
];

export let tasks: Task[] = [
  { id: 'task-1', name: 'Develop UI components', projectId: 'proj-1', workspaceId: 'ws-1' },
  { id: 'task-2', name: 'Setup database schema', projectId: 'proj-1', workspaceId: 'ws-1' },
  { id: 'task-3', name: 'Implement checkout flow', projectId: 'proj-2', workspaceId: 'ws-2' },
  { id: 'task-4', name: 'Visualize sales data', projectId: 'proj-3', workspaceId: 'ws-2' },
];

// Time entries are special because we also persist them to localStorage.
// This array serves as the initial state if localStorage is empty.
export let initialEntries: TimeEntry[] = [
    { id: uuidv4(), description: "Refactor auth module", startTime: Date.now() - 3 * 3600 * 1000, endTime: Date.now() - 2 * 3600 * 1000, projectId: "proj-1", billable: true, userId: "user-1", workspaceId: "ws-1" },
    { id: uuidv4(), description: "Design landing page mockups", startTime: Date.now() - 5 * 3600 * 1000, endTime: Date.now() - 4 * 3600 * 1000, projectId: "proj-2", billable: true, userId: "user-1", workspaceId: "ws-2" },
    { id: uuidv4(), description: "API integration for payments", startTime: Date.now() - 8 * 3600 * 1000, endTime: Date.now() - 6 * 3600 * 1000, projectId: "proj-2", billable: true, userId: "user-2", workspaceId: "ws-2" },
];
