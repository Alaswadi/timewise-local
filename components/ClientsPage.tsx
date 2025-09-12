import React, { useState } from 'react';
import { Client, NewClientPayload } from '../types';
import { ClientsTable } from './ClientsTable';
import { ClientFormModal } from './ClientFormModal';
import { PlusIcon } from './icons/PlusIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientsPageProps {
    clients: Client[];
    onAddClient: (client: NewClientPayload) => void;
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (id: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingClient(null);
        setIsModalOpen(false);
    };

    const handleSave = (clientData: NewClientPayload | Client) => {
        if ('id' in clientData) {
            onUpdateClient(clientData);
        } else {
            onAddClient(clientData);
        }
        handleCloseModal();
    }

    return (
        <div>
            <header className="mb-8 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100">{t('clientsPage.title')}</h1>
                    <p className="text-neutral-400">{t('clientsPage.description')}</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex self-start sm:self-auto items-center gap-2 bg-[var(--primary-color)] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <PlusIcon />
                    {t('clientsPage.addClient')}
                </button>
            </header>
            <ClientsTable clients={clients} onEdit={handleOpenModal} onDelete={onDeleteClient} />

            {isModalOpen && (
                <ClientFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    client={editingClient}
                />
            )}
        </div>
    );
};