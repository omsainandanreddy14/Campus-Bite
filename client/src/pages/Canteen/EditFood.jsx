import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, Upload, Save, ArrowLeft } from 'lucide-react';

const EditFood = () => {
  const { foods, updateFood } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Biryani');
  const [isVeg, setIsVeg] = useState(true);
  const [base64Image, setBase64Image] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Map canteen owner to their canteen stand dynamically
  const canteenName = user?.name || 'Campus Canteen';

  // Load existing food details from context list
  useEffect(() => {
    const foodItem = foods.find((f) => f._id === id || f.id === id);
    if (foodItem) {
      setName(foodItem.name);
      setPrice(foodItem.price.toString());
      setCategory(foodItem.category);
      setBase64Image(foodItem.img || '');
      if (foodItem.hasOwnProperty('isVeg')) {
        setIsVeg(foodItem.isVeg);
      }
    } else {
      setError('Food item details could not be found.');
    }
  }, [id, foods]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Selected image is too large. Please upload an image under 2MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onloadend = () => {
      setBase64Image(reader.result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try another image.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Please fill out the food name and price.');
      return;
    }
    setError('');

    const foodData = {
      name,
      price: parseFloat(price),
      category,
      img: base64Image,
      isVeg
    };

    try {
      const res = await updateFood(id, foodData);
      if (res.success) {
        navigate('/canteen/food-list');
      } else {
        setError(res.error || 'Failed to update food item.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/canteen/food-list')}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all text-slate-600 dark:text-slate-350"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-855 dark:text-white">Edit Food Item</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Modify dish name, price tier, category, or photo.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 border border-red-200 dark:border-red-900/40 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Food Name</label>
            <input 
              type="text" 
              placeholder="e.g. Schezwan Fried Rice" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Price (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="₹120" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="auth-input" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="auth-input bg-white dark:bg-slate-850"
              >
                <option value="Biryani">Biryani</option>
                <option value="Burgers">Burgers</option>
                <option value="Pizza">Pizza</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Food Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-55 dark:hover:bg-slate-855 transition-all select-none">
                <input 
                  type="radio" 
                  name="isVeg" 
                  checked={isVeg === true}
                  onChange={() => setIsVeg(true)}
                  className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300"
                />
                <span className="h-3 w-3 border border-emerald-600 flex items-center justify-center rounded shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Vegetarian</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-55 dark:hover:bg-slate-855 transition-all select-none">
                <input 
                  type="radio" 
                  name="isVeg" 
                  checked={isVeg === false}
                  onChange={() => setIsVeg(false)}
                  className="text-red-650 focus:ring-red-500 h-4 w-4 border-slate-300"
                />
                <span className="h-3 w-3 border border-red-655 flex items-center justify-center rounded shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-650" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Non-Vegetarian</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Food Image (Replace Photo)</label>
            
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-slate-855/10 transition-all">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="space-y-2">
                <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Click to select new image or capture photo</p>
                <p className="text-[9px] text-slate-400">Supports JPG, PNG, WEBP (Max 2MB)</p>
              </div>
            </div>

            {isUploading && (
              <p className="text-xs text-slate-400">Reading image file...</p>
            )}

            {base64Image && (
              <div className="relative rounded-2xl overflow-hidden max-w-[200px] border border-slate-200 dark:border-slate-800 mt-3">
                <img src={base64Image} alt="Uploaded food preview" className="w-full h-28 object-cover" />
                <button 
                  type="button" 
                  onClick={() => setBase64Image('')}
                  className="absolute top-2 right-2 bg-red-650 hover:bg-red-700 text-white rounded-full p-1 text-[10px] transition-all font-bold shadow-md"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-655 shadow-emerald-500/10 font-bold py-3">
            <Save className="h-4.5 w-4.5" />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFood;
