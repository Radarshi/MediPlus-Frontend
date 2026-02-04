import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Plus, Minus, ShoppingCart, ArrowRight, 
  Tag, Truck, Shield, ChevronRight, MapPin, Gift, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/components/cartcontext.tsx';

const CartPage = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems([...cart]);
  }, [cart]);

  // Available coupons
  const availableCoupons = [
    { code: 'FIRST50', discount: 50, type: 'percentage', description: '50% off on first order', minOrder: 0 },
    { code: 'MED30', discount: 30, type: 'percentage', description: '30% off on orders above $50', minOrder: 50 },
    { code: 'SAVE20', discount: 20, type: 'flat', description: '$20 flat discount', minOrder: 0 },
    { code: '25NUFIT', discount: 25, type: 'percentage', description: '25% off - Max savings unlocked', minOrder: 0 }
  ];

  // Calculate subtotals from cart
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  };

  //Calculate original total (before discounts on products)
  const calculateOriginalTotal = () => {
    return cartItems.reduce((sum, item) => {
      const originalPrice = item.originalPrice || item.original_price || item.price;
      return sum + (Number(originalPrice) * Number(item.quantity));
    }, 0);
  };

  const calculateDiscount = () => {
    return calculateOriginalTotal() - calculateSubtotal();
  };

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    
    if (subtotal < appliedCoupon.minOrder) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const calculateDeliveryCharge = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 4.99;
  };

  //Calculate final total (subtotal - coupon + delivery)
  const calculateTotal = () => {
    return calculateSubtotal() - calculateCouponDiscount() + calculateDeliveryCharge();
  };

  const calculateTotalSavings = () => {
    return calculateDiscount() + calculateCouponDiscount();
  };

  // Coupon operations
  const applyCoupon = (code) => {
    const coupon = availableCoupons.find(c => c.code === code.toUpperCase());
    if (coupon) {
      const subtotal = calculateSubtotal();
      if (subtotal < coupon.minOrder) {
        alert(`Minimum order of $${coupon.minOrder} required for this coupon`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponCode('');
      setShowCouponInput(false);
    } else {
      alert('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleIncreaseQuantity = (id) => {
    increaseQuantity(id);
  };

  const handleDecreaseQuantity = (id) => {
    decreaseQuantity(id);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

   // Conditional render: If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some medicines to get started</p>
            <a href="/store">
              <Button className="bg-gradient-to-r from-blue-500 to-green-500">
                Browse Medicines
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <a href="/store">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </a>
          <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
          <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Offer Banner */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-900">Max 25% OFF Unlocked</h3>
                    <p className="text-sm text-orange-700">Apply coupon "25NUFIT" at checkout</p>
                  </div>
                  <Button 
                    onClick={() => applyCoupon('25NUFIT')} 
                    className="bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items List */}
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => {
                const originalPrice = item.originalPrice || item.original_price || item.price;
                const hasDiscount = Number(originalPrice) > Number(item.price);
                
                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="max-h-20 object-contain" />
                            ) : (
                              <span className="text-3xl">💊</span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                {item.generic_name && (
                                  <p className="text-sm text-gray-600">{item.generic_name}</p>
                                )}
                                {item.manufacturer && (
                                  <p className="text-xs text-gray-500">by {item.manufacturer}</p>
                                )}
                                {item.prescription && (
                                  <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full mt-1">
                                    Rx Required
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>

                            {item.dosage && (
                              <p className="text-sm text-gray-600 mb-3">{item.dosage}</p>
                            )}

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border rounded-lg">
                                  <button
                                    onClick={() => handleDecreaseQuantity(item.id)}
                                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-4 font-semibold min-w-[40px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleIncreaseQuantity(item.id)}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                {item.in_stock && (
                                  <span className="text-sm text-gray-500">
                                    {item.in_stock} in stock
                                  </span>
                                )}
                              </div>

                              <div className="text-right">
                                <div className="font-bold text-xl text-green-600">
                                  ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                </div>
                                {hasDiscount && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ${(Number(originalPrice) * Number(item.quantity)).toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                              <Truck className="w-4 h-4" />
                              <span>Delivery by Today, before 10:00 pm</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Coupons & Offers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5" />
                    Coupons & Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                      <p className="text-xs text-green-700 mt-1 font-semibold">
                        You saved ₹{calculateCouponDiscount().toFixed(2)}!
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowCouponInput(!showCouponInput)}
                      >
                        Apply coupon
                        <ChevronRight className={`w-4 h-4 transition-transform ${showCouponInput ? 'rotate-90' : ''}`} />
                      </Button>

                      {showCouponInput && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && applyCoupon(couponCode)}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => applyCoupon(couponCode)}
                              disabled={!couponCode}
                            >
                              Apply
                            </Button>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            <p className="text-xs text-gray-500 font-medium">Available Coupons:</p>
                            {availableCoupons.map((coupon) => (
                              <div
                                key={coupon.code}
                                className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
                                onClick={() => applyCoupon(coupon.code)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-mono font-bold text-sm text-blue-600">
                                    {coupon.code}
                                  </div>
                                  <span className="text-xs text-green-600 font-semibold">
                                    {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600">{coupon.description}</div>
                                {coupon.minOrder > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Min. order: ₹{coupon.minOrder}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Bill Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bill Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Total MRP</span>
                    <span>₹{calculateOriginalTotal().toFixed(2)}</span>
                  </div>

                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount on MRP</span>
                      <span>- ₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}

                  {appliedCoupon && calculateCouponDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>- ₹{calculateCouponDiscount().toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>Delivery charges</span>
                      {calculateDeliveryCharge() === 0 && (
                        <span className="text-xs text-green-600 font-semibold">(Free)</span>
                      )}
                    </div>
                    <span>
                      {calculateDeliveryCharge() === 0 ? (
                        <span className="text-green-600">
                          <span className="line-through text-gray-400">₹4.99</span> FREE
                        </span>
                      ) : (
                        `₹${calculateDeliveryCharge().toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Amount to be paid</span>
                    <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>

                  {calculateTotalSavings() > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Total Savings: ₹{calculateTotalSavings().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Checkout Button */}
           <a href="/checkout" className="block">
  <Button 
    className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-6 text-lg font-semibold hover:from-blue-600 hover:to-green-600"
  >   Proceed to Checkout <MapPin className="w-5 h-5 mr-2" />
                <ArrowRight className="w-5 h-5 ml-2" /></Button> </a>
                
              

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <span className="text-xs text-gray-600">Fast Delivery</span>
                </div>
                <div className="text-center">
                  <Tag className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                  <span className="text-xs text-gray-600">Best Prices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;