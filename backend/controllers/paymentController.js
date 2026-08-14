const { db } = require('../config/db');

const paymentsCol = db.collection('payments');
const ordersCol = db.collection('orders');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentMethod = 'UPI', orderId } = req.body;

    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const razorpayOrderId = 'order_rzp_' + Math.random().toString(36).substring(2, 10);

    const paymentIntent = paymentsCol.insertOne({
      paymentId,
      razorpayOrderId,
      amount,
      currency,
      paymentMethod,
      orderId,
      status: 'CREATED',
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_kiranago_demo_key',
      razorpayOrderId,
      paymentId,
      amount,
      currency
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Simulate verification
    paymentsCol.updateOne({ paymentId }, {
      status: 'SUCCESS',
      razorpayPaymentId: razorpayPaymentId || 'pay_rzp_mock_' + Date.now(),
      updatedAt: new Date().toISOString()
    });

    if (orderId) {
      const order = ordersCol.findOne({ orderId }) || ordersCol.findById(orderId);
      if (order) {
        ordersCol.updateOne({ _id: order._id || order.id }, {
          paymentStatus: 'PAID',
          paymentMethod: 'UPI/CARD'
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      transactionId: razorpayPaymentId || 'pay_rzp_mock_' + Date.now()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
