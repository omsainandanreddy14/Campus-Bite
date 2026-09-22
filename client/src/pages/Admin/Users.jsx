import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserMinus, CheckCircle2, ShieldAlert, PlusCircle, Trash2, Mail, Lock, User as UserIcon, Edit2 } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Default password for easy setup
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing profile states
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editWallet, setEditWallet] = useState(0);
  const [editStatus, setEditStatus] = useState('Active');
  const [editHostel, setEditHostel] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const fetchUsersList = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.admin.usersList(token);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error fetching users from database:', err.message);
    }
  };

  const fetchCouriersList = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.admin.getCouriers(token);
      if (res.success) {
        const sorted = (res.couriers || []).sort((a, b) => b.riderRating - a.riderRating);
        setCouriers(sorted);
      }
    } catch (err) {
      console.error('Error fetching couriers list:', err.message);
    }
  };

  // Fetch users on load and poll every 3 seconds for dynamic updates
  useEffect(() => {
    fetchUsersList();
    fetchCouriersList();
    const interval = setInterval(() => {
      fetchUsersList();
      fetchCouriersList();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSuccess('');

    try {
      const res = await api.auth.register(name, email, password, role);
      if (res.success) {
        setSuccess(`Account for ${name} registered successfully!`);
        setName('');
        setEmail('');
        setPassword('password123');
        fetchUsersList(); // Refresh list
      } else {
        setError(res.error || 'Failed to register account.');
      }
    } catch (err) {
      setError('Server connection failed.');
    }
  };

  const toggleStatus = async (userId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.admin.toggleUserStatus(userId, token);
      if (res.success) {
        fetchUsersList(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to toggle status:', err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;

    try {
      const res = await api.admin.deleteUser(userId, token);
      if (res.success) {
        fetchUsersList(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete user:', err.message);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
    setEditRole(u.role || 'student');
    setEditWallet(u.wallet || 0);
    setEditStatus(u.status || 'Active');
    setEditHostel(u.hostel || '');
    setEditRoom(u.room || '');
    setEditPhone(u.phone || '');
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      alert('Name and Email are required.');
      return;
    }
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.admin.updateUser(editingUser._id, {
        name: editName,
        email: editEmail,
        role: editRole,
        wallet: editWallet,
        status: editStatus,
        hostel: editHostel,
        room: editRoom,
        phone: editPhone
      }, token);

      if (res.success) {
        setSuccess('Profile updated successfully!');
        setEditingUser(null);
        fetchUsersList();
        fetchCouriersList();
      } else {
        alert(res.error || 'Failed to update profile.');
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  const mapRoleLabel = (roleStr) => {
    const map = {
      student: 'Student',
      canteen: 'Canteen Owner',
      delivery: 'Delivery Partner',
      admin: 'Platform Admin'
    };
    return map[roleStr] || roleStr;
  };

  const handleAddWalletMoney = async (userId, userName) => {
    const amountStr = window.prompt(`Enter amount to top up for ${userName} (₹):`);
    if (amountStr === null) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.admin.addWalletMoney(userId, amount, token);
      if (res.success) {
        alert(`Successfully added ₹${amount.toFixed(2)} to ${userName}'s wallet!`);
        fetchUsersList();
      } else {
        alert(res.error || "Failed to add wallet money.");
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-850 dark:text-white">User Administration</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review register logs, suspend/restore accounts, and manage role hierarchy in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Users / Couriers Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab selectors */}
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950/40 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-md'
                  : 'text-slate-450 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              User Accounts
            </button>
            <button
              onClick={() => setActiveTab('couriers')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'couriers'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-md'
                  : 'text-slate-455 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              Courier Leaderboard
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {activeTab === 'users' ? (
              users.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <ShieldAlert className="h-10 w-10 text-slate-350 mx-auto" />
                  <p className="text-slate-450 text-sm">No registered user accounts found in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-855/50 border-b border-slate-200/60 dark:border-slate-800">
                        <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Name / Email</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Wallet Balance</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-455 text-right uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-850 dark:text-slate-100 block">{u.name}</span>
                        <span className="text-xs text-slate-400 block">{u.email}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-purple-55 dark:bg-purple-950/20 text-purple-600' 
                            : u.role === 'canteen' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                              : u.role === 'delivery'
                                ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650'
                                : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600'
                        }`}>{mapRoleLabel(u.role)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                        ₹{u.wallet !== undefined ? u.wallet.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                          u.status === 'Active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                            : 'bg-red-50 dark:bg-red-950/20 text-red-650'
                        }`}>{u.status || 'Active'}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {u.role !== 'admin' && (
                          <>
                            <button 
                              onClick={() => openEditModal(u)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all"
                              title="Edit Profile"
                            >
                              <Edit2 className="h-4.5 w-4.5" />
                            </button>
                            <button 
                              onClick={() => handleAddWalletMoney(u._id, u.name)}
                              className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-955/20 rounded-xl transition-all"
                              title="Add Wallet Balance"
                            >
                              <PlusCircle className="h-4.5 w-4.5" />
                            </button>
                            <button 
                              onClick={() => toggleStatus(u._id)}
                              className={`p-2 rounded-xl transition-all ${
                                u.status === 'Suspended' 
                                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' 
                                  : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                              }`}
                              title={u.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                            >
                              {u.status === 'Suspended' ? <CheckCircle2 className="h-4.5 w-4.5" /> : <UserMinus className="h-4.5 w-4.5" />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Courier Leaderboard view */
          couriers.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShieldAlert className="h-10 w-10 text-slate-350 mx-auto" />
              <p className="text-slate-450 text-sm">No registered courier riders found in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-855/50 border-b border-slate-200/60 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Rank</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Courier Partner</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Average Rating</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Review Count</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {couriers.map((c, idx) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="px-6 py-4">
                        <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-xs">
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-855 dark:text-slate-100 block">{c.name}</span>
                        <span className="text-xs text-slate-400 block">{c.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-amber-500 flex items-center gap-1">
                          ⭐️ {(c.riderRating || 5.0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-350">{c.riderRatingCount || 0} reviews</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                          c.status === 'Active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                            : 'bg-red-50 dark:bg-red-955/20 text-red-650'
                        }`}>{c.status || 'Active'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
          </div>
        </div>

        {/* Add User form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Register User Account</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            {error && (
              <div className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 border border-red-200 dark:border-red-900/40 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 border border-emerald-200 dark:border-emerald-900/40 rounded-lg">
                {success}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Richard Rider" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <UserIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Campus Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="richard@campus.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input pl-10" 
                  required 
                />
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Role Allocation</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="auth-input bg-white dark:bg-slate-850"
              >
                <option value="student">Student</option>
                <option value="canteen">Canteen Owner</option>
                <option value="delivery">Delivery Partner</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-650 hover:to-indigo-600 shadow-purple-500/10 text-xs font-bold py-2.5">
              <PlusCircle className="h-4.5 w-4.5" />
              <span>Create Account</span>
            </button>
          </form>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-lg">Edit Account: {editingUser.name}</h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="auth-input" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  className="auth-input" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Type</label>
                  <select 
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value)} 
                    className="auth-input cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="canteen">Canteen Owner</option>
                    <option value="delivery">Delivery Partner</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</label>
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)} 
                    className="auth-input cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Balance (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editWallet} 
                  onChange={(e) => setEditWallet(parseFloat(e.target.value) || 0)} 
                  className="auth-input" 
                  required 
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Delivery / Contact Details (Students/Riders)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hostel Block</label>
                    <input 
                      type="text" 
                      value={editHostel} 
                      onChange={(e) => setEditHostel(e.target.value)} 
                      placeholder="e.g. Block B" 
                      className="auth-input" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Room Number</label>
                    <input 
                      type="text" 
                      value={editRoom} 
                      onChange={(e) => setEditRoom(e.target.value)} 
                      placeholder="e.g. 402" 
                      className="auth-input" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                  <input 
                    type="text" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)} 
                    placeholder="e.g. 9876543210" 
                    className="auth-input" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="flex-1 btn-secondary text-xs py-2.5 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary text-xs py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-650 hover:to-amber-600 font-bold cursor-pointer shadow-orange-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
