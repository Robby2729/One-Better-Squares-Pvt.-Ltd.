require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const propRoutes = require('./routes/propRoutes');
const errorHandler = require('./middleware/error');
const sendEmail = require('./utils/sendEmail');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Allow Cross-Origin requests
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// === OTP CONFIGURATION (Keeping your existing logic) ===
const otpStore = {};

app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[email] = { otp: otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const message = `Here is your login OTP: \n\n${otp}\n\nThis OTP is valid for 5 minutes.`;

    try {
        await sendEmail({
            email: email,
            subject: 'Your Login OTP',
            message,
            html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Login OTP</h2>
                    <p>Use the OTP below to log in.</p>
                    <h1 style="color: #D4AF37; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
                    <p style="color: #888;">This OTP is valid for 5 minutes.</p>
                   </div>`
        });

        res.status(200).json({ success: true, message: "OTP sent to your email." });
    } catch (err) {
        console.error(err);
        delete otpStore[email];
        return res.status(500).json({ error: 'Email could not be sent' });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const storedData = otpStore[email];
    if (!storedData) return res.status(400).json({ error: "No OTP found for this email. Please request a new one." });
    if (Date.now() > storedData.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (storedData.otp === otp) {
        delete otpStore[email];
        res.status(200).json({ success: true, message: "OTP verified correctly" });
    } else {
        res.status(400).json({ error: "Invalid OTP entered." });
    }
});
// ==========================

// API Routes
app.use('/api', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/properties', propRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Health Check Route
app.get('/', (req, res) => {
    res.send('API is running securely...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
