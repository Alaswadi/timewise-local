import React from 'react';
import { Task, Project } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TasksTableProps {
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({ tasks, projects, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || t('tasksPage.unknownProject');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-start text-gray-300">
          <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3">{t('tasksPage.taskName')}</th>
              <th scope="col" className="px-6 py-3">{t('tasksPage.project')}</th>
              <th scope="col" className="px-6 py-3 text-end">{t('tasksPage.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 md:divide-y-0">
            {tasks.map((task) => (
              <tr key={task.id} className="block md:table-row hover:bg-gray-700/50 transition-colors duration-200">
                <td data-label={t('tasksPage.taskName')} className="px-6 py-3 md:py-4 font-medium text-gray-100 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {task.name}
                </td>
                <td data-label={t('tasksPage.project')} className="px-6 py-3 md:py-4 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {getProjectName(task.projectId)}
                </td>
                <td className="px-6 py-3 md:py-4 text-start md:text-end block md:table-cell">
                  <div className="flex items-center md:justify-end gap-2">
                     <button
                        onClick={() => onEdit(task)}
                        className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                        aria-label={t('tasksPage.editLabel', { name: task.name })}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                        aria-label={t('tasksPage.deleteLabel', { name: task.name })}
                      >
                        <TrashIcon />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};