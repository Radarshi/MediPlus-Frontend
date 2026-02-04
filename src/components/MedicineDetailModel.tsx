import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Heart, Shield, Clock, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicineDetailModalProps {
  medicine: any;
  isOpen: boolean;
  onClose: () => void;
}

const MedicineDetailModal = ({ medicine, isOpen, onClose }: MedicineDetailModalProps) => {
  if (!medicine) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-6xl">{medicine.image}</div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{medicine.name}</h1>
                  <p className="text-blue-100">{medicine.genericName}</p>
                  <p className="text-sm text-blue-100">by {medicine.manufacturer}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Price and Rating */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-3xl font-bold text-green-600">${medicine.price}</span>
                  {medicine.originalPrice > medicine.price && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ${medicine.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{medicine.rating}</span>
                  <span className="text-gray-500">({medicine.reviews} reviews)</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{medicine.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Dosage</span>
                  </div>
                  <p className="text-gray-700">{medicine.dosage}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Prescription</span>
                  </div>
                  <p className="text-gray-700">{medicine.prescription ? 'Required' : 'Not Required'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Stock</span>
                  </div>
                  <p className="text-gray-700">{medicine.inStock} units available</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Category</span>
                  </div>
                  <p className="text-gray-700 capitalize">{medicine.category}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {medicine.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart - ${medicine.price}
                </Button>
                <Button variant="outline" size="lg" className="px-6">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MedicineDetailModal;
