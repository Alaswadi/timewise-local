import React from 'react';
import { Project, Client } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { formatCurrency } from '../utils/time';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectsTableProps {
  projects: Project[];
  clients: Client[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, clients, onEdit, onDelete }) => {
  const { t, language } = useLanguage();

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || t('projectsPage.unknownClient');
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-start text-gray-300">
          <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3">{t('projectsPage.projectName')}</th>
              <th scope="col" className="px-6 py-3">{t('projectsPage.client')}</th>
              <th scope="col" className="px-6 py-3">{t('projectsPage.billable')}</th>
              <th scope="col" className="px-6 py-3">{t('projectsPage.rate')}</th>
              <th scope="col" className="px-6 py-3 text-end">{t('projectsPage.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 md:divide-y-0">
            {projects.map((project) => (
              <tr key={project.id} className="block md:table-row hover:bg-gray-700/50 transition-colors duration-200">
                <td data-label={t('projectsPage.projectName')} className="px-6 py-3 md:py-4 font-medium text-gray-100 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {project.name}
                </td>
                <td data-label={t('projectsPage.client')} className="px-6 py-3 md:py-4 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {getClientName(project.clientId)}
                </td>
                <td data-label={t('projectsPage.billable')} className="px-6 py-3 md:py-4 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                  {project.isBillable ? (
                    <span className="inline-flex items-center rounded-full bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-400">{t('projectsPage.yes')}</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-gray-400">{t('projectsPage.no')}</span>
                  )}
                </td>
                <td data-label={t('projectsPage.rate')} className="px-6 py-3 md:py-4 whitespace-nowrap font-mono block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {project.isBillable ? `${formatCurrency(project.hourlyRate, language)}/hr` : t('list.notApplicable')}
                </td>
                <td className="px-6 py-3 md:py-4 text-start md:text-end block md:table-cell">
                  <div className="flex items-center md:justify-end gap-2">
                     <button
                        onClick={() => onEdit(project)}
                        className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                        aria-label={t('projectsPage.editLabel', { name: project.name })}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => onDelete(project.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                        aria-label={t('projectsPage.deleteLabel', { name: project.name })}
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