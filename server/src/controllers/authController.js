import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/** Failures farther apart than this start a new streak (not counted toward lockout). */
const STREAK_GAP_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

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

function validateSignupInput(name, email, password, phone, country, companyName) {
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

        const { name, email, password, phone, country, companyName } = req.body;
        const validationError = validateSignupInput(
            name,
            email,
            password,
            phone,
            country,
            companyName
        );
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
            phone: phone.trim(),
            country: country.trim(),
            companyName: companyName.trim(),
        });

        return res.status(201).json(buildAuthResponse(user));
    } catch (error) {
        console.log(error);
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

        const now = Date.now();
        if (user.lockoutUntil && user.lockoutUntil.getTime() > now) {
            const retryAfterSec = Math.ceil((user.lockoutUntil.getTime() - now) / 1000);
            return res.status(429).json({
                success: false,
                message:
                    'Too many failed login attempts. Try again in a few minutes.',
                retryAfterSeconds: retryAfterSec,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const lastFail = user.lastFailedLoginAt
                ? user.lastFailedLoginAt.getTime()
                : null;
            const streakExpired =
                lastFail == null || now - lastFail > STREAK_GAP_MS;
            const previousAttempts = user.failedLoginAttempts ?? 0;
            const newAttempts = streakExpired ? 1 : previousAttempts + 1;
            const locked = newAttempts >= MAX_FAILED_ATTEMPTS;
            const lockoutUntil = locked ? new Date(now + LOCKOUT_MS) : null;

            await User.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        failedLoginAttempts: newAttempts,
                        lastFailedLoginAt: new Date(now),
                        lockoutUntil,
                    },
                }
            );

            if (locked) {
                return res.status(429).json({
                    success: false,
                    message:
                        'Too many failed login attempts. Account locked for 15 minutes.',
                    retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        await User.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    failedLoginAttempts: 0,
                    lastFailedLoginAt: null,
                    lockoutUntil: null,
                },
            }
        );

        return res.status(200).json(buildAuthResponse(user));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to login',
        });
    }
}
