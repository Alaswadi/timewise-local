import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const SettingsSelect: React.FC<{ label: string, children: React.ReactNode, value?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, children, value, onChange }) => (
    <label className="block">
        <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
        <select value={value} onChange={onChange} className="form-select w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]">
            {children}
        </select>
    </label>
);

const ToggleSwitch: React.FC<{ label: string, description: string, defaultChecked?: boolean }> = ({ label, description, defaultChecked }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-gray-800 gap-4">
        <div>
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-gray-400 text-xs">{description}</p>
        </div>
        <label className="relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-600 transition has-[:checked]:bg-[var(--primary-color)] flex-shrink-0">
            <span className="absolute h-4 w-4 rounded-full bg-white transition-transform transform translate-x-1 has-[:checked]:translate-x-6 rtl:translate-x-1 rtl:has-[:checked]:-translate-x-6"></span>
            <input defaultChecked={defaultChecked} className="invisible" type="checkbox" />
        </label>
    </div>
);


export const SettingsPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('settingsPage.title')}</h1>
                <p className="mt-2 text-gray-400">{t('settingsPage.description')}</p>
            </div>
            <div className="mb-8 border-b border-gray-700 overflow-x-auto">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8 rtl:space-x-reverse">
                    <a className="whitespace-nowrap border-b-2 border-[var(--primary-color)] px-1 py-4 text-sm font-medium text-[var(--primary-color)]" href="#">{t('settingsPage.tabs.preferences')}</a>
                    <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-300" href="#">{t('settingsPage.tabs.account')}</a>
                    <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-300" href="#">{t('settingsPage.tabs.integrations')}</a>
                    <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-300" href="#">{t('settingsPage.tabs.api')}</a>
                </nav>
            </div>

            <div className="space-y-12">

                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">{t('settingsPage.language.title')}</h2>
                    <p className="text-gray-400 text-sm mb-6 max-w-lg">{t('settingsPage.language.description')}</p>
                    <div className="space-y-6 max-w-lg">
                       <SettingsSelect label={t('settingsPage.language.label')} value={language} onChange={handleLanguageChange}>
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                       </SettingsSelect>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-6">{t('settingsPage.general.title')}</h2>
                    <div className="space-y-6 max-w-lg">
                       <SettingsSelect label="Default workspace">
                            <option>My Workspace</option>
                       </SettingsSelect>
                       <SettingsSelect label="Default project">
                            <option>None</option>
                       </SettingsSelect>
                       <SettingsSelect label="Default tags">
                            <option>None</option>
                       </SettingsSelect>
                       <SettingsSelect label="Default billable">
                            <option>Non-billable</option>
                       </SettingsSelect>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-6">{t('settingsPage.timeTracking.title')}</h2>
                    <div className="space-y-6 max-w-lg">
                        <SettingsSelect label="Rounding">
                            <option>Round to nearest minute</option>
                        </SettingsSelect>
                        <SettingsSelect label="Duration format">
                            <option>Classic (hh:mm:ss)</option>
                        </SettingsSelect>
                        <SettingsSelect label="Time format">
                            <option>24-hour</option>
                        </SettingsSelect>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-semibold text-white mb-6">{t('settingsPage.reports.title')}</h2>
                     <div className="space-y-6 max-w-lg">
                        <SettingsSelect label="First day of the week">
                            <option>Monday</option>
                        </SettingsSelect>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-6">{t('settingsPage.notifications.title')}</h2>
                    <div className="space-y-4 max-w-xl">
                        <ToggleSwitch 
                            label="Weekly goal notifications"
                            description="Receive email notifications for your weekly time tracking goal."
                            defaultChecked
                        />
                         <ToggleSwitch 
                            label="Daily goal notifications"
                            description="Receive email notifications for your daily time tracking goal."
                        />
                         <ToggleSwitch 
                            label="Project goal notifications"
                            description="Receive email notifications for your project time tracking goal."
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};