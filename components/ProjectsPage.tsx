import React, { useState } from 'react';
import { Project, Client, NewProjectPayload } from '../types';
import { ProjectsTable } from './ProjectsTable';
import { ProjectFormModal } from './ProjectFormModal';
import { PlusIcon } from './icons/PlusIcon';
import { useLanguage } from '../contexts/LanguageContext';


interface ProjectsPageProps {
    projects: Project[];
    clients: Client[];
    onAddProject: (project: NewProjectPayload) => void;
    onUpdateProject: (project: Project) => void;
    onDeleteProject: (id: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, clients, onAddProject, onUpdateProject, onDeleteProject }) => {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleOpenModal = (project: Project | null = null) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProject(null);
        setIsModalOpen(false);
    };

    const handleSave = (projectData: NewProjectPayload | Project) => {
        if ('id' in projectData) {
            onUpdateProject(projectData);
        } else {
            onAddProject(projectData);
        }
        handleCloseModal();
    }

    return (
        <div>
            <header className="mb-8 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100">{t('projectsPage.title')}</h1>
                    <p className="text-neutral-400">{t('projectsPage.description')}</p>
                </div>
                 <button onClick={() => handleOpenModal()} className="flex self-start sm:self-auto items-center gap-2 bg-[var(--primary-color)] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <PlusIcon />
                    {t('projectsPage.addProject')}
                </button>
            </header>
            <ProjectsTable projects={projects} clients={clients} onEdit={handleOpenModal} onDelete={onDeleteProject} />
            {isModalOpen && (
                <ProjectFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    clients={clients}
                    project={editingProject}
                />
            )}
        </div>
    );
};