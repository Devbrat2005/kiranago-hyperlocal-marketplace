const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'CONV_' + Math.random().toString(36).substring(2, 9).toUpperCase()
  },
  userId: { type: String, default: 'guest' },
  userName: { type: String, default: 'Customer' },
  userEmail: { type: String, default: '' },
  messages: [{
    sender: { type: String, enum: ['user', 'ai', 'agent'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['BOT_ACTIVE', 'AGENT_TAKEOVER', 'CLOSED'], default: 'BOT_ACTIVE' },
  assignedAgent: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIConversation', aiConversationSchema);
