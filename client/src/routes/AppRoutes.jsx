import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import CanteenLayout from '../layouts/CanteenLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Student Pages
import StudentDashboard from '../pages/Student/Dashboard';
import StudentCart from '../pages/Student/Cart';
import StudentOrders from '../pages/Student/Orders';
import StudentProfile from '../pages/Student/Profile';

// Canteen Pages
import CanteenDashboard from '../pages/Canteen/Dashboard';
import CanteenAddFood from '../pages/Canteen/AddFood';
import CanteenFoodList from '../pages/Canteen/FoodList';
import CanteenOrders from '../pages/Canteen/Orders';
import CanteenEditFood from '../pages/Canteen/EditFood';
import CanteenProfile from '../pages/Canteen/Profile';

// Delivery Pages
import DeliveryDashboard from '../pages/Delivery/Dashboard';
import DeliveryAssignedOrders from '../pages/Delivery/AssignedOrders';
import DeliveryCompletedOrders from '../pages/Delivery/CompletedOrders';
import DeliveryProfile from '../pages/Delivery/Profile';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/Users';
import AdminCanteens from '../pages/Admin/Canteens';
import AdminAnalytics from '../pages/Admin/Analytics';
import AdminProfile from '../pages/Admin/Profile';

// Fallback logic
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const dashboardMap = {
    student: '/student/dashboard',
    canteen: '/canteen/dashboard',
    delivery: '/delivery/dashboard',
    admin: '/admin/dashboard',
  };

  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="cart" element={<StudentCart />} />
        <Route path="orders" element={<StudentOrders />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Protected Canteen Routes */}
      <Route 
        path="/canteen" 
        element={
          <ProtectedRoute allowedRoles={['canteen']}>
            <CanteenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CanteenDashboard />} />
        <Route path="add-food" element={<CanteenAddFood />} />
        <Route path="food-list" element={<CanteenFoodList />} />
        <Route path="edit-food/:id" element={<CanteenEditFood />} />
        <Route path="orders" element={<CanteenOrders />} />
        <Route path="profile" element={<CanteenProfile />} />
      </Route>

      {/* Protected Delivery Routes */}
      <Route 
        path="/delivery" 
        element={
          <ProtectedRoute allowedRoles={['delivery']}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="assigned-orders" element={<DeliveryAssignedOrders />} />
        <Route path="completed-orders" element={<DeliveryCompletedOrders />} />
        <Route path="profile" element={<DeliveryProfile />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="canteens" element={<AdminCanteens />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Root/Fallback Redirection */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
