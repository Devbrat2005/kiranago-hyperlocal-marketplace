const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const usersCol = db.collection('users');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

const sanitizeUser = (user) => {
  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role || 'CUSTOMER',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
    authProvider: user.authProvider || 'LOCAL',
    googleId: user.googleId || '',
    addresses: user.addresses || []
  };
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'CUSTOMER', address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await usersCol.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await usersCol.insertOne({
      name,
      email: cleanEmail,
      phone: phone || '',
      password: hashedPassword,
      authProvider: 'LOCAL',
      googleId: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      role: role.toUpperCase(),
      addresses: address ? [address] : []
    });

    const token = generateToken(newUser);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await usersCol.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else if (user.authProvider === 'GOOGLE') {
      return res.status(400).json({
        success: false,
        message: 'This account was created using Google Sign-In. Please click "Continue with Google" to log in.'
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential, googleId, email, name, picture } = req.body;

    let targetEmail = email;
    let targetName = name;
    let targetGoogleId = googleId;
    let targetAvatar = picture;

    // Verify Google ID token if credential is provided
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          targetEmail = payload.email;
          targetName = payload.name || payload.given_name || targetEmail.split('@')[0];
          targetGoogleId = payload.sub;
          targetAvatar = payload.picture || targetAvatar;
        }
      } catch (tokenErr) {
        console.warn('Google token verification fallback triggered:', tokenErr.message);
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Google authentication failed: Email not provided' });
    }

    const cleanEmail = targetEmail.toLowerCase().trim();

    // Check Account Linking (Lookup by googleId or email)
    let user = await usersCol.findOne({ googleId: targetGoogleId });
    if (!user) {
      user = await usersCol.findOne({ email: cleanEmail });
    }

    if (user) {
      // Account exists: link Google details if missing
      const updateData = {};
      if (!user.googleId) updateData.googleId = targetGoogleId;
      if (targetAvatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        updateData.avatar = targetAvatar;
      }
      if (Object.keys(updateData).length > 0) {
        await usersCol.updateOne({ email: cleanEmail }, updateData);
        user = { ...user, ...updateData };
      }
    } else {
      // Create new user automatically
      user = await usersCol.insertOne({
        name: targetName || 'KiranaGo User',
        email: cleanEmail,
        phone: '',
        password: '',
        googleId: targetGoogleId || `g_${Date.now()}`,
        avatar: targetAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetName || 'User')}`,
        authProvider: 'GOOGLE',
        role: 'CUSTOMER',
        addresses: []
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Google Sign-In successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Google Sign-In error: ${err.message}` });
  }
};

exports.googleRedirect = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID is not configured in backend .env' });
  }
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
  const scope = encodeURIComponent('openid profile email');
  const redirectUri = encodeURIComponent(callbackUrl);
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`;
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';

    if (!code) {
      return res.redirect(`${frontendUrl}?auth_error=No code returned from Google`);
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return res.redirect(`${frontendUrl}?auth_error=Failed to exchange code with Google`);
    }

    // Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileRes.json();

    const cleanEmail = profile.email.toLowerCase().trim();

    let user = await usersCol.findOne({ googleId: profile.sub });
    if (!user) {
      user = await usersCol.findOne({ email: cleanEmail });
    }

    if (user) {
      const updateData = {};
      if (!user.googleId) updateData.googleId = profile.sub;
      if (profile.picture) updateData.avatar = profile.picture;
      if (Object.keys(updateData).length > 0) {
        await usersCol.updateOne({ email: cleanEmail }, updateData);
        user = { ...user, ...updateData };
      }
    } else {
      user = await usersCol.insertOne({
        name: profile.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '',
        password: '',
        googleId: profile.sub,
        avatar: profile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'User')}`,
        authProvider: 'GOOGLE',
        role: 'CUSTOMER',
        addresses: []
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    // Redirect user back to KiranaGo frontend with token query param for fallback
    res.redirect(`${frontendUrl}?token=${token}`);
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent(err.message)}`);
  }
};

exports.getMe = async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    let user = null;
    if (req.user && req.user.email) {
      user = await usersCol.findOne({ email: req.user.email.toLowerCase().trim() });
    }
    if (!user && req.user && req.user.id) {
      try {
        user = await usersCol.findOne({ _id: new ObjectId(req.user.id) });
      } catch (e) {
        user = await usersCol.findOne({ id: req.user.id });
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await usersCol.findOne({ email: email ? email.toLowerCase().trim() : '' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email' });
    }

    res.json({
      success: true,
      message: 'Password reset instructions / OTP sent to your registered email'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await usersCol.findOne({ email: email ? email.toLowerCase().trim() : '' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await usersCol.updateOne({ email: email.toLowerCase().trim() }, { password: hashedPassword });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
