import React, { useState } from 'react';
import { Task, Project, NewTaskPayload } from '../types';
import { TasksTable } from './TasksTable';
import { TaskFormModal } from './TaskFormModal';
import { PlusIcon } from './icons/PlusIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TasksPageProps {
    tasks: Task[];
    projects: Project[];
    onAddTask: (task: NewTaskPayload) => void;
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, projects, onAddTask, onUpdateTask, onDeleteTask }) => {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleOpenModal = (task: Task | null = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTask(null);
        setIsModalOpen(false);
    };

    const handleSave = (taskData: NewTaskPayload | Task) => {
        if ('id' in taskData) {
            onUpdateTask(taskData);
        } else {
            onAddTask(taskData);
        }
        handleCloseModal();
    }
    
    return (
        <div>
            <header className="mb-8 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100">{t('tasksPage.title')}</h1>
                    <p className="text-neutral-400">{t('tasksPage.description')}</p>
                </div>
                 <button onClick={() => handleOpenModal()} className="flex self-start sm:self-auto items-center gap-2 bg-[var(--primary-color)] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <PlusIcon />
                    {t('tasksPage.addTask')}
                </button>
            </header>
            <TasksTable tasks={tasks} projects={projects} onEdit={handleOpenModal} onDelete={onDeleteTask} />
            {isModalOpen && (
                <TaskFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    projects={projects}
                    task={editingTask}
                />
            )}
        </div>
    );
};