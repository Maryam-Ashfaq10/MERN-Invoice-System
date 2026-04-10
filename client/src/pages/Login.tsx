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

type LoginForm = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginForm, string>>

const initialForm: LoginForm = {
  email: '',
  password: '',
}

const Login = () => {
  const [form, setForm] = useState<LoginForm>(initialForm)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')

  const handleChange =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
      setApiError('')
      setSuccessMessage('')
    }

  const validate = (): LoginErrors => {
    const nextErrors: LoginErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
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

      // Replace this mock with your real API call
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, { ... })
      await new Promise((resolve) => setTimeout(resolve, 900))

      setSuccessMessage('Login successful.')
      setForm(initialForm)
    } catch {
      setSuccessMessage('')
      setApiError('Invalid credentials. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome 
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Log in to access your account.
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack spacing={2}>
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
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              {submitting ? 'Logging in...' : 'Log In'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login