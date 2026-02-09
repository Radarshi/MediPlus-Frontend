import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle } from 'lucide-react';
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

  onPaymentSuccess?: () => void; 
}

const PaymentModal = ({
  isOpen,
  onClose,
  plan,
  merchantUpiId = "kdrama21k-2@oksbi",
  merchantName = "MediPlus",
  onPaymentSuccess
}: PaymentModalProps) => {

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });

  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const bookingIdRef = React.useRef(
    `CS${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate UPI QR
  useEffect(() => {
    if (step !== 2 || !plan) return;

    const amount = plan.price;
    const tn = encodeURIComponent(`Booking ${bookingIdRef.current}`);
    const pa = encodeURIComponent(merchantUpiId);
    const pn = encodeURIComponent(merchantName);

    const upiUri = `upi://pay?pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;

    QRCode.toDataURL(upiUri, { margin: 1 })
      .then((url) => setUpiQrDataUrl(url))
      .catch(() => setUpiQrDataUrl(null));

  }, [step, plan, merchantUpiId, merchantName]);

  const finalizeBookingAndSendEmail = async (booking: {
    planName: string;
    duration: string;
    amount: number;
    bookingId: string;
    email: string;
    name?: string;
    paymentMethod: "upi";
    txnId?: string | null;
  }) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  };

  const handleContinue = () => {
    if (!formData.email) {
      alert("Email is required");
      return;
    }
    setStep(2);
  };

  const handleUpiPaid = async () => {
    setIsVerifying(true);
    setStep(3);

    await new Promise((res) => setTimeout(res, 2000));

    const fakeTxnId = `UPI${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const booking = {
      planName: `${plan!.name} ${plan!.type} Consultation`,
      duration: plan!.duration,
      amount: plan!.price,
      bookingId: bookingIdRef.current,
      email: formData.email,
      name: formData.name || "UPI User",
      paymentMethod: "upi" as const,
      txnId: fakeTxnId,
    };

    await finalizeBookingAndSendEmail(booking);

    if(onPaymentSuccess)
      await onPaymentSuccess();

    setIsVerifying(false);
    setStep(4);
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ email: "", name: "" });
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
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">

              {/* Step 1 */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

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
                        <div className="text-2xl font-bold">₹{plan.price}</div>
                      </div>
                    </CardContent>
                  </Card>

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
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-6"
                    onClick={handleContinue}
                  >
                    Continue to Payment
                  </Button>

                </motion.div>
              )}

              {/* Step 2 - UPI */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">

                  <Card>
                    <CardHeader>
                      <CardTitle>Scan QR Code to Pay</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upiQrDataUrl ? (
                        <img src={upiQrDataUrl} alt="UPI QR" className="w-48 h-48 mx-auto" />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center mx-auto">
                          Generating QR...
                        </div>
                      )}
                      <p className="mt-4 text-sm text-gray-600">
                        Amount: ₹{plan.price}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        UPI ID: {merchantUpiId}
                      </p>
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-6"
                    onClick={handleUpiPaid}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Proceed now"}
                  </Button>

                </motion.div>
              )}

              {/* Step 3 - Processing */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
                </motion.div>
              )}

              {/* Step 4 - Success */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-6">
                    Confirmation sent to <strong>{formData.email}</strong>
                  </p>
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
