import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, CreditCard, CheckCircle, ShoppingBag, Truck, Clock,
  User, Phone, Mail, Home, ArrowLeft, ArrowRight,
  Upload, FileText, AlertCircle, X, Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/components/cartcontext.tsx';
import PaymentModal from '@/components/PaymentModal';

// ✅ Import API_URL from config
import { API_URL } from '@/config/api';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [finalOrderTotal, setFinalOrderTotal] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: ''
  });

  /* CALCULATIONS */
  const calculateSubtotal = () =>
    cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const calculateDeliveryCharge = () =>
    calculateSubtotal() >= 50 ? 0 : 4.99;

  const calculateTotal = () =>
    calculateSubtotal() + calculateDeliveryCharge();

  /* VALIDATION */
  const validateDeliveryInfo = () => {
    const { fullName, email, phone, address, city, state, zipCode } = deliveryInfo;
    return fullName && email && phone && address && city && state && zipCode;
  };

  /* PLACE ORDER - ✅ FIXED: Accept transactionId as parameter */
  const handlePlaceOrder = async (transactionId: string | null = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const orderTotal = calculateTotal();
      
      // ✅ FIXED: Use transactionId parameter directly
      const orderData = {
        deliveryInfo: {
          fullName: deliveryInfo.fullName,
          email: deliveryInfo.email,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          state: deliveryInfo.state,
          zipCode: deliveryInfo.zipCode,
          landmark: deliveryInfo.landmark || ''
        },
        items: cart.map(item => ({
          id: item.id || item._id || `item-${Date.now()}-${Math.random()}`,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          generic_name: item.generic_name || '',
          manufacturer: item.manufacturer || '',
          dosage: item.dosage || '',
          image_url: item.image_url || item.image || '',
          prescription: item.prescription || false
        })),
        paymentMethod: paymentMethod,
        transactionId: transactionId, // ✅ Use parameter directly!
        prescriptionUrl: null,
        requiresConsultation: false,
        subtotal: calculateSubtotal(),
        discount: 0,
        deliveryCharge: calculateDeliveryCharge(),
        total: orderTotal,
        orderNotes: ''
      };

      console.log('📦 Sending order to:', `${API_URL}/api/orders/create`);
      console.log('📦 Order data:', orderData);
      console.log('📦 Transaction ID:', transactionId);

      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('📥 Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        alert(errorData.error || 'Order failed');
        return;
      }

      const data = await res.json();
      console.log('✅ Order response:', data);

      if (data.success) {
        setFinalOrderTotal(orderTotal);
        setOrderId(data.order?.orderId || 'ORDER_PLACED');
        setOrderPlaced(true);
        clearCart();
      } else {
        throw new Error(data.error || 'Order failed');
      }

    } catch (err: any) {
      console.error('❌ Order error:', err);
      alert('Order failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  /* PAYMENT TRIGGER */
  const handleFinalCheckout = () => {
    if (paymentMethod === 'upi') {
      console.log('💳 Opening UPI payment modal');
      setIsPaymentOpen(true);
    } else {
      console.log('💵 Processing COD order');
      handlePlaceOrder(null); // COD doesn't need transaction ID
    }
  };

  /* SUCCESS SCREEN */
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="max-w-xl w-full text-center">
          <CardContent className="p-10">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully</h1>
            <p className="text-gray-600 mb-4">Order ID: {orderId}</p>
            <p className="font-semibold mb-6">₹{finalOrderTotal.toFixed(2)}</p>
            <Button onClick={() => navigate('/orders')}>
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* MAIN UI */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1 – DELIVERY */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <Input
                  placeholder="Full Name"
                  value={deliveryInfo.fullName}
                  onChange={(e) => setDeliveryInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />

                <Input
                  placeholder="Email"
                  type="email"
                  value={deliveryInfo.email}
                  onChange={(e) => setDeliveryInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />

                <Input
                  placeholder="Phone"
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />

                <textarea
                  className="w-full p-2 border rounded-lg min-h-[80px]"
                  placeholder="Address"
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={deliveryInfo.city}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="State"
                    value={deliveryInfo.state}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="ZIP"
                    value={deliveryInfo.zipCode}
                    onChange={(e) => setDeliveryInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    required
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500"
                  disabled={!validateDeliveryInfo()}
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

              </CardContent>
            </Card>
          )}

          {/* STEP 2 – PAYMENT */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Pay with UPI</div>
                      <div className="text-sm text-gray-500">
                        Google Pay, PhonePe, Paytm
                      </div>
                    </div>
                  </div>
                </div>

                {/* COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">
                        Pay when you receive
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
                    onClick={() => setCurrentStep(3)}
                  >
                    Review Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

          {/* STEP 3 – REVIEW */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Pay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {cart.map(item => (
                  <div key={item.id || Math.random()} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
                    onClick={handleFinalCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT SIDE – SUMMARY */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery</span>
                <span>
                  {calculateDeliveryCharge() === 0 ? 'FREE' : `₹${calculateDeliveryCharge()}`}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          console.log('💳 Payment modal closed');
          setIsPaymentOpen(false);
        }}
        onPaymentSuccess={async (result) => {
          console.log('✅ Payment successful:', result);
          
          setIsPaymentOpen(false);
          
    
          await handlePlaceOrder(result.transactionId);
        }}
        plan={{
          name: "Medicine Order",
          type: "Pharmacy",
          duration: "Standard Delivery",
          price: calculateTotal()
        }}
      />
    </div>
  );
};

export default CheckoutPage;