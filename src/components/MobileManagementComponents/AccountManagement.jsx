import React, { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';
import Toast from '../Toast';

const getFilenameFromPath = (filepath) => {
    if (!filepath) return '';
    return filepath.split('/').pop();
};

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const [resetConfirmation, setResetConfirmation] = useState({
        show: false,
        accountId: null,
        accountName: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('http://localhost:5000/api/accounts/profiles');
            const sortedAccounts = response.data.sort((a, b) => a.id - b.id);
            setAccounts(sortedAccounts);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            setError(error.response?.data?.message || 'Error fetching accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create new account without token
            await axios.post(
                'http://localhost:5000/api/accounts/profiles',
                formData,
                { 
                    headers: { 
                        'Content-Type': 'application/json'
                    } 
                }
            );

            await fetchAccounts();
            setShowModal(false);
            resetForm();

            const successDialog = document.getElementById('alert_success');
            if (successDialog) {
                const messageText = successDialog.querySelector('.py-4');
                if (messageText) {
                    messageText.textContent = `Account created successfully for ${formData.full_name}`;
                }
                successDialog.showModal();
            }
        } catch (error) {
            console.error('Error creating account:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create account';
            
            const errorDialog = document.getElementById('alert_error');
            if (errorDialog) {
                const errorText = errorDialog.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = errorMessage;
                }
                errorDialog.showModal();
            }
        }
    };

    const handleResetPassword = async (accountId, accountName) => {
        setResetConfirmation({
            show: true,
            accountId,
            accountName
        });
    };

    const confirmReset = async () => {
        try {
            await axios.post(
                `http://localhost:5000/api/accounts/profiles/${resetConfirmation.accountId}/reset`
            );

            setResetConfirmation({
                show: false,
                accountId: null,
                accountName: ''
            });

            const successResetDialog = document.getElementById('alert_success_reset');
            if (successResetDialog) {
                const messageText = successResetDialog.querySelector('.py-4');
                if (messageText) {
                    messageText.textContent = `Password has been reset to 'sekolah!123' for ${resetConfirmation.accountName}`;
                }
                successResetDialog.showModal();
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            const errorDialog = document.getElementById('alert_error');
            if (errorDialog) {
                const errorText = errorDialog.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = error.response?.data?.message || 'Failed to reset password';
                }
                errorDialog.showModal();
            }
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:5000/api/accounts/profiles/${selectedAccount.id}`,
                formData,
                { 
                    headers: { 
                        'Content-Type': 'application/json'
                    } 
                }
            );

            await fetchAccounts();
            setShowModal(false);
            resetForm();

            const successDialog = document.getElementById('alert_success');
            if (successDialog) {
                successDialog.showModal();
            }
        } catch (error) {
            console.error('Error updating account:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update account';
            
            const errorDialog = document.getElementById('alert_error');
            if (errorDialog) {
                const errorText = errorDialog.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = errorMessage;
                }
                errorDialog.showModal();
            }
        }
    };

    const handleToggleMainPage = async (id, value) => {
        try {
            await axios.put(
                `http://localhost:5000/api/accounts/profiles/${id}/main-page`,
                { main_page: value },
                { 
                    headers: { 
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            setAccounts(prevAccounts => 
                prevAccounts.map(account => 
                    account.id === id 
                        ? { ...account, main_page: value }
                        : account
                )
            );
        } catch (error) {
            console.error('Error updating main page status:', error);
            const errorDialog = document.getElementById('alert_error');
            if (errorDialog) {
                const errorText = errorDialog.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = error.response?.data?.message || 'Failed to update main page status';
                }
                errorDialog.showModal();
            }
            await fetchAccounts();
        }
    };

    const handleToggleStatus = async (id, value) => {
        try {
            await axios.put(
                `http://localhost:5000/api/accounts/profiles/${id}/status`,
                { status: value },
                { 
                    headers: { 
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            setAccounts(prevAccounts => 
                prevAccounts.map(account => 
                    account.id === id 
                        ? { ...account, status: value }
                        : account
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
            const errorDialog = document.getElementById('alert_error');
            if (errorDialog) {
                const errorText = errorDialog.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = error.response?.data?.message || 'Failed to update status';
                }
                errorDialog.showModal();
            }
            await fetchAccounts();
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            full_name: '',
            email: ''
        });
        setSelectedAccount(null);
    };

    const filteredAccounts = accounts.filter(account => 
        account.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageUpload = async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            await axios.post(
                `http://localhost:5000/api/accounts/profiles/${id}/image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Refresh accounts to get updated image
            await fetchAccounts();

            setToast({
                show: true,
                message: 'Profile image updated successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error uploading profile image:', error);
            setToast({
                show: true,
                message: 'Failed to upload profile image',
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[200px] text-error">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* Header Card */}
                <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Manajemen Akun</h3>
                                <p className="text-sm text-gray-500">Kelola akun pengguna aplikasi mobile</p>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
                            >
                                Tambah Akun
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Stats Card */}
                <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Input */}
                            <div className="form-control w-full sm:max-w-xs">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Cari nama..."
                                        className="input input-bordered w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button 
                                            className="btn btn-square btn-ghost"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Account Stats */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">{accounts.length}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                    <span className="text-gray-600">Aktif:</span>
                                    <span className="font-medium text-success">
                                        {accounts.filter(account => account.status).length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-2 h-2 rounded-full bg-error"></div>
                                    <span className="text-gray-600">Nonaktif:</span>
                                    <span className="font-medium text-error">
                                        {accounts.filter(account => !account.status).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table section remains the same */}
                <div className="overflow-x-auto">
                    <table className="table bg-white">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Profile</th>
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Last Login</th>
                                <th>Main Page</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map((account) => (
                                <tr key={account.id}>
                                    <td className="font-medium">{account.id}</td>
                                    <td>
                                        <div className="avatar">
                                            <div className="w-8 h-8 rounded-full relative group">
                                                <img
                                                    src={account.profile_image 
                                                        ? `http://localhost:5000/api/accounts/profile-image/${account.id}/${getFilenameFromPath(account.profile_image)}`
                                                        : "https://via.placeholder.com/40"}
                                                    alt={account.full_name}
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        console.error('Profile image load error:', account.profile_image);
                                                        e.target.src = "https://via.placeholder.com/40";
                                                    }}
                                                />
                                                <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleImageUpload(account.id, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{account.full_name}</td>
                                    <td>{account.username}</td>
                                    <td>{account.email}</td>
                                    <td>
                                        {account.last_login ? 
                                            moment(account.last_login).format('DD MMM YYYY, HH:mm') : 
                                            'Never'
                                        }
                                    </td>
                                    <td>
                                        <label className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-green-500">
                                            <input
                                                type="checkbox"
                                                checked={account.main_page}
                                                onChange={() => handleToggleMainPage(account.id, !account.main_page)}
                                                className="peer sr-only"
                                            />
                                            <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <label className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-green-500">
                                            <input
                                                type="checkbox"
                                                checked={account.status}
                                                onChange={() => handleToggleStatus(account.id, !account.status)}
                                                className="peer sr-only"
                                            />
                                            <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <span className="inline-flex -space-x-px overflow-hidden rounded-md border bg-white shadow-sm">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setFormData({
                                                        username: account.username,
                                                        full_name: account.full_name,
                                                        email: account.email
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:relative"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleResetPassword(account.id, account.full_name)}
                                                className="inline-block px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-gray-50 focus:relative"
                                            >
                                                Reset
                                            </button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            {selectedAccount ? 'Edit Account' : 'Create New Account'}
                        </h3>
                        <form onSubmit={selectedAccount ? handleEdit : handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        full_name: e.target.value
                                    })}
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Username</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        username: e.target.value
                                    })}
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        email: e.target.value
                                    })}
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}>close</button>
                    </form>
                </dialog>
            )}

            {/* Alert Dialogs */}
            <dialog id="alert_success" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Success</h3>
                    <p className="py-4">Operation completed successfully</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_error" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">An error occurred. Please try again.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_success_reset" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Password Reset Success</h3>
                    <p className="py-4">Password has been reset to default (sekolah!123)</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Reset Confirmation Modal */}
            {resetConfirmation.show && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Konfirmasi Reset Password</h3>
                        <p className="py-4">
                            Apakah Anda yakin ingin mereset password untuk <span className="font-semibold">{resetConfirmation.accountName}</span>?
                            <br />
                            <span className="text-sm text-gray-500 mt-2 block">
                                Password baru akan menjadi: sekolah!123
                            </span>
                        </p>
                        <div className="modal-action">
                            <button
                                onClick={() => setResetConfirmation({
                                    show: false,
                                    accountId: null,
                                    accountName: ''
                                })}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReset}
                                className="btn btn-warning"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setResetConfirmation({
                            show: false,
                            accountId: null,
                            accountName: ''
                        })}>close</button>
                    </form>
                </dialog>
            )}

            {/* Add Toast component at the end */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default AccountManagement; 