import { useCart } from '@/components/cartcontext.tsx';
import MedicineDetailModal from '@/components/MedicineDetailModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, Pill, Search, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const StorePage = () => {
  // states (kept your original variable names where present)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  // wishlist persisted in localStorage (stores medicine ids)
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
      return [];
    }
  });

  const categories = [
    { id: 'all', name: 'All Medicines', count: 156 },
    { id: 'cardiology', name: 'Heart Care', count: 45 },
    { id: 'diabetes', name: 'Diabetes', count: 32 },
    { id: 'pain-relief', name: 'Pain Relief', count: 28 },
    { id: 'vitamins', name: 'Vitamins', count: 51 }
  ];

  const { addToCart } = useCart();

  // fetch data 
  useEffect(() => {
    const fetchData = async () => {
      const { data: meds, error } = await supabase.from('medicine_store_new').select('*');
      if (error) {
        console.error('Failed to fetch medicines:', error.message);
      } else {
        setMedicines(meds || []);
      }
    };
    fetchData();
  }, []);

  // keep wishlist in localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  //  filtering / sorting logic 
  const filteredMedicines = medicines
    .filter((medicine) => {
      const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
      const matchesSearch =
        medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStock = !inStockOnly || (medicine.in_stock && medicine.in_stock > 0);
      const matchesDiscount = !discountOnly || (medicine.original_price && medicine.original_price > medicine.price);
      return matchesCategory && matchesSearch && matchesStock && matchesDiscount;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // popularity/default
      return (b.reviews || 0) - (a.reviews || 0);
    });

  const handleViewMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  // helper to calculate discount percent safely
  const calcDiscountPercent = (m) => {
    const orig = Number(m.original_price || m.originalPrice || 0);
    const p = Number(m.price || 0);
    if (!orig || orig <= p) return null;
    return Math.round(((orig - p) / orig) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Pill className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Medicine Store</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Categories</h3>
                <div className="space-y-3 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <h3 className="font-bold text-lg mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} className="accent-blue-500" />
                    In Stock Only
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={discountOnly} onChange={() => setDiscountOnly(!discountOnly)} className="accent-green-500" />
                    Discounts Only
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredMedicines.length} medicines found
              </h2>

              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              <AnimatePresence>
                {filteredMedicines.map((medicine, index) => {
                  const discountPct = calcDiscountPercent(medicine);
                  const inWishlist = wishlist.includes(medicine.id);
                  return (
                    <motion.div
                      key={medicine.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex"
                    >
                      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl flex flex-col h-full">
                        {/* image/header area */}
                        <div className="relative bg-gradient-to-br from-blue-400/30 to-green-300/30 p-6 text-center h-36 flex items-center justify-center">
                          {/* If an image URL exists, show it; else show placeholder text/icon */}
                          {medicine.image_url ? (
                            // keep using existing field name image_url as you had
                            <img src={medicine.image_url} alt={medicine.name} className="max-h-24 object-contain" />
                          ) : (
                            <div className="text-4xl font-bold text-blue-700">{medicine.name?.slice(0,2)}</div>
                          )}

                          {/* discount badge — left side so it does not clash with wishlist */}
                          {discountPct && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-40 shadow">
                              {discountPct}% OFF
                            </div>
                          )}

                          {/* prescription badge (if any) — show slightly below left if needed */}
                          {medicine.prescription && (
                            <div className="absolute top-3 left-20 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold z-30 shadow">
                              Rx
                            </div>
                          )}

                          {/* wishlist heart — right side, clickable; z-index above image area */}
                          <button
                            onClick={() => toggleWishlist(medicine.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white shadow z-50 hover:scale-105 transition"
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart
                              className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-current' : 'text-gray-500'}`}
                            />
                          </button>
                        </div>

                        {/* content */}
                        <CardContent className="p-4 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="mb-2">
                              <h3 className="font-bold text-lg mb-1">{medicine.name}</h3>
                              <p className="text-sm text-gray-600">{medicine.generic_name}</p>
                              <p className="text-xs text-gray-500">by {medicine.manufacturer}</p>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medicine.description}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {(medicine.tags || []).map((tag, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-semibold ml-1">{medicine.rating}</span>
                                <span className="text-xs text-gray-500 ml-1">({medicine.reviews})</span>
                              </div>
                              <span className="text-sm text-green-600 font-medium">
                                {medicine.in_stock} in stock
                              </span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <span className="text-2xl font-bold text-green-600">₹{medicine.price}</span>
                                {medicine.original_price > medicine.price && (
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    ${medicine.original_price}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Dosage</p>
                                <p className="text-sm font-medium">{medicine.dosage}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                           <Button
  className="flex-1 bg-gradient-to-r from-blue-500/90 to-green-500/90"
  onClick={() => addToCart({ 
    id: medicine.id.toString(), 
    name: medicine.name, 
    price: medicine.price,
    generic_name: medicine.generic_name,
    manufacturer: medicine.manufacturer,
    dosage: medicine.dosage,
    image_url: medicine.image_url,
    prescription: medicine.prescription  
  })}
>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                              onClick={() => handleViewMedicine(medicine)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Detail Modal */}
      {selectedMedicine && (
        <MedicineDetailModal
          medicine={selectedMedicine}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMedicine(null);
          }}
        />
      )}
    </div>
  );
};

export default StorePage;
