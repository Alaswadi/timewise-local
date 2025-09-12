import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Client, NewClientPayload } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client | NewClientPayload) => void;
  client: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, client }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
    } else {
      setName('');
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert(t('clientModal.alert'));
        return;
    }
    const payload = client ? { ...client, name } : { name };
    onSave(payload);
  };
  
  const title = client ? t('clientModal.editTitle') : t('clientModal.addTitle');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-2">{t('clientModal.nameLabel')}</label>
          <input
            id="clientName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            required
          />
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-gray-900 font-semibold bg-[var(--primary-color)] hover:opacity-90 transition-opacity">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};