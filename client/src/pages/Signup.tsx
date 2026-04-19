import { useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

type SignupForm = {
    fullName: string
    email: string
    phone: string
    country: string
    companyName: string
    password: string
    confirmPassword: string
}

type SignupErrors = Partial<Record<keyof SignupForm, string>>

const initialForm: SignupForm = {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    companyName: '',
    password: '',
    confirmPassword: '',
}

const Signup = () => {
    const [form, setForm] = useState<SignupForm>(initialForm)
    const [errors, setErrors] = useState<SignupErrors>({})
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [apiError, setApiError] = useState('')


    const handleChange =
        (field: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
            setErrors((prev) => ({ ...prev, [field]: '' }))
            setSuccessMessage('')
        }

    const validate = (): SignupErrors => {
        const nextErrors: SignupErrors = {}

        if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.'
        if (!form.email.trim()) {
            nextErrors.email = 'Email is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = 'Enter a valid email address.'
        }

        if (!form.phone.trim()) {
            nextErrors.phone = 'Phone number is required.'
        } else if (!/^\d{10,15}$/.test(form.phone.replace(/\s+/g, ''))) {
            nextErrors.phone = 'Enter a valid phone number (10-15 digits).'
        }

        if (!form.companyName.trim()) {
            nextErrors.companyName = 'Company name is required.'
        }

        if (!form.password) {
            nextErrors.password = 'Password is required.'
        } else if (form.password.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters.'
        }

        if (!form.confirmPassword) {
            nextErrors.confirmPassword = 'Please confirm your password.'
        } else if (form.confirmPassword !== form.password) {
            nextErrors.confirmPassword = 'Passwords do not match.'
        }

        return nextErrors
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const validationErrors = validate()
        setErrors(validationErrors)
        if (Object.keys(validationErrors).length > 0) return

        try {
            setSubmitting(true)
            setApiError('')

            // Replace with your real API call
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.fullName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    phone: form.phone.trim(),
                    country: form.country.trim(),
                    companyName: form.companyName.trim(),
                  }),
            })
            if (!response.ok) {
                throw new Error('Failed to create account')
            }
            const data = await response.json()
            console.log(data)

            if (data.token) {
                localStorage.setItem('token', data.token)
              }

            setSuccessMessage('Account created successfully.')
            setForm(initialForm)
        } catch {
            setSuccessMessage('')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Fill in your details to sign up.
                </Typography>

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Full Name"
                            value={form.fullName}
                            onChange={handleChange('fullName')}
                            error={Boolean(errors.fullName)}
                            helperText={errors.fullName}
                            fullWidth
                            required
                            autoComplete="name"
                        />

                        <TextField
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={handleChange('email')}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                            fullWidth
                            required
                            autoComplete="email"
                        />

                        <TextField
                            label="Phone Number"
                            value={form.phone}
                            onChange={handleChange('phone')}
                            error={Boolean(errors.phone)}
                            helperText={errors.phone}
                            fullWidth
                            required
                            autoComplete="tel"
                        />

                        <TextField
                            label="Country"
                            value={form.country}
                            onChange={handleChange('country')}
                            error={Boolean(errors.country)}
                            helperText={errors.country}
                            fullWidth
                            required
                            autoComplete="country"
                        />

                        <TextField
                            label="Company Name"
                            value={form.companyName}
                            onChange={handleChange('companyName')}
                            error={Boolean(errors.companyName)}
                            helperText={errors.companyName}
                            fullWidth
                            required
                            autoComplete="organization"
                        />

                        <TextField
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={handleChange('password')}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                            fullWidth
                            required
                            autoComplete="new-password"
                        />

                        <TextField
                            label="Confirm Password"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            error={Boolean(errors.confirmPassword)}
                            helperText={errors.confirmPassword}
                            fullWidth
                            required
                            autoComplete="new-password"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    )
}

export default Signup