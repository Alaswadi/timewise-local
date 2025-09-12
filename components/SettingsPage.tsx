import React, { useState } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useUserPreferences, FirstDayOfWeek } from '../contexts/UserPreferencesContext';
import { useAuth } from '../contexts/AuthContext';

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


type SettingsTab = 'preferences' | 'account';

export const SettingsPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { preferences, setFirstDayOfWeek } = useUserPreferences();
    const { user, updateProfile, changePassword, isLoading, error, clearError } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('preferences');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        email: user?.email || '',
        username: user?.username || '',
    });

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    }

    const handleFirstDayOfWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFirstDayOfWeek(e.target.value as FirstDayOfWeek);
    }

    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (error) clearError();
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        const updates: { email?: string; username?: string } = {};

        if (profileFormData.email !== user.email) {
            updates.email = profileFormData.email;
        }

        if (profileFormData.username !== user.username) {
            updates.username = profileFormData.username;
        }

        if (Object.keys(updates).length === 0) {
            setIsEditingProfile(false);
            return;
        }

        const success = await updateProfile(updates);
        if (success) {
            setIsEditingProfile(false);
        }
    };

    const handleCancelProfileEdit = () => {
        setProfileFormData({
            email: user?.email || '',
            username: user?.username || '',
        });
        setIsEditingProfile(false);
        clearError();
    };

    // Password change handlers
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (error) clearError();
    };

    const handleChangePassword = async () => {
        if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
            return;
        }

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            return;
        }

        const success = await changePassword({
            currentPassword: passwordFormData.currentPassword,
            newPassword: passwordFormData.newPassword,
        });

        if (success) {
            setPasswordFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setIsChangingPassword(false);
        }
    };

    const handleCancelPasswordChange = () => {
        setPasswordFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setIsChangingPassword(false);
        clearError();
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // Define weekdays in order for the dropdown
    const weekdays: { value: FirstDayOfWeek; labelKey: string }[] = [
        { value: 'sunday', labelKey: 'calendar.weekdaysFull.sunday' },
        { value: 'monday', labelKey: 'calendar.weekdaysFull.monday' },
        { value: 'tuesday', labelKey: 'calendar.weekdaysFull.tuesday' },
        { value: 'wednesday', labelKey: 'calendar.weekdaysFull.wednesday' },
        { value: 'thursday', labelKey: 'calendar.weekdaysFull.thursday' },
        { value: 'friday', labelKey: 'calendar.weekdaysFull.friday' },
        { value: 'saturday', labelKey: 'calendar.weekdaysFull.saturday' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('settingsPage.title')}</h1>
                <p className="mt-2 text-gray-400">{t('settingsPage.description')}</p>
            </div>
            <div className="mb-8 border-b border-gray-700 overflow-x-auto">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8 rtl:space-x-reverse">
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                            activeTab === 'preferences'
                                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                                : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {t('settingsPage.tabs.preferences')}
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                            activeTab === 'account'
                                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                                : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {t('settingsPage.tabs.account')}
                    </button>
                </nav>
            </div>

            <div className="space-y-12">
                {activeTab === 'preferences' && (
                    <>
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
                                <SettingsSelect
                                    label={t('settingsPage.reports.firstDayOfWeek')}
                                    value={preferences.firstDayOfWeek}
                                    onChange={handleFirstDayOfWeekChange}
                                >
                                    {weekdays.map((day) => (
                                        <option key={day.value} value={day.value}>
                                            {t(day.labelKey)}
                                        </option>
                                    ))}
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
                    </>
                )}

                {activeTab === 'account' && user && (
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-6">{t('settingsPage.tabs.account')}</h2>
                        <div className="max-w-lg space-y-6">
                            {/* User Avatar */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 bg-[#38e07b] rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileFormData.email}
                                        onChange={handleProfileInputChange}
                                        className="w-full px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                ) : (
                                    <p className="text-white bg-[#374151] px-3 py-2 rounded-lg">{user.email}</p>
                                )}
                            </div>

                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Username
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={profileFormData.username}
                                        onChange={handleProfileInputChange}
                                        className="w-full px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                ) : (
                                    <p className="text-white bg-[#374151] px-3 py-2 rounded-lg">{user.username}</p>
                                )}
                            </div>

                            {/* Member Since */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Member Since
                                </label>
                                <p className="text-white bg-[#374151] px-3 py-2 rounded-lg">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            {isEditingProfile ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                        className="flex-1 bg-[#38e07b] hover:bg-[#2bc464] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined mr-1 text-sm">save</span>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelProfileEdit}
                                        disabled={isLoading}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined mr-1 text-sm">cancel</span>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined mr-2">edit</span>
                                    Edit Profile
                                </button>
                            )}

                            {/* Password Change Section */}
                            <div className="border-t border-gray-700 pt-6 mt-8">
                                <h3 className="text-lg font-semibold text-white mb-4">{t('settingsPage.account.password.title')}</h3>

                                {isChangingPassword ? (
                                    <div className="space-y-4">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('settingsPage.account.password.currentPassword')}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    name="currentPassword"
                                                    value={passwordFormData.currentPassword}
                                                    onChange={handlePasswordInputChange}
                                                    placeholder={t('settingsPage.account.password.currentPasswordPlaceholder')}
                                                    className="w-full px-3 py-2 pr-10 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {showPasswords.current ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('settingsPage.account.password.newPassword')}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    name="newPassword"
                                                    value={passwordFormData.newPassword}
                                                    onChange={handlePasswordInputChange}
                                                    placeholder={t('settingsPage.account.password.newPasswordPlaceholder')}
                                                    className="w-full px-3 py-2 pr-10 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {showPasswords.new ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('settingsPage.account.password.confirmPassword')}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={passwordFormData.confirmPassword}
                                                    onChange={handlePasswordInputChange}
                                                    placeholder={t('settingsPage.account.password.confirmPasswordPlaceholder')}
                                                    className="w-full px-3 py-2 pr-10 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {showPasswords.confirm ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password validation */}
                                        {passwordFormData.newPassword && passwordFormData.confirmPassword &&
                                         passwordFormData.newPassword !== passwordFormData.confirmPassword && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <p className="text-red-400 text-sm">Passwords do not match</p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={isLoading || !passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword || passwordFormData.newPassword !== passwordFormData.confirmPassword}
                                                className="flex-1 bg-[#38e07b] hover:bg-[#2bc464] disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                            >
                                                {isLoading ? (
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined mr-1 text-sm">lock</span>
                                                        {t('settingsPage.account.password.changePassword')}
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancelPasswordChange}
                                                disabled={isLoading}
                                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined mr-1 text-sm">cancel</span>
                                                {t('settingsPage.account.profile.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined mr-2">lock</span>
                                        {t('settingsPage.account.password.changePassword')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};