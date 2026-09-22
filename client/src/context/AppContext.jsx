import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [canteenStatuses, setCanteenStatuses] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = sessionStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const prevMessagesCountRef = useRef({});
  const prevPickupOrdersCountRef = useRef(null);

  const playMessageChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio blocked or not supported
    }
  };

  const playPickupDispatchChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // Audio blocked or not supported
    }
  };

  // Sync cart to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch foods (Public endpoint)
  const fetchFoods = async () => {
    try {
      const res = await api.foods.list();
      if (res.success) {
        setFoods(res.foods);
      }
    } catch (err) {
      console.error('Error fetching foods from MongoDB backend:', err.message);
    }
  };

  // Fetch canteen statuses (Public endpoint)
  const fetchCanteenStatuses = async () => {
    try {
      const res = await api.auth.canteensList();
      if (res.success) {
        setCanteenStatuses(res.canteens);
        
        // Dynamic Check: If any canteen is closed, remove its items from student cart in real-time
        setCart((prevCart) => {
          if (prevCart.length === 0) return prevCart;
          const filtered = prevCart.filter((item) => {
            const canteen = res.canteens.find((c) => c.name && item.canteen && c.name.toLowerCase() === item.canteen.toLowerCase());
            const isClosed = canteen ? (canteen.status === 'Suspended' || canteen.kitchenStatus === 'Closed') : false;
            return !isClosed;
          });
          
          if (filtered.length !== prevCart.length) {
            sessionStorage.setItem('cart', JSON.stringify(filtered));
          }
          return filtered;
        });
      }
    } catch (err) {
      console.error('Error fetching canteen statuses:', err.message);
    }
  };

  // Fetch vouchers list
  const fetchVouchers = async () => {
    try {
      const res = await api.vouchers.list();
      if (res.success) {
        setVouchers(res.vouchers);
      }
    } catch (err) {
      console.error('Error fetching vouchers:', err.message);
    }
  };

  const createVoucher = async (voucherData) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.vouchers.create(voucherData, token);
      if (res.success) {
        await fetchVouchers();
        return { success: true, voucher: res.voucher };
      }
      return { success: false, error: res.error || 'Failed to create voucher' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const deleteVoucher = async (voucherId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.vouchers.delete(voucherId, token);
      if (res.success) {
        await fetchVouchers();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete voucher' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const updateVoucher = async (voucherId, data) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };
    try {
      const res = await api.vouchers.update(voucherId, data, token);
      if (res.success) {
        await fetchVouchers();
        return { success: true, voucher: res.voucher };
      }
      return { success: false, error: res.error || 'Failed to update voucher' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  // Fetch orders (Private endpoint, requires token)
  const fetchOrders = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.orders.list(token);
      if (res.success) {
        // Play message sound chime on count increase
        let shouldChime = false;
        res.orders.forEach(order => {
          const currentCount = order.messages ? order.messages.length : 0;
          const prevCount = prevMessagesCountRef.current[order._id || order.id];
          if (prevCount !== undefined && currentCount > prevCount) {
            shouldChime = true;
          }
          prevMessagesCountRef.current[order._id || order.id] = currentCount;
        });

        if (shouldChime) {
          playMessageChime();
        }

        // Trigger dispatch audio chime for delivery partners when a new package is ready for pickup
        const currentPickupOrders = res.orders.filter(o => o.status === 'Ready for Pickup');
        const currentPickupCount = currentPickupOrders.length;

        if (user?.role === 'delivery') {
          if (prevPickupOrdersCountRef.current !== null && currentPickupCount > prevPickupOrdersCountRef.current) {
            playPickupDispatchChime();
          }
        }
        prevPickupOrdersCountRef.current = currentPickupCount;

        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Error fetching orders from MongoDB backend:', err.message);
    }
  };

  // Fetch data on startup, when user auth state changes, and poll every 3 seconds for updates
  useEffect(() => {
    fetchFoods();
    fetchCanteenStatuses();
    fetchVouchers();
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }

    const interval = setInterval(() => {
      fetchFoods();
      fetchCanteenStatuses();
      fetchVouchers();
      if (sessionStorage.getItem('token')) {
        fetchOrders();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // Cart operations
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Handle Mongoose ObjectID vs mock numeric IDs
      const existing = prevCart.find((ci) => ci._id === item._id || ci.id === item.id);
      if (existing) {
        return prevCart.map((ci) => 
          (ci._id === item._id || ci.id === item.id) ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      // Store item ID uniformly for the order schema
      return [...prevCart, { ...item, id: item._id || item.id, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((ci) => ci._id !== itemId && ci.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) => 
      prevCart.map((ci) => (ci._id === itemId || ci.id === itemId) ? { ...ci, quantity } : ci)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout (Write Order to MongoDB)
  const checkout = async (customerName, address, phone, cookingInstructions = '', promoCode = '', courierTip = 0) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    // Group items by canteen
    const canteenGroups = {};
    cart.forEach(item => {
      const canteen = item.canteen || 'Campus Canteen';
      if (!canteenGroups[canteen]) {
        canteenGroups[canteen] = [];
      }
      canteenGroups[canteen].push(item);
    });

    const canteens = Object.keys(canteenGroups);
    const placedOrders = [];

    // Split courier tip equally among split invoices
    const tipPerOrder = canteens.length > 0 ? parseFloat((courierTip / canteens.length).toFixed(2)) : 0;

    try {
      for (const canteenName of canteens) {
        const items = canteenGroups[canteenName];
        const subtotalVal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const platformFee = 10.00;
        const deliveryFee = 30.00;
        
        let discount = 0;
        if (promoCode.trim().toUpperCase() === 'CAMPUSNEW') {
          discount = parseFloat((subtotalVal * 0.20).toFixed(2));
        }

        const totalVal = parseFloat((subtotalVal - discount + platformFee + deliveryFee + tipPerOrder).toFixed(2));

        const orderData = {
          customer: customerName,
          address,
          phone,
          items: items.map((item) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            canteen: item.canteen,
          })),
          subtotal: subtotalVal,
          total: totalVal,
          canteen: canteenName,
          cookingInstructions: cookingInstructions,
          courierTip: tipPerOrder
        };

        const res = await api.orders.create(orderData, token);
        if (res.success) {
          placedOrders.push(res.order);
        } else {
          return { success: false, error: res.error || `Failed to submit order for ${canteenName}` };
        }
      }

      clearCart();
      await fetchOrders(); // Sync state
      return { success: true, orders: placedOrders };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.orders.updateStatus(orderId, newStatus, token);
      if (res.success) {
        await fetchOrders(); // Sync state
        return { success: true, order: res.order };
      }
      return { success: false, error: res.error || 'Failed to update order status' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const payOrder = async (orderId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.orders.pay(orderId, token);
      if (res.success) {
        await fetchOrders(); // Sync state
        return { success: true, order: res.order };
      }
      return { success: false, error: res.error || 'Failed to complete payment' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const sendOrderMessage = async (orderId, text) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.orders.sendMessage(orderId, text, token);
      if (res.success) {
        await fetchOrders(); // Sync state
        return { success: true, messages: res.messages };
      }
      return { success: false, error: res.error || 'Failed to send message' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const submitFoodReview = async (foodId, rating, reviewText, orderId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.foods.submitReview(foodId, { rating, reviewText, orderId }, token);
      if (res.success) {
        await fetchFoods(); // Refresh food ratings
        await fetchOrders(); // Sync reviewed flag on order
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to submit review' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const submitRiderReview = async (orderId, rating) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.orders.rateRider(orderId, rating, token);
      if (res.success) {
        await fetchOrders(); // Sync reviewed flag on order
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to submit rider review' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const updateCanteenAnnouncement = async (announcement, specialDishId = '', specialDishPrice = 0, customSpecialDishName = '', customSpecialDishPrice = 0, specialDishes = []) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.auth.updateAnnouncement(announcement, specialDishId, specialDishPrice, customSpecialDishName, customSpecialDishPrice, specialDishes, token);
      if (res.success) {
        await fetchCanteenStatuses(); // Sync state
      }
      return res;
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const fetchCanteenReviews = async (canteenName) => {
    const token = sessionStorage.getItem('token');
    if (!token) return [];

    try {
      const res = await api.foods.getCanteenReviews(canteenName, token);
      if (res.success) {
        return res.reviews || [];
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  // Canteen operations
  const addFood = async (nameOrData, price, category, canteen, img, isVeg) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    let foodData;
    if (typeof nameOrData === 'object' && nameOrData !== null) {
      foodData = nameOrData;
    } else {
      foodData = {
        name: nameOrData,
        price: parseFloat(price),
        category,
        canteen,
        img,
        isVeg: isVeg !== undefined ? isVeg : true
      };
    }

    try {
      const res = await api.foods.create(foodData, token);
      if (res.success) {
        await fetchFoods(); // Sync state
        return { success: true, item: res.item };
      }
      return { success: false, error: res.error || 'Failed to add food item' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const deleteFood = async (foodId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.foods.delete(foodId, token);
      if (res.success) {
        await fetchFoods(); // Sync state
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete food item' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const toggleFoodAvailability = async (foodId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.foods.toggle(foodId, token);
      if (res.success) {
        await fetchFoods(); // Sync state
        return { success: true, item: res.item };
      }
      return { success: false, error: res.error || 'Failed to toggle availability' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const updateFood = async (foodId, foodData) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Authentication token missing' };

    try {
      const res = await api.foods.update(foodId, foodData, token);
      if (res.success) {
        await fetchFoods(); // Sync state
        return { success: true, item: res.item };
      }
      return { success: false, error: res.error || 'Failed to update food item' };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const reorderPastOrder = (order) => {
    const cartItems = order.items.map(orderItem => {
      const originalFood = foods.find(f => f._id === orderItem.id || f.id === orderItem.id);
      return {
        id: orderItem.id,
        _id: orderItem.id,
        name: orderItem.name,
        price: orderItem.price,
        canteen: orderItem.canteen,
        quantity: orderItem.quantity,
        img: originalFood ? originalFood.img : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'
      };
    });
    setCart(cartItems);
  };

  return (
    <AppContext.Provider value={{
      foods,
      orders,
      cart,
      canteenStatuses,
      vouchers,
      createVoucher,
      updateVoucher,
      deleteVoucher,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      checkout,
      updateOrderStatus,
      payOrder,
      sendOrderMessage,
      submitFoodReview,
      submitRiderReview,
      updateCanteenAnnouncement,
      fetchCanteenReviews,
      addFood,
      deleteFood,
      toggleFoodAvailability,
      updateFood,
      reorderPastOrder,
      playPickupDispatchChime
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
