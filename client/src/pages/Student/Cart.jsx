import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, MapPin, Phone } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, checkout, vouchers } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if student has set delivery address coordinates in profile
  const hasProfileAddress = !!(user?.hostel && user?.room && user?.phone);

  const [useSavedAddress, setUseSavedAddress] = useState(hasProfileAddress);
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [room, setRoom] = useState(user?.room || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [error, setError] = useState('');
  const [courierTip, setCourierTip] = useState(0);

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Group cart items by canteen
  const groupedCart = {};
  cart.forEach(item => {
    const cant = item.canteen || 'Campus Canteen';
    if (!groupedCart[cant]) groupedCart[cant] = [];
    groupedCart[cant].push(item);
  });

  const canteenCount = Object.keys(groupedCart).length;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = cart.length > 0 ? (canteenCount * 10.00) : 0.00;
  const deliveryFee = cart.length > 0 ? (canteenCount * 30.00) : 0.00;
  
  // Dynamic voucher discount calculation
  let discountVal = 0;
  if (appliedPromo) {
    const coupon = vouchers.find(v => v.code === appliedPromo.toUpperCase() && v.isActive);
    if (coupon) {
      // 1. Filter cart items by canteen scope
      let eligibleItems = cart;
      if (coupon.canteen) {
        eligibleItems = eligibleItems.filter(item => item.canteen === coupon.canteen);
      } else if (coupon.excludedCanteens && coupon.excludedCanteens.length > 0) {
        eligibleItems = eligibleItems.filter(item => !coupon.excludedCanteens.includes(item.canteen || 'Campus Canteen'));
      }

      // 2. Filter eligible items by category scope (All vs Pizza, Burgers, Biryani, etc.)
      if (coupon.category && coupon.category !== 'All') {
        const targetCat = coupon.category.toLowerCase();
        eligibleItems = eligibleItems.filter(item => {
          const itemCat = (item.category || '').toLowerCase();
          const itemName = (item.name || '').toLowerCase();
          return itemCat.includes(targetCat) || targetCat.includes(itemCat) || itemName.includes(targetCat);
        });
      }

      const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      discountVal = parseFloat((eligibleSubtotal * (coupon.discount / 100)).toFixed(2));
    }
  }
  const total = parseFloat((subtotal - discountVal + platformFee + deliveryFee + courierTip).toFixed(2));

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!hostel || !room || !phone) {
      setError('Please provide your hostel block/building, room number, and contact phone.');
      return;
    }
    setError('');
    
    const address = `Hostel ${hostel}, Room ${room}`;
    try {
      const res = await checkout(user.name, address, phone, cookingInstructions, appliedPromo, courierTip);
      if (res.success) {
        sessionStorage.removeItem('confetti_played'); // Clean up any keys
        navigate('/student/orders');
      } else {
        setError(res.error || 'Failed to place order.');
      }
    } catch (err) {
      setError('Failed to place order.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Your Cart</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review your selections and proceed to checkout.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-12 max-w-2xl text-center space-y-6 mx-auto shadow-sm">
          <div className="h-16 w-16 bg-orange-100 dark:bg-orange-955/40 text-orange-605 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-855 dark:text-white">Your cart is empty</h3>
            <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto text-sm">Add delicious meals from the campus canteen menu to place an order.</p>
          </div>
          <Link to="/student/dashboard" className="btn-primary mx-auto max-w-[200px]">
            <span>Explore Menu</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-855 dark:text-white">Your Checkout Cart</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete your delivery details to place the order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedCart).map(([canteenName, items]) => (
            <div key={canteenName} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-extrabold text-sm text-orange-500 uppercase tracking-wider">{canteenName} Stand</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-550 px-2.5 py-0.5 rounded-lg font-bold">
                  {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-955 rounded-xl overflow-hidden shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-855 dark:text-white truncate">{item.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">{item.canteen}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-805 rounded-lg p-1">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-555"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-555"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-slate-855 dark:text-white w-14 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-450 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Forms & Totals */}
        <div className="space-y-6">
          {/* Coupon Input Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-805 dark:text-white text-sm">Have a Promo Code?</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code (e.g. SNACK50)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="flex-1 auth-input py-2 px-3 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  setPromoError('');
                  setPromoSuccess('');
                  if (!promoInput.trim()) {
                    setPromoError('Please enter a coupon code.');
                    return;
                  }
                  
                  const cleanCode = promoInput.trim().toUpperCase();
                  
                  // Check active vouchers
                  const coupon = vouchers.find(v => v.code === cleanCode && v.isActive);
                  
                  if (!coupon) {
                    setPromoError('Invalid or expired promo code.');
                    setAppliedPromo('');
                    return;
                  }

                  // Check canteen constraint
                  if (coupon.canteen) {
                    const cartHasCanteenItems = cart.some(item => item.canteen === coupon.canteen);
                    if (!cartHasCanteenItems) {
                      setPromoError(`This coupon is only valid for items from ${coupon.canteen}.`);
                      setAppliedPromo('');
                      return;
                    }
                  }

                  // Check excluded canteens constraint
                  if (coupon.excludedCanteens && coupon.excludedCanteens.length > 0) {
                    const allCartCanteensExcluded = cart.every(item => coupon.excludedCanteens.includes(item.canteen || 'Campus Canteen'));
                    if (allCartCanteensExcluded) {
                      setPromoError(`This coupon is not valid for items from your selected canteen(s).`);
                      setAppliedPromo('');
                      return;
                    }
                  }

                  // Check category constraint (All vs Pizza, Burgers, Biryani, etc.)
                  if (coupon.category && coupon.category !== 'All') {
                    const targetCat = coupon.category.toLowerCase();
                    const cartHasCategoryItems = cart.some(item => {
                      const itemCat = (item.category || '').toLowerCase();
                      const itemName = (item.name || '').toLowerCase();
                      return itemCat.includes(targetCat) || targetCat.includes(itemCat) || itemName.includes(targetCat);
                    });

                    if (!cartHasCategoryItems) {
                      setPromoError(`Coupon "${cleanCode}" is only valid for ${coupon.category} items! Add ${coupon.category} to your cart to use this code.`);
                      setAppliedPromo('');
                      return;
                    }
                  }

                  // Check minimum cart value constraint
                  if (subtotal < coupon.minCartValue) {
                    setPromoError(`Minimum order amount of ₹${coupon.minCartValue} required to apply this coupon.`);
                    setAppliedPromo('');
                    return;
                  }

                  setAppliedPromo(cleanCode);
                  setPromoSuccess(`Coupon "${cleanCode}" applied successfully! You got ${coupon.discount}% off!`);
                }}
                className="btn-primary py-2 px-4 text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-101 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-[10px] font-bold text-red-500">{promoError}</p>}
            {promoSuccess && <p className="text-[10px] font-bold text-emerald-600">{promoSuccess}</p>}
            {appliedPromo && (
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-2.5 rounded-xl text-xs">
                <span className="font-bold text-emerald-600">Applied: {appliedPromo}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo('');
                    setPromoInput('');
                    setPromoSuccess('');
                    setPromoError('');
                  }}
                  className="text-slate-400 hover:text-red-500 font-bold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-slate-855 dark:text-white">Order Invoice</h3>
            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Promo Discount ({appliedPromo})</span>
                  <span>-₹{discountVal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Platform Fee ({canteenCount} {canteenCount === 1 ? 'order' : 'orders'})</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee ({canteenCount} {canteenCount === 1 ? 'pickup' : 'pickups'})</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">₹{deliveryFee.toFixed(2)}</span>
              </div>
              {courierTip > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Courier Tip</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">₹{courierTip.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-100 dark:border-slate-850 my-2 pt-2 flex justify-between font-extrabold text-base text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Support Courier Tip Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Add a Tip for your Courier Partner?</h3>
              <p className="text-[10px] text-slate-400">100% of this tip goes directly to the courier partner as appreciation.</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 20, 50].map((tipAmt) => (
                <button
                  key={tipAmt}
                  type="button"
                  onClick={() => setCourierTip(tipAmt)}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    courierTip === tipAmt 
                      ? 'border-orange-500 bg-orange-50/20 text-orange-600 dark:bg-orange-950/10 dark:text-orange-400 ring-2 ring-orange-500/20' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {tipAmt === 0 ? 'No Tip' : `₹${tipAmt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Details Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Delivery Coordinates</h3>
            <form onSubmit={handleCheckout} className="space-y-4">
              {error && (
                <div className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-955/20 p-2.5 border border-red-200 dark:border-red-900/40 rounded-lg">
                  {error}
                </div>
              )}

              {!hasProfileAddress && (
                <div className="text-[11px] bg-slate-50 dark:bg-slate-955/20 p-3 rounded-xl text-slate-450 dark:text-slate-500 leading-relaxed mb-2 border border-slate-100 dark:border-slate-850">
                  💡 Tip: You can set a permanent delivery destination in your <Link to="/student/profile" className="text-orange-500 font-bold hover:underline">Profile</Link> to checkout even faster!
                </div>
              )}

              {hasProfileAddress && (
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block text-slate-500">Deliver to:</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="addressMode"
                        checked={useSavedAddress}
                        onChange={() => {
                          setUseSavedAddress(true);
                          setHostel(user.hostel);
                          setRoom(user.room);
                          setPhone(user.phone);
                        }}
                        className="text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                      <span>Profile Address ({user.hostel}, Room {user.room})</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="addressMode"
                        checked={!useSavedAddress}
                        onChange={() => {
                          setUseSavedAddress(false);
                          setHostel('');
                          setRoom('');
                          setPhone(user?.phone || '');
                        }}
                        className="text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                      <span>Other Location</span>
                    </label>
                  </div>
                </div>
              )}
              
              {!useSavedAddress && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hostel Block / Building</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. Block B or PG Hostel" 
                        value={hostel}
                        onChange={(e) => setHostel(e.target.value)}
                        className="auth-input pl-10" 
                        required 
                      />
                      <MapPin className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Room Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 402-B" 
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="auth-input" 
                      required 
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contact Phone</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="e.g. 9876543210" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input pl-10" 
                    required 
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cooking Instructions / Taste Preferences (Optional)</label>
                <textarea 
                  placeholder="e.g., Make it extra spicy, no onions, medium spicy etc..." 
                  value={cookingInstructions}
                  onChange={(e) => setCookingInstructions(e.target.value)}
                  className="auth-input min-h-[80px] py-2.5 px-4 resize-none rounded-xl text-xs" 
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-primary w-full mt-2">
                <span>Place Order</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
