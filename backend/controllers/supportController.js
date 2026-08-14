const { db } = require('../config/db');

const ticketsCol = db.collection('support_tickets');

exports.createTicket = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');
    const { issueType, subject, orderId, message } = req.body;

    const ticketId = 'TKT' + Math.floor(100000 + Math.random() * 900000);

    const newTicket = ticketsCol.insertOne({
      ticketId,
      userId,
      userName: req.user ? req.user.name : 'Customer',
      userPhone: req.user ? req.user.phone : '9876543210',
      issueType: issueType || 'Order Issue',
      subject: subject || 'Customer Inquiry',
      orderId: orderId || 'N/A',
      status: 'OPEN', // OPEN, IN_PROGRESS, RESOLVED, CLOSED
      messages: [{ sender: 'USER', text: message || 'I need support with my order.', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Support ticket submitted successfully', ticket: newTicket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    const role = req.user ? req.user.role : 'CUSTOMER';

    let tickets = ticketsCol.find({});
    if (role === 'CUSTOMER' && userId) {
      tickets = tickets.filter(t => t.userId === userId);
    }

    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    const ticket = ticketsCol.findOne({ ticketId: id }) || ticketsCol.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const updatedMessages = [...(ticket.messages || [])];
    if (replyMessage) {
      updatedMessages.push({
        sender: 'ADMIN',
        text: replyMessage,
        timestamp: new Date().toISOString()
      });
    }

    const updated = ticketsCol.updateOne({ _id: ticket._id || ticket.id }, {
      status,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: `Ticket status updated to ${status}`, ticket: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
