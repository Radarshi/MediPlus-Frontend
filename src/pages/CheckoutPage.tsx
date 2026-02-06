import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, CreditCard, CheckCircle, ShoppingBag, Truck, Clock,
  User, Phone, Mail, Home, Calendar, Lock, Shield, ArrowLeft, ArrowRight,
  Upload, FileText, AlertCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/components/cartcontext.tsx';

const CheckoutPage = () => {
  const { cart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [showConsultationDialog, setShowConsultationDialog] = useState(false);

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

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card'
  });

  // Check if any item requires prescription
  const requiresPrescription = cart.some(item => item.prescription === true);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  };

  const calculateDeliveryCharge = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 4.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryCharge();
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setPrescriptionFile(file);
    }
  };

  const removePrescription = () => {
    setPrescriptionFile(null);
  };

  const handleConsultationRequest = async () => {
    const token = window.localStorage?.getItem('token');

  
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/request-consultation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicineNames: cart.filter(item => item.prescription).map(item => item.name).join(', '),
          symptoms: 'User requested consultation',
          reason: 'No prescription available'
        })
      });

      if (response.ok) {
        alert('Consultation request submitted! A doctor will contact you within 24 hours.');
        setShowConsultationDialog(false);
      }
    } catch (error) {
      console.error('Consultation request failed:', error);
      alert('Failed to submit consultation request. Please try again.');
    }
  };

  const validateDeliveryInfo = () => {
    const { fullName, email, phone, address, city, state, zipCode } = deliveryInfo;
    return fullName && email && phone && address && city && state && zipCode;
  };

  const validatePaymentInfo = () => {
    if (paymentInfo.paymentMethod === 'cod') return true;
    const { cardNumber, cardName, expiryDate, cvv } = paymentInfo;
    return cardNumber && cardName && expiryDate && cvv;
  };

  const handlePlaceOrder = async () => {
    if (requiresPrescription && !prescriptionFile) {
      setShowConsultationDialog(true);
      return;
    }
 const token = window.localStorage?.getItem('token');
  if (!token) {
    alert('Your session has expired. Please login again.');
    navigate('/login');
    return;
  }

  setIsProcessing(true);

    try {
      const formData = new FormData();
      
      formData.append('deliveryInfo', JSON.stringify(deliveryInfo));
      formData.append('items', JSON.stringify(cart));
      formData.append('paymentMethod', paymentInfo.paymentMethod);
      formData.append('paymentStatus', paymentInfo.paymentMethod === 'card' ? 'paid' : 'pending');
      formData.append('subtotal', calculateSubtotal().toString());
      formData.append('discount', '0');
      formData.append('deliveryCharge', calculateDeliveryCharge().toString());
      formData.append('total', calculateTotal().toString());
      
      if (prescriptionFile) {
        formData.append('prescription', prescriptionFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrderId(data.orderId);
        setOrderPlaced(true);
        clearCart();
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Delivery Details', icon: MapPin },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review Order', icon: ShoppingBag }
  ];

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center">
              <CardContent className="p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>

                <h1 className="text-3xl font-bold mb-4 text-green-600">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We've received your order and will process it shortly.
                  A confirmation email has been sent to {deliveryInfo.email}
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="text-sm text-gray-500 mb-2">Order ID</div>
                  <div className="text-2xl font-bold text-gray-800 mb-4">{orderId}</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <div className="text-sm text-gray-500">Order Total</div>
                      <div className="font-bold text-lg">₹{calculateTotal().toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Delivery To</div>
                      <div className="font-bold text-lg">{deliveryInfo.fullName}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold">Expected delivery: 2-3 business days</span>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate('/')} 
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back to Home
                  </button>
                  <button 
                    onClick={() => navigate('/orders')} 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:brightness-110 transition-all"
                  >
                    View Order
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="container mx-auto px-6 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items before checkout</p>
          <button 
            onClick={() => navigate('/store')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold"
          >
            Browse Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    currentStep >= step.number ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 ${
                    currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {showConsultationDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Prescription Required</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Some items in your cart require a prescription. You can either upload a prescription or request a quick consultation with our doctor.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowConsultationDialog(false)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Upload Prescription
                </button>
                <button
                  onClick={handleConsultationRequest}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Request Doctor Consultation
                </button>
                <button
                  onClick={() => setShowConsultationDialog(false)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {requiresPrescription && (
                    <Card className="border-2 border-orange-200 bg-orange-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800">
                          <FileText className="w-5 h-5" />
                          Prescription Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-orange-700 mb-4">
                          Some items require a prescription. Please upload your prescription or request a doctor consultation.
                        </p>

                        {prescriptionFile ? (
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-green-600" />
                                <div>
                                  <p className="font-semibold">{prescriptionFile.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(prescriptionFile.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={removePrescription}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="block">
                              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-100/50 transition-colors">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                                <p className="font-semibold text-gray-800">Upload Prescription</p>
                                <p className="text-sm text-gray-500 mt-1">PNG, JPG, PDF (Max 5MB)</p>
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.pdf"
                                  onChange={handlePrescriptionUpload}
                                  className="hidden"
                                />
                              </div>
                            </label>
                            
                            <div className="text-center">
                              <span className="text-sm text-gray-500">or</span>
                            </div>

                            <button
                              onClick={() => setShowConsultationDialog(true)}
                              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              Request Doctor Consultation
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Delivery Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="John Doe"
                              value={deliveryInfo.fullName}
                              onChange={(e) => handleDeliveryChange('fullName', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              value={deliveryInfo.email}
                              onChange={(e) => handleDeliveryChange('email', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="+91 9876543210"
                            value={deliveryInfo.phone}
                            onChange={(e) => handleDeliveryChange('phone', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Address *</label>
                        <div className="relative">
                          <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <textarea
                            placeholder="Street address, apartment, suite, etc."
                            value={deliveryInfo.address}
                            onChange={(e) => handleDeliveryChange('address', e.target.value)}
                            className="w-full pl-10 p-2 border rounded-lg min-h-[80px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City *</label>
                          <Input
                            placeholder="Kolkata"
                            value={deliveryInfo.city}
                            onChange={(e) => handleDeliveryChange('city', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">State *</label>
                          <Input
                            placeholder="West Bengal"
                            value={deliveryInfo.state}
                            onChange={(e) => handleDeliveryChange('state', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                          <Input
                            placeholder="700001"
                            value={deliveryInfo.zipCode}
                            onChange={(e) => handleDeliveryChange('zipCode', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Landmark (Optional)</label>
                        <Input
                          placeholder="Near Victoria Memorial"
                          value={deliveryInfo.landmark}
                          onChange={(e) => handleDeliveryChange('landmark', e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-green-500 mt-6"
                        onClick={() => setCurrentStep(2)}
                        disabled={!validateDeliveryInfo() || (requiresPrescription && !prescriptionFile)}
                      >
                        Continue to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div
                          onClick={() => handlePaymentChange('paymentMethod', 'card')}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            paymentInfo.paymentMethod === 'card'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5" />
                              <div>
                                <div className="font-semibold">Credit/Debit Card</div>
                                <div className="text-sm text-gray-500">Visa, Mastercard, Amex</div>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentInfo.paymentMethod === 'card'
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {paymentInfo.paymentMethod === 'card' && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => handlePaymentChange('paymentMethod', 'cod')}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            paymentInfo.paymentMethod === 'cod'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Truck className="w-5 h-5" />
                              <div>
                                <div className="font-semibold">Cash on Delivery</div>
                                <div className="text-sm text-gray-500">Pay when you receive</div>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentInfo.paymentMethod === 'cod'
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {paymentInfo.paymentMethod === 'cod' && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {paymentInfo.paymentMethod === 'card' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-4 border-t"
                        >
                          <div>
                            <label className="block text-sm font-medium mb-2">Card Number *</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="1234 5678 9012 3456"
                                value={paymentInfo.cardNumber}
                                onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                                className="pl-10"
                                maxLength={19}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                            <Input
                              placeholder="John Doe"
                              value={paymentInfo.cardName}
                              onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  placeholder="MM/YY"
                                  value={paymentInfo.expiryDate}
                                  onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                                  className="pl-10"
                                  maxLength={5}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">CVV *</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  placeholder="123"
                                  value={paymentInfo.cvv}
                                  onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                                  className="pl-10"
                                  maxLength={4}
                                  type="password"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span>Your payment information is secure and encrypted</span>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex gap-4 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
                          onClick={() => setCurrentStep(3)}
                          disabled={!validatePaymentInfo()}
                        >
                          Review Order
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Delivery Address
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-semibold">{deliveryInfo.fullName}</p>
                        <p className="text-gray-600">{deliveryInfo.address}</p>
                        <p className="text-gray-600">
                          {deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}
                        </p>
                        {deliveryInfo.landmark && (
                          <p className="text-sm text-gray-500">Landmark: {deliveryInfo.landmark}</p>
                        )}
                        <p className="text-gray-600">{deliveryInfo.phone}</p>
                        <p className="text-gray-600">{deliveryInfo.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Payment Method
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {paymentInfo.paymentMethod === 'card' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Credit/Debit Card</p>
                            <p className="text-sm text-gray-500">
                              •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">Pay when you receive</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {prescriptionFile && (
                    <Card className="border-2 border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                          <FileText className="w-5 h-5" />
                          Prescription Uploaded
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="font-semibold">{prescriptionFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(prescriptionFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Order Items ({cart.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="max-h-14 object-contain" />
                            ) : (
                              <span className="text-2xl">💊</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-500"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span>
                      {calculateDeliveryCharge() === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${calculateDeliveryCharge().toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>

                  <div className="mt-4 space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span>Free delivery on orders above ₹50</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Estimated delivery: 2-3 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span>100% secure payment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage