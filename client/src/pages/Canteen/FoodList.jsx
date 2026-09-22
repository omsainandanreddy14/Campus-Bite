import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, PlusCircle, Check, X, ShieldAlert, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const FoodList = () => {
  const { foods, deleteFood, toggleFoodAvailability } = useApp();
  const { user } = useAuth();

  // Map canteen owner to their canteen stand dynamically
  const canteenName = user?.name || 'Campus Canteen';

  // Filter food items belonging to this canteen (case-insensitive)
  const canteenFoods = foods.filter((f) => f.canteen && canteenName && f.canteen.toLowerCase() === canteenName.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white">Active Food Menu</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review active prices, category assignments, and stock listings.</p>
        </div>
        <Link to="/canteen/add-food" className="btn-primary py-2.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-650 shadow-emerald-500/10 shrink-0">
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Add New Dish</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {canteenFoods.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-slate-450 text-sm">Your canteen has no food items yet. Click "Add New Dish" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200/60 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase">Item Image</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase">Item Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-455 text-right uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {canteenFoods.map((food) => (
                  <tr key={food._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950">
                        <img src={food.img} alt={food.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg Indicator Icon */}
                        <span className={`h-4 w-4 border flex items-center justify-center rounded shrink-0 ${
                          food.isVeg 
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' 
                            : 'border-red-600 bg-red-50 dark:bg-red-955/20'
                        }`} title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
                          <span className={`h-2 w-2 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-red-700'}`} />
                        </span>
                        <span className="font-bold text-slate-850 dark:text-slate-100">{food.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400">{food.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-slate-850 dark:text-slate-200">₹{food.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleFoodAvailability(food._id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          food.available 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50 dark:border-emerald-900/30' 
                            : 'bg-red-50 dark:bg-red-955/20 text-red-655 border border-red-200/50 dark:border-red-900/30'
                        }`}
                      >
                        {food.available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link 
                          to={`/canteen/edit-food/${food._id}`}
                          className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 rounded-xl transition-all"
                          title="Edit Dish"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </Link>
                        <button 
                          onClick={() => deleteFood(food._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-xl transition-all"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodList;
