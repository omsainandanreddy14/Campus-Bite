import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Store, PlusCircle, AlertTriangle, Edit2, Trash2, Plus, ToggleLeft, ToggleRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CanteensList = () => {
  const { foods, addFood, deleteFood, toggleFoodAvailability, updateFood, vouchers, createVoucher, updateVoucher, deleteVoucher } = useApp();
  const [canteenUsers, setCanteenUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Global Voucher modal state
  const [globalVoucherToDelete, setGlobalVoucherToDelete] = useState(null);
  const [selectedCanteensToRemove, setSelectedCanteensToRemove] = useState([]);

  // Modals state
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [selectedMenuCanteen, setSelectedMenuCanteen] = useState(null);

  // Edit Canteen Form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWallet, setEditWallet] = useState(0);
  const [editKitchenStatus, setEditKitchenStatus] = useState('Open');
  const [editStatus, setEditStatus] = useState('Active');
  const [editAnnouncement, setEditAnnouncement] = useState('');
  const [editSpecialDishId, setEditSpecialDishId] = useState('');
  const [editSpecialDishPrice, setEditSpecialDishPrice] = useState(0);
  const [editIsCustomMode, setEditIsCustomMode] = useState(false);
  const [editCustomDishName, setEditCustomDishName] = useState('');
  const [editCustomDishPrice, setEditCustomDishPrice] = useState(0);

  // Multi-specials list state
  const [editSpecialDishes, setEditSpecialDishes] = useState([]);

  // Edit Food Form state
  const [editingFood, setEditingFood] = useState(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishPrice, setEditDishPrice] = useState('');
  const [editDishCategory, setEditDishCategory] = useState('Snacks');
  const [editDishImg, setEditDishImg] = useState('');
  const [editDishIsVeg, setEditDishIsVeg] = useState(true);

  // Add Dish Form state
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Snacks');
  const [dishImg, setDishImg] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishError, setDishError] = useState('');
  const [dishSuccess, setDishSuccess] = useState('');

  const fetchCanteens = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.admin.usersList(token);
      if (res.success) {
        const canteensOnly = res.users.filter((u) => u.role === 'canteen');
        setCanteenUsers(canteensOnly);
      }
    } catch (err) {
      console.error('Error loading canteens:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanteens();
    const interval = setInterval(fetchCanteens, 3000);
    return () => clearInterval(interval);
  }, []);

  const getDishCount = (canteenName) => {
    return foods.filter((f) => f.canteen === canteenName).length;
  };

  const handleOpenEditCanteen = (cant) => {
    setSelectedCanteen(cant);
    setEditName(cant.name || '');
    setEditEmail(cant.email || '');
    setEditWallet(cant.wallet || 0);
    setEditKitchenStatus(cant.kitchenStatus || 'Open');
    setEditStatus(cant.status || 'Active');
    setEditAnnouncement(cant.announcement || '');
    setEditSpecialDishId(cant.specialDishId || '');
    setEditSpecialDishPrice(cant.specialDishPrice || 0);
    setEditIsCustomMode(!!cant.customSpecialDishName);
    setEditCustomDishName(cant.customSpecialDishName || '');
    setEditCustomDishPrice(cant.customSpecialDishPrice || 0);
    setEditSpecialDishes(cant.specialDishes || []);
  };

  const handleSaveCanteenEdit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.admin.updateUser(selectedCanteen._id, {
        name: editName,
        email: editEmail,
        wallet: editWallet,
        status: editStatus,
        announcement: editAnnouncement,
        specialDishes: editSpecialDishes
      }, token);

      if (res.success) {
        // Next, update kitchen status
        await api.auth.adminUpdateKitchenStatus(selectedCanteen._id, editKitchenStatus, token);

        setSelectedCanteen(null);
        fetchCanteens();
        alert('Canteen details saved successfully!');
      } else {
        alert(res.error || 'Failed to update canteen profile.');
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    setDishError('');
    setDishSuccess('');

    if (!dishName || !dishPrice) {
      setDishError('Please provide a name and price for the dish.');
      return;
    }

    try {
      const payload = {
        name: dishName,
        price: parseFloat(dishPrice),
        category: dishCategory,
        canteen: selectedMenuCanteen.name,
        img: dishImg.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        isVeg: dishIsVeg
      };

      const res = await addFood(payload);
      if (res.success) {
        setDishSuccess('New dish added successfully!');
        setDishName('');
        setDishPrice('');
        setDishImg('');
        setDishIsVeg(true);
      } else {
        setDishError(res.error || 'Failed to add dish.');
      }
    } catch (err) {
      setDishError('Failed to save food dish.');
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;
    try {
      const res = await deleteFood(id);
      if (!res.success) {
        alert(res.error || 'Failed to delete dish.');
      }
    } catch (err) {
      alert('Failed to connect to backend.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-855 dark:text-white">Registered Food Courts</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Stalls actively operating on the campus ordering network.</p>
        </div>
        <Link 
          to="/admin/users" 
          className="btn-primary py-2.5 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-650 hover:to-indigo-700 shadow-purple-500/10 shrink-0"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Register New Canteen</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : canteenUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <AlertTriangle className="h-10 w-10 text-slate-350 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-855 dark:text-white">No canteens registered yet</h3>
            <p className="text-slate-400 text-sm mt-1">To add a canteen stall, register a new "Canteen Owner" user account on the Users tab.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {canteenUsers.map((cant) => {
            const count = getDishCount(cant.name);
            const isSuspended = cant.status === 'Suspended';
            return (
              <div key={cant._id} className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                isSuspended 
                  ? 'border-red-200/70 dark:border-red-955/40 opacity-70' 
                  : 'border-slate-200/60 dark:border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSuspended
                        ? 'bg-red-50 text-red-500 dark:bg-red-955/20'
                        : 'bg-purple-50 text-purple-650 dark:bg-purple-950/20'
                    }`}>
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-855 dark:text-white truncate max-w-[150px]">{cant.name}</h3>
                      <span className="text-[10px] text-slate-400 block truncate">{cant.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <span className="text-slate-400 font-semibold">Active Menu: <span className="font-bold text-slate-700 dark:text-slate-350">{count} items</span></span>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 font-bold rounded-lg border ${
                        isSuspended 
                          ? 'bg-red-50 dark:bg-red-955/20 text-red-655 border-red-200/40 dark:border-red-900/35' 
                          : 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 border-emerald-250/40 dark:border-emerald-900/35'
                      }`}>
                        {isSuspended ? 'Suspended' : 'Active'}
                      </span>
                      <span className={`px-2 py-0.5 font-bold rounded-lg border ${
                        cant.kitchenStatus === 'Closed' 
                          ? 'bg-red-50 dark:bg-red-955/20 text-red-655 border-red-200/40 dark:border-red-900/35' 
                          : 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 border-emerald-250/40 dark:border-emerald-900/35'
                      }`}>
                        {cant.kitchenStatus === 'Closed' ? 'Closed' : 'Open'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-3.5 flex flex-wrap gap-2 justify-between items-center">
                    <button 
                      onClick={() => setSelectedMenuCanteen(cant)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-850 cursor-pointer transition-all"
                    >
                      Manage Menu
                    </button>
                    <button 
                      onClick={() => handleOpenEditCanteen(cant)}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 cursor-pointer hover:bg-indigo-100 transition-all flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Stall</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vouchers Console Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 mt-8">
        <div>
          <h2 className="text-xl font-bold text-slate-855 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>Discount Vouchers Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure global platform-wide promo codes or issue discounts targeting specific canteens.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of active vouchers */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Vouchers ({vouchers.length})</span>
            {vouchers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-805 rounded-2xl">
                <p className="text-xs text-slate-450 italic font-semibold">No active vouchers published on the platform yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3">Min. Cart</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Scope / Target</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {vouchers.map((coupon) => (
                      <tr key={coupon._id || coupon.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-all">
                        <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{coupon.code}</td>
                        <td className="py-3.5 font-semibold text-indigo-650 dark:text-indigo-400">{coupon.discount}% OFF</td>
                        <td className="py-3.5 text-slate-550 dark:text-slate-400">₹{coupon.minCartValue || 0}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-955/30 text-indigo-600 border border-indigo-200/40 dark:border-indigo-900/30">
                            {coupon.category || 'All Items'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                            coupon.canteen 
                              ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-605 border-amber-250/20' 
                              : 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 border-emerald-255/20'
                          }`}>
                            {coupon.canteen ? coupon.canteen : 'Global Platform'}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-450 dark:text-slate-400 truncate max-w-[150px]" title={coupon.description}>{coupon.description || '-'}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={async () => {
                              if (!coupon.canteen) {
                                // Global voucher! Show modal with list of canteens
                                setGlobalVoucherToDelete(coupon);
                                setSelectedCanteensToRemove([]);
                              } else {
                                if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
                                const res = await deleteVoucher(coupon._id || coupon.id);
                                if (res.success) {
                                  alert('Voucher deleted successfully!');
                                } else {
                                  alert(res.error || 'Failed to delete voucher.');
                                }
                              }
                            }}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-555 rounded-lg transition-all cursor-pointer border-0 bg-transparent inline-flex items-center justify-center"
                            title="Delete Voucher"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Creation Form */}
          <div className="bg-slate-50 dark:bg-slate-955/20 p-5 border border-slate-150/40 dark:border-slate-850/60 rounded-3xl h-fit space-y-4">
            <div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-250 uppercase tracking-wider">Create New Voucher</h3>
              <p className="text-[10px] text-slate-400">Create new promo coupon parameters.</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const code = e.target.vCode.value.trim().toUpperCase();
              const discount = parseFloat(e.target.vDiscount.value);
              const minVal = parseFloat(e.target.vMinVal.value) || 0;
              const canteen = e.target.vCanteen.value;
              const category = e.target.vCategory.value;
              const desc = e.target.vDesc.value.trim();

              if (!code || isNaN(discount) || discount <= 0) {
                alert('Please enter a valid code and discount percentage.');
                return;
              }

              const res = await createVoucher({ code, discount, minCartValue: minVal, canteen, category, description: desc });
              if (res.success) {
                e.target.reset();
                alert(`Voucher coupon "${code}" created successfully for ${category === 'All' ? 'All Food Items' : category + ' dishes'}!`);
              } else {
                alert(res.error || 'Failed to create voucher.');
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">PROMO CODE</label>
                <input
                  type="text"
                  name="vCode"
                  placeholder="e.g. PIZZA20, BURGER15"
                  className="auth-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-455 block">DISCOUNT (%)</label>
                  <input
                    type="number"
                    name="vDiscount"
                    placeholder="e.g. 20"
                    className="auth-input text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 block">MIN. CART (₹)</label>
                  <input
                    type="number"
                    name="vMinVal"
                    placeholder="e.g. 100"
                    className="auth-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">FOOD CATEGORY SCOPE</label>
                <select
                  name="vCategory"
                  className="auth-input text-xs cursor-pointer"
                >
                  <option value="All">All Categories (All Food)</option>
                  <option value="Pizza">Pizzas 🍕</option>
                  <option value="Burgers">Burgers 🍔</option>
                  <option value="Biryani">Biryani 🍲</option>
                  <option value="Snacks">Snacks 🥪</option>
                  <option value="Rolls">Rolls 🌯</option>
                  <option value="Noodles">Noodles 🍜</option>
                  <option value="Beverages">Beverages 🥤</option>
                  <option value="Desserts">Desserts 🍦</option>
                  <option value="South Indian">South Indian 🍛</option>
                  <option value="North Indian">North Indian 🥘</option>
                  <option value="Chinese">Chinese 🥢</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">TARGET SCOPE / CANTEEN</label>
                <select
                  name="vCanteen"
                  className="auth-input text-xs cursor-pointer"
                >
                  <option value="">Global (All Stalls)</option>
                  {canteenUsers.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 block">COUPON TERMS / INFO</label>
                <input
                  type="text"
                  name="vDesc"
                  placeholder="e.g. Get 20% off on snack dishes!"
                  className="auth-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-650 hover:to-indigo-600 text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer shadow shadow-indigo-500/10 border-0 flex justify-center items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create Voucher</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Canteen Modal */}
      {selectedCanteen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-850 dark:text-white text-lg">Edit Canteen: {selectedCanteen.name}</h3>
              <button 
                onClick={() => setSelectedCanteen(null)} 
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCanteenEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Canteen Stall Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="auth-input" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Owner Email Address</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kitchen Status</label>
                  <select 
                    value={editKitchenStatus} 
                    onChange={(e) => setEditKitchenStatus(e.target.value)} 
                    className="auth-input cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stall Status</label>
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
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Canteen Daily Specials Publisher</span>
                </span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Announcement Banner Text</label>
                  <input 
                    type="text" 
                    value={editAnnouncement} 
                    onChange={(e) => setEditAnnouncement(e.target.value)} 
                    placeholder="e.g. Try our Daily Special Double Paneer Sandwich today!" 
                    className="auth-input" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Active Today's Specials ({editSpecialDishes.length})</label>
                  {editSpecialDishes.length === 0 ? (
                    <p className="text-[10px] text-slate-450 italic">No specials published for today yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {editSpecialDishes.map((spec, sIdx) => {
                        const foodItem = foods.find(f => f._id === spec.dishId || f.id === spec.dishId);
                        const specName = spec.customName || foodItem?.name || 'Unknown Special';
                        const specPrice = spec.customPrice || spec.dishPrice;
                        return (
                          <div key={sIdx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
                            <div className="min-w-0 flex-1">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 block truncate">{specName}</span>
                              <span className="text-[9px] text-slate-400 block">Price: ₹{specPrice} • {spec.customName ? 'Custom Special' : 'Menu Special'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditSpecialDishes(prev => prev.filter((_, idx) => idx !== sIdx));
                              }}
                              className="text-slate-400 hover:text-red-500 text-sm font-bold ml-2 cursor-pointer bg-transparent border-0"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Today's Special</span>
                    <div className="flex gap-2 bg-slate-150 dark:bg-slate-900 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setEditIsCustomMode(false)}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                          !editIsCustomMode 
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Menu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditIsCustomMode(true)}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                          editIsCustomMode 
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {!editIsCustomMode ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase block">Select Dish</label>
                        <select 
                          value={editSpecialDishId} 
                          onChange={(e) => {
                            const dishId = e.target.value;
                            setEditSpecialDishId(dishId);
                            const foodItem = foods.find(f => f._id === dishId || f.id === dishId);
                            if (foodItem) {
                              setEditSpecialDishPrice(foodItem.price);
                            }
                          }} 
                          className="auth-input text-xs"
                        >
                          <option value="">-- Choose dish --</option>
                          {foods.filter(f => f.canteen === selectedCanteen.name).map(f => (
                            <option key={f._id || f.id} value={f._id || f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase block">Promo Price (₹)</label>
                        <input 
                          type="number" 
                          value={editSpecialDishPrice} 
                          onChange={(e) => setEditSpecialDishPrice(parseFloat(e.target.value) || 0)} 
                          className="auth-input text-xs" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-455 uppercase block">Custom Special Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Custard Bowl"
                          value={editCustomDishName}
                          onChange={(e) => setEditCustomDishName(e.target.value)}
                          className="auth-input text-xs" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-455 uppercase block">Promo Price (₹)</label>
                        <input 
                          type="number" 
                          value={editCustomDishPrice} 
                          onChange={(e) => setEditCustomDishPrice(parseFloat(e.target.value) || 0)} 
                          className="auth-input text-xs" 
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!editIsCustomMode) {
                        if (!editSpecialDishId) {
                          alert('Please select a menu dish.');
                          return;
                        }
                        const foodItem = foods.find(f => f._id === editSpecialDishId || f.id === editSpecialDishId);
                        if (!foodItem) return;

                        if (editSpecialDishes.some(d => d.dishId === editSpecialDishId)) {
                          alert('This dish is already in the specials list!');
                          return;
                        }

                        const newSpec = {
                          dishId: editSpecialDishId,
                          dishPrice: parseFloat(editSpecialDishPrice) || foodItem.price,
                          customName: '',
                          customPrice: 0
                        };
                        setEditSpecialDishes(prev => [...prev, newSpec]);
                        setEditSpecialDishId('');
                        setEditSpecialDishPrice(0);
                      } else {
                        if (!editCustomDishName.trim()) {
                          alert('Please enter a custom special name.');
                          return;
                        }
                        const price = parseFloat(editCustomDishPrice);
                        if (isNaN(price) || price <= 0) {
                          alert('Please enter a valid price.');
                          return;
                        }

                        const newSpec = {
                          dishId: '',
                          dishPrice: 0,
                          customName: editCustomDishName.trim(),
                          customPrice: price
                        };
                        setEditSpecialDishes(prev => [...prev, newSpec]);
                        setEditCustomDishName('');
                        setEditCustomDishPrice(0);
                      }
                    }}
                    className="w-full py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-955/20 text-orange-605 text-[10px] font-bold rounded-xl border border-orange-200/10 transition-all cursor-pointer flex justify-center items-center gap-1"
                  >
                    <span>➕ Add to Specials List</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedCanteen(null)} 
                  className="flex-1 btn-secondary text-xs py-2.5 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary text-xs py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-650 hover:to-amber-600 font-bold cursor-pointer shadow-orange-500/10"
                >
                  Save Stall Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Menu / Add Food Dishes Modal */}
      {selectedMenuCanteen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6">
            
            {/* Left Box: Active Menu List & Control */}
            <div className="flex-1 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div>
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-lg">Active Menu: {selectedMenuCanteen.name}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">{foods.filter(f => f.canteen === selectedMenuCanteen.name).length} items listed</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedMenuCanteen(null);
                    setDishError('');
                    setDishSuccess('');
                  }}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 font-bold text-sm block md:hidden cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {foods.filter(f => f.canteen === selectedMenuCanteen.name).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Store className="h-8 w-8 mx-auto text-slate-300" />
                    <p className="text-xs">No food dishes are currently listed for this canteen.</p>
                  </div>
                ) : (
                  foods.filter(f => f.canteen === selectedMenuCanteen.name).map((food) => (
                    <div key={food._id || food.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={food.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                          alt={food.name} 
                          className="h-11 w-11 object-cover rounded-xl border border-slate-200/50"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{food.name}</span>
                            <span className={`h-2 w-2 rounded-full ${food.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} title={food.isVeg ? 'Veg' : 'Non-Veg'}></span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{food.category} • ₹{food.price.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleFoodAvailability(food._id || food.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all"
                          title={food.available ? 'Mark Unavailable' : 'Mark Available'}
                        >
                          {food.available ? <ToggleRight className="h-5 w-5 text-indigo-500" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button 
                          onClick={() => {
                            setEditingFood(food);
                            setEditDishName(food.name || '');
                            setEditDishPrice(food.price.toString() || '');
                            setEditDishCategory(food.category || 'Snacks');
                            setEditDishImg(food.img || '');
                            setEditDishIsVeg(food.isVeg !== undefined ? food.isVeg : true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition-all"
                          title="Edit Dish"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDish(food._id || food.id)}
                          className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Box: Add Dish Form */}
            <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 h-fit space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-250 uppercase tracking-wider">Add Food Dish</h3>
                  <p className="text-[10px] text-slate-400">Insert new menu item directly.</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedMenuCanteen(null);
                    setDishError('');
                    setDishSuccess('');
                  }}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 font-bold text-sm hidden md:block cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDish} className="space-y-3.5">
                {dishSuccess && (
                  <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 border border-emerald-250/50 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{dishSuccess}</span>
                  </div>
                )}
                {dishError && (
                  <div className="text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-955/20 p-2.5 border border-red-200 dark:border-red-900/40 rounded-xl">
                    {dishError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase block">Dish Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cheese Fries" 
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="auth-input text-xs" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase block">Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 120" 
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="auth-input text-xs" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-455 uppercase block">Category</label>
                  <select 
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="auth-input text-xs cursor-pointer"
                  >
                    <option value="Biryani">Biryani</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Noodles">Noodles</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase block">Image URL (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Unsplash / web image URL" 
                    value={dishImg}
                    onChange={(e) => setDishImg(e.target.value)}
                    className="auth-input text-xs" 
                  />
                </div>

                <div className="flex items-center gap-2 pt-1.5">
                  <input 
                    type="checkbox" 
                    id="vegCheckbox" 
                    checked={dishIsVeg}
                    onChange={(e) => setDishIsVeg(e.target.checked)}
                    className="text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="vegCheckbox" className="text-xs text-slate-655 dark:text-slate-350 font-semibold cursor-pointer">
                    Pure Vegetarian Item
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-650 hover:to-indigo-600 text-xs py-2 shadow-purple-500/10 cursor-pointer font-bold mt-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Dish to Stall</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Food Dish Modal */}
      {editingFood && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-855 dark:text-white text-base">Edit Menu Item</h3>
              <button 
                onClick={() => setEditingFood(null)} 
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!editDishName || !editDishPrice) {
                alert('Please enter both name and price.');
                return;
              }
              const res = await updateFood(editingFood._id || editingFood.id, {
                name: editDishName,
                price: parseFloat(editDishPrice),
                category: editDishCategory,
                img: editDishImg || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
                isVeg: editDishIsVeg
              });
              if (res.success) {
                setEditingFood(null);
                alert('Food dish updated successfully!');
              } else {
                alert(res.error || 'Failed to update food dish.');
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dish Name</label>
                <input 
                  type="text" 
                  value={editDishName} 
                  onChange={(e) => setEditDishName(e.target.value)} 
                  className="auth-input text-xs" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editDishPrice} 
                    onChange={(e) => setEditDishPrice(e.target.value)} 
                    className="auth-input text-xs" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select 
                    value={editDishCategory} 
                    onChange={(e) => setEditDishCategory(e.target.value)} 
                    className="auth-input text-xs cursor-pointer"
                  >
                    {['Burgers', 'Pizza', 'Biryani', 'Drinks', 'Desserts', 'Snacks', 'Noodles', 'Rolls', 'Beverages'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Image URL</label>
                <input 
                  type="text" 
                  value={editDishImg} 
                  onChange={(e) => setEditDishImg(e.target.value)} 
                  placeholder="https://example.com/food.jpg"
                  className="auth-input text-xs" 
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="editDishIsVeg" 
                  checked={editDishIsVeg} 
                  onChange={(e) => setEditDishIsVeg(e.target.checked)} 
                  className="rounded border-slate-300 dark:border-slate-800 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="editDishIsVeg" className="text-xs font-bold text-slate-655 dark:text-slate-350 cursor-pointer">Vegetarian Food Item</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingFood(null)} 
                  className="flex-1 btn-secondary text-xs py-2.5 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary text-xs py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-655 hover:to-amber-600 font-bold cursor-pointer shadow-md shadow-orange-500/10"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Manage Global Voucher Modal */}
      {globalVoucherToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-lg">
                  Delete Global Voucher: <span className="text-indigo-600 dark:text-indigo-400">{globalVoucherToDelete.code}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Select from which canteen you want to delete this global voucher, or delete it permanently from the entire platform.</p>
              </div>
              <button 
                onClick={() => setGlobalVoucherToDelete(null)} 
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Select Canteens to Remove Voucher From ({canteenUsers.length} canteens available):
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {canteenUsers.map((cant) => {
                  const isExcluded = (globalVoucherToDelete.excludedCanteens || []).includes(cant.name);
                  const isChecked = selectedCanteensToRemove.includes(cant.name);

                  return (
                    <div 
                      key={cant._id} 
                      onClick={() => {
                        if (isExcluded) return;
                        if (isChecked) {
                          setSelectedCanteensToRemove(prev => prev.filter(c => c !== cant.name));
                        } else {
                          setSelectedCanteensToRemove(prev => [...prev, cant.name]);
                        }
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        isExcluded 
                          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/50 opacity-60 cursor-not-allowed'
                          : isChecked 
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox"
                          checked={isExcluded || isChecked}
                          disabled={isExcluded}
                          onChange={() => {}} 
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">{cant.name}</span>
                          <span className="text-[10px] text-slate-400 block">{cant.email}</span>
                        </div>
                      </div>

                      {isExcluded && (
                        <span className="text-[9px] font-extrabold bg-red-100 dark:bg-red-950 text-red-600 px-2 py-0.5 rounded-md">
                          Already Removed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                disabled={selectedCanteensToRemove.length === 0}
                onClick={async () => {
                  const existingExcluded = globalVoucherToDelete.excludedCanteens || [];
                  const updatedExcluded = Array.from(new Set([...existingExcluded, ...selectedCanteensToRemove]));
                  
                  const res = await updateVoucher(globalVoucherToDelete._id || globalVoucherToDelete.id, {
                    excludedCanteens: updatedExcluded
                  });

                  if (res.success) {
                    alert(`Global voucher "${globalVoucherToDelete.code}" deleted/removed from selected canteen(s)!`);
                    setGlobalVoucherToDelete(null);
                  } else {
                    alert(res.error || 'Failed to update voucher.');
                  }
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-sm border-0 cursor-pointer flex justify-center items-center gap-1.5"
              >
                <span>Delete from Selected Canteens ({selectedCanteensToRemove.length})</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`Are you sure you want to permanently delete "${globalVoucherToDelete.code}" from the entire platform?`)) return;
                  const res = await deleteVoucher(globalVoucherToDelete._id || globalVoucherToDelete.id);
                  if (res.success) {
                    alert(`Global voucher "${globalVoucherToDelete.code}" deleted permanently from all canteens!`);
                    setGlobalVoucherToDelete(null);
                  } else {
                    alert(res.error || 'Failed to delete voucher.');
                  }
                }}
                className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200/50 dark:border-red-900/30 transition-all cursor-pointer"
              >
                Delete from Entire Platform (All Canteens)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteensList;
