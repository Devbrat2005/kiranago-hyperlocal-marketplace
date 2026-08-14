const coupons = [
  { code: 'WELCOME50', type: 'FLAT', value: 50, minOrder: 199, description: 'Flat ₹50 OFF on orders above ₹199' },
  { code: 'FIRST100', type: 'FLAT', value: 100, minOrder: 399, description: 'Flat ₹100 OFF on orders above ₹399' },
  { code: 'FREEDELIVERY', type: 'FREE_DELIVERY', value: 0, minOrder: 299, description: 'Free Delivery on orders above ₹299' },
  { code: 'KIRANA15', type: 'PERCENT', value: 15, maxDiscount: 150, minOrder: 299, description: '15% OFF up to ₹150 on orders above ₹299' }
];

exports.getCoupons = async (req, res) => {
  res.json({ success: true, coupons });
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartSubtotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (cartSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${coupon.code}' requires a minimum order of ₹${coupon.minOrder}`
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'FLAT') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'PERCENT') {
      discountAmount = Math.min(coupon.maxDiscount || 9999, Math.round((cartSubtotal * coupon.value) / 100));
    } else if (coupon.type === 'FREE_DELIVERY') {
      discountAmount = 25; // Delivery fee waiver credit
    }

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discountAmount,
        description: coupon.description
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
