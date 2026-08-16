const { db } = require('../config/db');

const ticketsCol = db.collection('support_tickets');

exports.createTicket = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');
    const { category, subject, orderId, message } = req.body;

    const ticketId = 'TKT' + Math.floor(100000 + Math.random() * 900000);

    const newTicket = await ticketsCol.insertOne({
      ticketId,
      userId,
      userName: req.user ? req.user.name : 'Customer',
      userEmail: req.user ? req.user.email : 'customer@example.com',
      category: category || 'Order Issue',
      subject: subject || 'Customer Inquiry',
      message: message || 'I need support with my order.',
      status: 'OPEN', // OPEN, IN_PROGRESS, RESOLVED, CLOSED
      responses: [{ sender: 'user', message: message || 'I need support with my order.', timestamp: new Date() }]
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

    let tickets = await ticketsCol.find({});
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

    const ticket = (await ticketsCol.findOne({ ticketId: id })) || (await ticketsCol.findById(id));
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const updatedResponses = [...(ticket.responses || [])];
    if (replyMessage) {
      updatedResponses.push({
        sender: 'admin',
        message: replyMessage,
        timestamp: new Date()
      });
    }

    const updated = await ticketsCol.updateOne({ _id: ticket._id || ticket.id }, {
      status,
      responses: updatedResponses
    });

    res.json({ success: true, message: `Ticket status updated to ${status}`, ticket: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
