const API_BASE = 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
  }
  return headers;
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    },

    register: async (name, email, password, role, additionalData = {}) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password, role, ...additionalData }),
      });
      return await res.json();
    },

    me: async (token) => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    canteensList: async () => {
      const res = await fetch(`${API_BASE}/auth/canteens`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    },

    updateKitchenStatus: async (status, token) => {
      const res = await fetch(`${API_BASE}/auth/users/kitchen-status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ kitchenStatus: status }),
      });
      return await res.json();
    },

    adminUpdateKitchenStatus: async (userId, status, token) => {
      const res = await fetch(`${API_BASE}/auth/users/kitchen-status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ userId, kitchenStatus: status }),
      });
      return await res.json();
    },

    depositWallet: async (amount, token) => {
      const res = await fetch(`${API_BASE}/auth/wallet/deposit`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      return await res.json();
    },

    withdrawWallet: async (amount, token) => {
      const res = await fetch(`${API_BASE}/auth/wallet/withdraw`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      return await res.json();
    },

    walletTransactions: async (token) => {
      const res = await fetch(`${API_BASE}/auth/wallet/transactions`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    updateAnnouncement: async (announcement, specialDishId, specialDishPrice, customSpecialDishName, customSpecialDishPrice, specialDishes, token) => {
      const res = await fetch(`${API_BASE}/auth/users/announcement`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ announcement, specialDishId, specialDishPrice, customSpecialDishName, customSpecialDishPrice, specialDishes }),
      });
      return await res.json();
    },

    updateProfile: async (data, token) => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await res.json();
    },
  },

  foods: {
    list: async () => {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    },

    create: async (foodItem, token) => {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(foodItem),
      });
      return await res.json();
    },

    toggle: async (foodId, token) => {
      const res = await fetch(`${API_BASE}/foods/${foodId}`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    delete: async (foodId, token) => {
      const res = await fetch(`${API_BASE}/foods/${foodId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    update: async (foodId, foodData, token) => {
      const res = await fetch(`${API_BASE}/foods/${foodId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(foodData),
      });
      return await res.json();
    },

    submitReview: async (foodId, reviewData, token) => {
      const res = await fetch(`${API_BASE}/foods/${foodId}/reviews`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(reviewData),
      });
      return await res.json();
    },

    getCanteenReviews: async (canteenName, token) => {
      const res = await fetch(`${API_BASE}/foods/canteen/${canteenName}/reviews`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    getRatingsSummary: async (canteenName, token) => {
      const res = await fetch(`${API_BASE}/foods/canteen/${encodeURIComponent(canteenName)}/ratings-summary`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },
  },

  orders: {
    list: async (token) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    create: async (orderData, token) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(orderData),
      });
      return await res.json();
    },

    updateStatus: async (orderId, status, token) => {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ status }),
      });
      return await res.json();
    },

    pay: async (orderId, token) => {
      const res = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    sendMessage: async (orderId, text, token) => {
      const res = await fetch(`${API_BASE}/orders/${orderId}/messages`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ text }),
      });
      return await res.json();
    },

    rateRider: async (orderId, rating, token) => {
      const res = await fetch(`${API_BASE}/orders/${orderId}/rate-rider`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ rating }),
      });
      return await res.json();
    },
  },

  admin: {
    usersList: async (token) => {
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    toggleUserStatus: async (userId, token) => {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    deleteUser: async (userId, token) => {
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    addWalletMoney: async (userId, amount, token) => {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/add-wallet`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      return await res.json();
    },

    getCouriers: async (token) => {
      const res = await fetch(`${API_BASE}/auth/couriers`, {
        method: 'GET',
        headers: getHeaders(token),
      });
      return await res.json();
    },

    updateUser: async (userId, data, token) => {
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await res.json();
    },
  },

  vouchers: {
    list: async () => {
      const res = await fetch(`${API_BASE}/vouchers`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await res.json();
    },

    create: async (voucherData, token) => {
      const res = await fetch(`${API_BASE}/vouchers`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(voucherData),
      });
      return await res.json();
    },

    update: async (voucherId, data, token) => {
      const res = await fetch(`${API_BASE}/vouchers/${voucherId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await res.json();
    },

    delete: async (voucherId, token) => {
      const res = await fetch(`${API_BASE}/vouchers/${voucherId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return await res.json();
    },
  },
};

export default api;
