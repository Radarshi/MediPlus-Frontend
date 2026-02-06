import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;      
    type: string;      
    duration: string;  
    price: number;    
  } | null;
  merchantUpiId?: string;
  merchantName?: string;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  plan, 
  merchantUpiId = "kdrama21k-2@oksbi",
  merchantName = "MediPlus",
}: PaymentModalProps) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: '',
    city: '',
    zipCode: ''
  });

  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  const bookingIdRef = React.useRef(
    `CS${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  );

  // Updates a single field in formData object
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate UPI QR code when on step 2 with UPI selected
  useEffect(() => {
    if (step !== 2 || paymentMethod !== "upi" || !plan) return;

    const amount = plan.price;
    const tn = encodeURIComponent(`Booking ${bookingIdRef.current}`);
    const pa = encodeURIComponent(merchantUpiId);
    const pn = encodeURIComponent(merchantName);
    const upiUri = `upi://pay?pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;

    QRCode.toDataURL(upiUri, { margin: 1 })
      .then((url) => setUpiQrDataUrl(url))
      .catch((err) => {
        console.error("QR generation failed:", err);
        setUpiQrDataUrl(null);
      });
  }, [step, paymentMethod, plan, merchantUpiId, merchantName]);

  // Generate OTP when entering OTP step (step 3) for card payments
  useEffect(() => {
    if (step === 3 && paymentMethod === "card") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(" OTP :", otp);
      setGeneratedOtp(otp);
    }
  }, [step, paymentMethod]);

  // Generic function that signals booking complete
  const finalizeBookingAndSendEmail = async (booking: {
    planName: string;
    duration: string;
    amount: number;
    bookingId: string;
    email: string;
    name?: string;
    paymentMethod: "card" | "upi";
    txnId?: string | null;
  }) => {
    try {
    console.log("📧 Sending confirmation email to:", booking.email);
      
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      console.log(resp);
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Email API error:", errorData);
      } else {
        const data = await resp.json();
        console.log("Email sent successfully:", data);
      }
    } catch (err) {
      console.error("Email sending failed:", err);
      return false;
    }
  };

  // Validation functions
  const isValidCardNumber = (num: string) => {
    const digits = num.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(digits)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const isValidExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [mm, yy] = expiry.split("/").map(Number);
    if (mm < 1 || mm > 12) return false;

    const now = new Date();
    const exp = new Date(2000 + yy, mm);
    return exp > now;
  };
  const isValidCVV = (cvv: string) => /^\d{3,4}$/.test(cvv);

  // Handle "Continue" from step 1
  const handleContinue = () => {
    setStep(2); // Go to payment details (card form or UPI QR)
  };

  // Handle card payment submission (from step 2)
  const handleCardPayment = async () => {
    if (!isValidCardNumber(formData.cardNumber)) {
      alert("Invalid card number");
      return;
    }
    if (!isValidExpiry(formData.expiryDate)) {
      alert("Invalid or expired card date");
      return;
    }
    if (!isValidCVV(formData.cvv)) {
      alert("Invalid CVV");
      return;
    }
    if (!formData.email) {
      alert("Email is required");
      return;
    }
    // Card validated → move to OTP verification
    setStep(3);
  };

  // Handle OTP verification (from step 3)
  const handleOtpVerification = async () => {
    if (enteredOtp !== generatedOtp) {
      alert("Invalid OTP. Please try again.");
      return;
    }

    // OTP correct → process payment
    setStep(4);
    await new Promise((res) => setTimeout(res, 2000));

    const booking = {
      planName: `${plan!.name} ${plan!.type} Consultation`,
      duration: plan!.duration,
      amount: plan!.price,
      bookingId: bookingIdRef.current,
      email: formData.email,
      name: formData.nameOnCard,
      paymentMethod: "card" as const,
      txnId: `CARD${Date.now()}`
    };

    await finalizeBookingAndSendEmail(booking);
    
    setStep(5); // Success
  };

  // Handle UPI "I have paid" button (from step 2)
  const handleUpiPaid = async () => {
    if (!formData.email) {
      alert("Email is required");
      return;
    }

    try {
      setIsVerifying(true);
      setStep(4); // Processing

      // Simulate verification time
      await new Promise((res) => setTimeout(res, 2000));

      const fakeTxnId = `UPI${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const booking = {
        planName: `${plan!.name} ${plan!.type} Consultation`,
        duration: plan!.duration,
        amount: plan!.price,
        bookingId: bookingIdRef.current,
        email: formData.email,
        name: formData.nameOnCard || "UPI User",
        paymentMethod: "upi" as const,
        txnId: fakeTxnId,
      };

      await finalizeBookingAndSendEmail(booking);
      
      setIsVerifying(false);
      setStep(5); // Success
    } catch (err) {
      console.error("UPI verify/send error:", err);
      setIsVerifying(false);
      alert("Payment verification failed. Please try again.");
      setStep(2); // Back to UPI QR
    }
  };

  const handleClose = () => {
    setStep(1);
    setPaymentMethod("card");
    setFormData({
      email: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
      billingAddress: "",
      city: "",
      zipCode: "",
    });
    setEnteredOtp("");
    setGeneratedOtp("");
    setUpiQrDataUrl(null);
    setIsVerifying(false);
    onClose();
  };

  if (!plan) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Complete Payment</h1>
                    <p className="text-white/90">Secure checkout for your consultation</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Step 1: Order Summary + Payment Method Selection */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-semibold">{plan.name} {plan.type} Consultation</h3>
                          <p className="text-sm text-gray-600">{plan.duration}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">₹{plan.price}</div>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total</span>
                          <span>₹{plan.price}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment method selector */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Choose payment method</h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          paymentMethod === "card" 
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium">Pay with Card</div>
                        <div className="text-xs text-gray-500">Credit/Debit Card</div>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          paymentMethod === "upi" 
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium">Pay with UPI</div>
                        <div className="text-xs text-gray-500">Scan QR Code</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-lg py-6"
                    onClick={handleContinue}
                  >
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Card Payment Form */}
              {step === 2 && paymentMethod === "card" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      ← Back
                    </Button>
                    <h3 className="text-lg font-semibold">Card Payment</h3>
                  </div>

                  {/* Payment Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          placeholder="you@domain.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number *</label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                          <Input
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV *</label>
                          <Input
                            placeholder="123"
                            type="password"
                            maxLength={4}
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Name on Card *</label>
                        <Input
                          placeholder="John Doe"
                          value={formData.nameOnCard}
                          onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Billing Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Billing Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <Input
                          placeholder="123 Main St"
                          value={formData.billingAddress}
                          onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <Input
                            placeholder="New York"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">ZIP Code</label>
                          <Input
                            placeholder="10001"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-6"
                    onClick={handleCardPayment}
                    disabled={
                      !formData.cardNumber ||
                      !formData.nameOnCard ||
                      !formData.email ||
                      !formData.expiryDate ||
                      !formData.cvv
                    }
                  >
                    Proceed to OTP Verification
                  </Button>
                </motion.div>
              )}

              {/* Step 2: UPI Payment */}
              {step === 2 && paymentMethod === "upi" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      ← Back
                    </Button>
                    <h3 className="text-lg font-semibold">Pay with UPI</h3>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Scan QR Code to Pay</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this QR with your UPI app to pay ₹{plan.price}
                      </p>
                      
                      <div className="flex flex-col items-center gap-4">
                        {upiQrDataUrl ? (
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <img 
                              src={upiQrDataUrl} 
                              alt="UPI QR Code" 
                              className="w-48 h-48" 
                            />
                          </div>
                        ) : (
                          <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <span className="text-sm text-gray-500">Generating QR...</span>
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-left w-full max-w-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">UPI ID:</span>
                              <span className="font-medium">{merchantUpiId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payee:</span>
                              <span className="font-medium">{merchantName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium">₹{plan.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Booking ID:</span>
                              <span className="font-medium">{bookingIdRef.current}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full max-w-sm">
                          <label className="block text-sm font-medium mb-2 text-left">
                            Your Email (for confirmation) *
                          </label>
                          <Input
                            type="email"
                            placeholder="you@domain.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 py-6"
                      onClick={handleUpiPaid}
                      disabled={!formData.email || isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "I have paid"}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    Click "I have paid" after completing the UPI payment
                  </div>
                </motion.div>
              )}

              {/* Step 3: OTP Verification (Card only) */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-8"
                >
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-2">OTP Verification</h3>
                    <p className="text-gray-600">
                      Enter the 6-digit OTP sent to your registered mobile number
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-bold"
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    Check your console for the test OTP
                  </div>

                  <div className="flex gap-3 max-w-xs mx-auto">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      ← Back
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
                      onClick={handleOtpVerification}
                      disabled={enteredOtp.length !== 6}
                    >
                      Verify & Pay
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Processing Payment */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                  <p className="text-gray-600">Please wait while we process your payment...</p>
                  <p className="text-sm text-gray-500 mt-4">This may take a few seconds</p>
                </motion.div>
              )}

              {/* Step 5: Success */}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h3>
                  <p className="text-gray-600 mb-6">Your consultation has been booked successfully.</p>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                    <h4 className="font-semibold mb-4 text-lg">Booking Details</h4>
                    <div className="text-sm text-left space-y-2">
                      <div className="flex justify-between py-2 border-b border-indigo-100">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium">{plan.name} {plan.type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-indigo-100">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{plan.duration}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-indigo-100">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium">₹{plan.price}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-mono font-medium">{bookingIdRef.current}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      A confirmation email has been sent to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <Button
                    className="w-full max-w-xs bg-gradient-to-r from-indigo-500 to-purple-600 py-6"
                    onClick={handleClose}
                  >
                    Done
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;