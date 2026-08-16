const { db } = require('../config/db');

const aiConvosCol = db.collection('ai_conversations');
const ordersCol = db.collection('orders');
const ticketsCol = db.collection('support_tickets');

// Detect Hindi / Hinglish keywords
function detectLanguage(text = '') {
  const lower = text.toLowerCase();
  const hindiRegex = /[\u0900-\u097F]/;
  const hinglishWords = ['kahan', 'kab', 'milega', 'aayega', 'rupaye', 'bhai', 'samana', 'deliver', 'batao', 'chahiye', 'nahi', 'hua', 'karo', 'kar'];

  if (hindiRegex.test(text)) return 'HINDI';
  if (hinglishWords.some(w => lower.includes(w))) return 'HINGLISH';
  return 'ENGLISH';
}

// Smart AI Assistant Resolver
function generateAIResponse(message, userOrders, userLanguage) {
  const msg = message.toLowerCase();
  const latestOrder = userOrders.length > 0 ? userOrders[0] : null;

  let replyText = '';
  let quickActions = ['Track Order', 'Cancel Order', 'Refund Policy', 'Missing Item', 'Talk to Human'];
  let confidence = 0.95;
  let shouldEscalate = false;

  // 1. Order Tracking / Delivery status
  if (msg.includes('track') || msg.includes('where') || msg.includes('status') || msg.includes('kahan') || msg.includes('kab')) {
    if (latestOrder) {
      if (userLanguage === 'HINDI') {
        replyText = `आपका आर्डर #${latestOrder.orderId} अभी "${latestOrder.status}" स्थिति में है। ${latestOrder.storeName} से आपके घर तक पहुंचने का अनुमानित समय ${latestOrder.estimatedDeliveryTime || '15-25 mins'} है।`;
      } else if (userLanguage === 'HINGLISH') {
        replyText = `Aapka order #${latestOrder.orderId} abhi "${latestOrder.status}" state me hai! ${latestOrder.storeName} se delivery ETA: ${latestOrder.estimatedDeliveryTime || '15-25 mins'}.`;
      } else {
        replyText = `Your order #${latestOrder.orderId} from ${latestOrder.storeName} is currently "${latestOrder.status}". Estimated delivery time: ${latestOrder.estimatedDeliveryTime || '15-25 mins'}.`;
      }
    } else {
      replyText = userLanguage === 'HINGLISH'
        ? `Mujhe aapka koi active order nahi mila. Aap KiranaGo app se fresh grocery products order kar sakte hain!`
        : `I couldn't find any recent orders associated with your account. Browse nearby Kirana stores on KiranaGo to place an order!`;
    }
  }
  // 2. Cancellation
  else if (msg.includes('cancel') || msg.includes('radd')) {
    if (latestOrder) {
      if (['Order Placed', 'Store Accepted', 'Preparing'].includes(latestOrder.status)) {
        replyText = userLanguage === 'HINGLISH'
          ? `Aapka order #${latestOrder.orderId} abhi cancel ho sakta hai! Order Tracking page par 'Cancel Order' button dabayein.`
          : `Your order #${latestOrder.orderId} can be cancelled since it is not out for delivery yet. Go to Orders -> Track Order to cancel.`;
      } else {
        replyText = userLanguage === 'HINGLISH'
          ? `Aapka order #${latestOrder.orderId} out for delivery ho chuka hai, ab cancellation allowed nahi hai.`
          : `Order #${latestOrder.orderId} is already out for delivery and cannot be cancelled directly. Please contact our human support team below.`;
        shouldEscalate = true;
      }
    } else {
      replyText = `No active order found to cancel.`;
    }
  }
  // 3. Refund / Payment issue
  else if (msg.includes('refund') || msg.includes('money') || msg.includes('paise') || msg.includes('payment')) {
    replyText = userLanguage === 'HINGLISH'
      ? `KiranaGo par approved refunds 24-48 ghante me aapke original payment mode (UPI/Bank/Card) me credit ho jaate hain.`
      : `Approved refunds on KiranaGo are credited back to your original payment mode (UPI/Bank/Card) within 24-48 business hours.`;
    quickActions = ['Check Refund Status', 'Report Payment Issue', 'Talk to Human'];
  }
  // 4. Missing or Damaged product
  else if (msg.includes('missing') || msg.includes('damaged') || msg.includes('wrong') || msg.includes('kharab') || msg.includes('nahi mila')) {
    replyText = userLanguage === 'HINGLISH'
      ? `Kharab ya missing item ke liye hum aapse kshama chahte hain. Maine aapse related ek High-Priority Support Ticket raise kar di hai. Human Agent aapse jald hi contact karega.`
      : `We sincerely apologize for the missing or damaged product. I have created an urgent Support Ticket for you. A customer support agent will assist you shortly.`;
    shouldEscalate = true;
    confidence = 0.80;
  }
  // 5. Coupons / Offers
  else if (msg.includes('coupon') || msg.includes('offer') || msg.includes('discount') || msg.includes('code')) {
    replyText = `Use coupon code WELCOME50 at checkout to get ₹50 OFF on your first order above ₹199! Also use FREEDELIVERY for free delivery on orders above ₹500.`;
    quickActions = ['Apply Coupon', 'View Stores', 'Talk to Human'];
  }
  // 6. General / Fallback
  else {
    replyText = userLanguage === 'HINGLISH'
      ? `KiranaGo AI Support me aapka swagat hai! Main aapki order tracking, refund, ya store delivery issue me kaise madad kar sakta hoon?`
      : `Hello! I am KiranaGo AI Support. How can I assist you today with order tracking, store delivery, refunds, or coupons?`;
  }

  return { replyText, quickActions, confidence, shouldEscalate };
}

exports.chatWithAI = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');
    const { message, orderId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const userOrders = await ordersCol.find({ userId });
    const userLang = detectLanguage(message);

    const { replyText, quickActions, confidence, shouldEscalate } = generateAIResponse(message, userOrders, userLang);

    // Save or update conversation history
    let convo = await aiConvosCol.findOne({ userId });
    if (!convo) {
      convo = await aiConvosCol.insertOne({
        userId,
        customerName: req.user ? req.user.name : 'Customer',
        messages: [],
        confidence: 0.95,
        escalated: false
      });
    }

    const updatedMessages = [
      ...(convo.messages || []),
      { sender: 'user', text: message, timestamp: new Date() },
      { sender: 'ai', text: replyText, timestamp: new Date() }
    ];

    let ticketId = null;

    if (shouldEscalate) {
      const newTicket = await ticketsCol.insertOne({
        ticketId: 'TKT' + Math.floor(100000 + Math.random() * 900000),
        userId,
        userName: req.user ? req.user.name : 'Customer',
        userEmail: req.user ? req.user.email : 'customer@example.com',
        subject: `AI Support Escalation: ${message.substring(0, 40)}`,
        message,
        status: 'OPEN',
        priority: 'HIGH'
      });
      ticketId = newTicket.ticketId;
    }

    await aiConvosCol.updateOne({ _id: convo._id || convo.id }, {
      messages: updatedMessages,
      confidence,
      escalated: convo.escalated || shouldEscalate,
      ticketId: ticketId || convo.ticketId
    });

    res.json({
      success: true,
      reply: replyText,
      quickActions,
      confidence,
      escalated: shouldEscalate,
      ticketId,
      language: userLang
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAIConversations = async (req, res) => {
  try {
    const convos = await aiConvosCol.find({});
    res.json({ success: true, count: convos.length, conversations: convos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.takeoverAIConversation = async (req, res) => {
  try {
    const { userId, adminReply } = req.body;

    const convo = await aiConvosCol.findOne({ userId });
    if (!convo) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const updatedMessages = [
      ...(convo.messages || []),
      { sender: 'agent', text: adminReply, timestamp: new Date() }
    ];

    await aiConvosCol.updateOne({ userId }, {
      messages: updatedMessages,
      status: 'AGENT_TAKEOVER'
    });

    res.json({ success: true, message: 'Admin reply sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
