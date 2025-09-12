import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Task, Project, NewTaskPayload } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task | NewTaskPayload) => void;
  task: Task | null;
  projects: Project[];
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, task, projects }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setProjectId(task.projectId);
    } else {
      setName('');
      setProjectId(projects[0]?.id || '');
    }
  }, [task, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) {
      alert(t('taskModal.alert'));
      return;
    }
    const payload = task ? { ...task, name, projectId } : { name, projectId };
    onSave(payload);
  };
  
  const title = task ? t('taskModal.editTitle') : t('taskModal.addTitle');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="taskName" className="block text-sm font-medium text-gray-300 mb-2">{t('taskModal.nameLabel')}</label>
          <input
            id="taskName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-2">{t('taskModal.projectLabel')}</label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            required
          >
            <option value="" disabled>{t('taskModal.selectProject')}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-gray-900 font-semibold bg-[var(--primary-color)] hover:opacity-90 transition-opacity">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};