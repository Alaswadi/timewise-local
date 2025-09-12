import React from 'react';
import { Client } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onEdit, onDelete }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-start text-gray-300">
          <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3">{t('clientsPage.clientName')}</th>
              <th scope="col" className="px-6 py-3 text-end">{t('clientsPage.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 md:divide-y-0">
            {clients.map((client) => (
              <tr key={client.id} className="block md:table-row hover:bg-gray-700/50 transition-colors duration-200">
                <td data-label={t('clientsPage.clientName')} className="px-6 py-3 md:py-4 font-medium text-gray-100 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {client.name}
                </td>
                <td className="px-6 py-3 md:py-4 text-start md:text-end block md:table-cell">
                  <div className="flex items-center md:justify-end gap-2">
                    <button
                      onClick={() => onEdit(client)}
                      className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                      aria-label={t('clientsPage.editLabel', { name: client.name })}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete(client.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                      aria-label={t('clientsPage.deleteLabel', { name: client.name })}
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