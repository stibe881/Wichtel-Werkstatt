import React, { useState } from 'react';
import { AppState, UserProfile, UserInvitation, ArchivedYear } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    state: AppState;
    setState: (updater: (prev: AppState) => AppState) => void;
}

const UserProfileComponent: React.FC<Props> = ({ state, setState }) => {
    const [activeTab, setActiveTab] = useState<'password' | 'invitations' | 'archives'>('password');

    // Password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    // Invitations
    const [inviteEmail, setInviteEmail] = useState('');

    // Archive
    const [selectedArchiveYear, setSelectedArchiveYear] = useState<number | null>(null);

    // Initialize user profile if not exists
    if (!state.userProfile) {
        setState(prev => ({
            ...prev,
            userProfile: {
                id: uuidv4(),
                email: 'user@wichtel-werkstatt.ch',
                password: 'wichtel123', // Demo password
                invitations: []
            }
        }));
    }

    const userProfile = state.userProfile!;

    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage('❌ Bitte alle Felder ausfüllen');
            return;
        }

        if (currentPassword !== userProfile.password) {
            setPasswordMessage('❌ Aktuelles Passwort ist falsch');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage('❌ Neue Passwörter stimmen nicht überein');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage('❌ Neues Passwort muss mindestens 6 Zeichen haben');
            return;
        }

        setState(prev => ({
            ...prev,
            userProfile: {
                ...prev.userProfile!,
                password: newPassword
            }
        }));

        setPasswordMessage('✅ Passwort erfolgreich geändert!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => setPasswordMessage(''), 3000);
    };

    const handleSendInvitation = () => {
        if (!inviteEmail || !inviteEmail.includes('@')) {
            alert('Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return;
        }

        const newInvitation: UserInvitation = {
            id: uuidv4(),
            email: inviteEmail,
            invitedAt: new Date().toISOString(),
            status: 'pending'
        };

        setState(prev => ({
            ...prev,
            userProfile: {
                ...prev.userProfile!,
                invitations: [...prev.userProfile!.invitations, newInvitation]
            }
        }));

        setInviteEmail('');
        alert(`Einladung an ${newInvitation.email} wurde versendet!`);
    };

    const handleDeleteInvitation = (id: string) => {
        setState(prev => ({
            ...prev,
            userProfile: {
                ...prev.userProfile!,
                invitations: prev.userProfile!.invitations.filter(inv => inv.id !== id)
            }
        }));
    };

    const handleArchiveCurrentYear = () => {
        const currentYear = new Date().getFullYear();

        if (state.archives.some(a => a.year === currentYear)) {
            alert('Das aktuelle Jahr wurde bereits archiviert!');
            return;
        }

        const newArchive: ArchivedYear = {
            year: currentYear,
            calendar: [...state.calendar],
            shoppingList: [...state.shoppingList],
            timestamp: new Date().toISOString()
        };

        setState(prev => ({
            ...prev,
            archives: [...prev.archives, newArchive]
        }));

        alert(`Jahr ${currentYear} wurde erfolgreich archiviert!`);
    };

    const handleDeleteArchive = (year: number) => {
        if (confirm(`Möchten Sie das Archiv für Jahr ${year} wirklich löschen?`)) {
            setState(prev => ({
                ...prev,
                archives: prev.archives.filter(a => a.year !== year)
            }));
        }
    };

    const selectedArchive = state.archives.find(a => a.year === selectedArchiveYear);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-elf-red to-elf-green p-8 rounded-t-2xl text-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <span className="material-icons-round text-6xl">account_circle</span>
                        <div>
                            <h1 className="text-4xl font-bold">Benutzerprofil</h1>
                            <p className="text-white/80 mt-1">{userProfile.email}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b-2 border-slate-200 flex">
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all ${
                            activeTab === 'password'
                                ? 'bg-elf-gold text-elf-dark border-b-4 border-elf-dark'
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <span className="material-icons-round text-lg align-middle mr-2">lock</span>
                        Passwort ändern
                    </button>
                    <button
                        onClick={() => setActiveTab('invitations')}
                        className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all ${
                            activeTab === 'invitations'
                                ? 'bg-elf-gold text-elf-dark border-b-4 border-elf-dark'
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <span className="material-icons-round text-lg align-middle mr-2">group_add</span>
                        Einladungen
                    </button>
                    <button
                        onClick={() => setActiveTab('archives')}
                        className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all ${
                            activeTab === 'archives'
                                ? 'bg-elf-gold text-elf-dark border-b-4 border-elf-dark'
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <span className="material-icons-round text-lg align-middle mr-2">archive</span>
                        Archive
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white p-8 rounded-b-2xl shadow-xl">
                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="space-y-6 max-w-md">
                            <h2 className="text-2xl font-bold text-elf-dark mb-4">Passwort ändern</h2>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Aktuelles Passwort
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-elf-gold outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Neues Passwort
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-elf-gold outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Neues Passwort bestätigen
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-elf-gold outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            {passwordMessage && (
                                <div className={`p-3 rounded-lg font-bold ${
                                    passwordMessage.includes('✅')
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {passwordMessage}
                                </div>
                            )}

                            <button
                                onClick={handlePasswordChange}
                                className="w-full bg-gradient-to-r from-elf-red to-elf-green text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all"
                            >
                                Passwort ändern
                            </button>
                        </div>
                    )}

                    {/* Invitations Tab */}
                    {activeTab === 'invitations' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-elf-dark mb-4">Personen einladen</h2>
                            <p className="text-slate-600 mb-6">
                                Laden Sie andere Personen zu Ihrer Wichtel-Werkstatt ein. Sie können dann gemeinsam
                                im Planer, Ideen-Katalog und allen anderen Bereichen arbeiten.
                            </p>

                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="E-Mail-Adresse eingeben"
                                    className="flex-1 p-3 border-2 border-slate-200 rounded-lg focus:border-elf-gold outline-none"
                                />
                                <button
                                    onClick={handleSendInvitation}
                                    className="bg-elf-green text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons-round">send</span>
                                    Einladen
                                </button>
                            </div>

                            {userProfile.invitations.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="font-bold text-lg mb-4 text-slate-700">Gesendete Einladungen</h3>
                                    <div className="space-y-3">
                                        {userProfile.invitations.map(invitation => (
                                            <div
                                                key={invitation.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-800">{invitation.email}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(invitation.invitedAt).toLocaleDateString('de-DE')} •{' '}
                                                        <span className={`font-bold ${
                                                            invitation.status === 'pending' ? 'text-yellow-600' :
                                                            invitation.status === 'accepted' ? 'text-green-600' :
                                                            'text-red-600'
                                                        }`}>
                                                            {invitation.status === 'pending' ? 'Ausstehend' :
                                                             invitation.status === 'accepted' ? 'Akzeptiert' :
                                                             'Abgelehnt'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteInvitation(invitation.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                                >
                                                    <span className="material-icons-round">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Archives Tab */}
                    {activeTab === 'archives' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-elf-dark">Archivierte Jahre</h2>
                                    <p className="text-slate-600 mt-1">
                                        Archivieren Sie das aktuelle Jahr oder sehen Sie vergangene Jahre nach
                                    </p>
                                </div>
                                <button
                                    onClick={handleArchiveCurrentYear}
                                    className="bg-elf-gold text-elf-dark px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons-round">archive</span>
                                    {new Date().getFullYear()} archivieren
                                </button>
                            </div>

                            {state.archives.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-lg">
                                    <span className="material-icons-round text-6xl text-slate-300 mb-4">inbox</span>
                                    <p className="text-slate-500 font-bold">Noch keine archivierten Jahre</p>
                                    <p className="text-sm text-slate-400 mt-2">
                                        Archivieren Sie das aktuelle Jahr, um es später wieder ansehen zu können
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Archive List */}
                                    <div className="space-y-3">
                                        {state.archives.sort((a, b) => b.year - a.year).map(archive => (
                                            <div
                                                key={archive.year}
                                                onClick={() => setSelectedArchiveYear(archive.year)}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                    selectedArchiveYear === archive.year
                                                        ? 'bg-elf-gold border-elf-dark shadow-md'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-lg">{archive.year}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(archive.timestamp).toLocaleDateString('de-DE')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteArchive(archive.year);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                                    >
                                                        <span className="material-icons-round text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Archive Details */}
                                    {selectedArchive && (
                                        <div className="lg:col-span-2 bg-white rounded-lg border-2 border-slate-200 p-6">
                                            <h3 className="text-xl font-bold text-elf-dark mb-4">
                                                Jahr {selectedArchive.year}
                                            </h3>

                                            <div className="space-y-6">
                                                {/* Calendar */}
                                                <div>
                                                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                        <span className="material-icons-round text-elf-gold">calendar_today</span>
                                                        Kalender
                                                    </h4>
                                                    <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                                                        {selectedArchive.calendar.map(day => (
                                                            <div
                                                                key={day.day}
                                                                className={`p-2 rounded text-center text-xs font-bold ${
                                                                    day.completed
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : day.idea
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-slate-100 text-slate-400'
                                                                }`}
                                                            >
                                                                {day.day}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        {selectedArchive.calendar.filter(d => d.completed).length} von{' '}
                                                        {selectedArchive.calendar.length} Tagen abgeschlossen
                                                    </p>
                                                </div>

                                                {/* Shopping List */}
                                                <div>
                                                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                        <span className="material-icons-round text-elf-gold">shopping_cart</span>
                                                        Einkaufsliste ({selectedArchive.shoppingList.length} Artikel)
                                                    </h4>
                                                    {selectedArchive.shoppingList.length > 0 ? (
                                                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 max-h-48 overflow-y-auto">
                                                            {selectedArchive.shoppingList.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic">Keine Artikel</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileComponent;
