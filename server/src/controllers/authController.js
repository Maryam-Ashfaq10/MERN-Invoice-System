import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function buildAuthResponse(user) {
    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    };
}

function validateSignupInput(name, email, password) {
    if (!name || !email || !password || !phone || !country || !companyName) {
        return 'name, email, password, phone, country and companyName are required';
    }
    if (!EMAIL_REGEX.test(email)) {
        return 'Please enter a valid email address';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    return null;
}

function validateLoginInput(email, password) {
    if (!email || !password) {
        return 'email and password are required';
    }
    if (!EMAIL_REGEX.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
}

export async function signup(req, res) {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'JWT secret is not configured',
            });
        }

        const { name, email, password } = req.body;
        const validationError = validateSignupInput(name, email, password);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        return res.status(201).json(buildAuthResponse(user));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create account',
        });
    }
}

export async function login(req, res) {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'JWT secret is not configured',
            });
        }

        const { email, password } = req.body;
        const validationError = validateLoginInput(email, password);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        return res.status(200).json(buildAuthResponse(user));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to login',
        });
    }
}
