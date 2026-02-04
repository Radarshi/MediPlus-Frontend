import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, ChevronRight, Calendar } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.BACKEND_URL}/api/orders/my-orders`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      processing: "bg-purple-100 text-purple-800 border-purple-300",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.orderStatus === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-xl text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your medicine orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  filter === status
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <button
              onClick={() => navigate('/store')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5" />
                        <h3 className="text-xl font-bold">Order #{order.orderId}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Calendar className="w-4 h-4" />
                        <p className="text-sm">
                          Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.orderStatus)} flex items-center gap-2`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus.toUpperCase()}
                      </span>
                      <p className="text-2xl font-bold">₹{order.total}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600" />
                      Order Items ({order.items.length})
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain" />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-800 truncate">{item.name}</h5>
                            {item.generic_name && (
                              <p className="text-sm text-gray-500">{item.generic_name}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-indigo-600">₹{item.price} each</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-gray-800">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        Delivery Address
                      </h4>
                      <p className="text-sm text-gray-700 font-medium">{order.deliveryInfo.fullName}</p>
                      <p className="text-sm text-gray-600 mt-1">{order.deliveryInfo.address}</p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryInfo.city}, {order.deliveryInfo.state} - {order.deliveryInfo.zipCode}
                      </p>
                      {order.deliveryInfo.landmark && (
                        <p className="text-sm text-gray-500 mt-1">Landmark: {order.deliveryInfo.landmark}</p>
                      )}
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3">Contact & Payment</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700">{order.deliveryInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700 break-all">{order.deliveryInfo.email}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold text-gray-800 uppercase">{order.paymentMethod}</p>
                          <p className={`text-sm mt-1 ${
                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-800">₹{order.subtotal}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-green-600">-₹{order.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Charge</span>
                        <span className="font-medium text-gray-800">
                          {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                        </span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between">
                        <span className="font-bold text-gray-800">Total Amount</span>
                        <span className="font-bold text-xl text-indigo-600">₹{order.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {order.estimatedDelivery && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-green-800">
                        <Truck className="w-5 h-5" />
                        <span className="font-semibold">
                          Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;