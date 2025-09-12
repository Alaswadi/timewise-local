import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Project, Client, NewProjectPayload } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project | NewProjectPayload) => void;
  project: Project | null;
  clients: Client[];
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, project, clients }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(0);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setClientId(project.clientId);
      setIsBillable(project.isBillable);
      setHourlyRate(project.hourlyRate || 0);
    } else {
      setName('');
      setClientId(clients[0]?.id || '');
      setIsBillable(true);
      setHourlyRate(50);
    }
  }, [project, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) {
      alert(t('projectModal.alert'));
      return;
    }
    const finalHourlyRate = isBillable ? hourlyRate : 0;
    const payload = project ? { ...project, name, clientId, isBillable, hourlyRate: finalHourlyRate } : { name, clientId, isBillable, hourlyRate: finalHourlyRate };
    onSave(payload);
  };
  
  const title = project ? t('projectModal.editTitle') : t('projectModal.addTitle');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">{t('projectModal.nameLabel')}</label>
          <input
            id="projectName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-2">{t('projectModal.clientLabel')}</label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            required
          >
            <option value="" disabled>{t('projectModal.selectClient')}</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-700/50">
            <span className="text-sm font-medium text-gray-300">{t('projectModal.isBillableLabel')}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={isBillable} onChange={(e) => setIsBillable(e.target.checked)} />
                <div className="block w-11 h-6 rounded-full bg-gray-600 peer-checked:bg-[var(--primary-color)] transition"></div>
                <div className="dot absolute top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 ltr:left-1 rtl:right-1"></div>
            </div>
          </label>
        </div>
        {isBillable && (
             <div className="mb-4">
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">{t('projectModal.rateLabel')}</label>
                <input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    min="0"
                    step="0.01"
                />
            </div>
        )}
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-gray-900 font-semibold bg-[var(--primary-color)] hover:opacity-90 transition-opacity">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};