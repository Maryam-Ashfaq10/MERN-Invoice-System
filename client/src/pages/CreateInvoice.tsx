import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Divider,
    Grid,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

const CURRENCIES = [
    { code: 'PKR', label: 'PKR — Pakistani Rupee' },
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'INR', label: 'INR — Indian Rupee' },
    { code: 'CAD', label: 'CAD — Canadian Dollar' },
    { code: 'AUD', label: 'AUD — Australian Dollar' },
] as const

const DEFAULT_STATUS = 'draft' as const

type CreateInvoiceForm = {
    customerName: string
    customerEmail: string
    customerPhone: string
    currency: string
    dueDate: string
    totalAmount: string
}

type FormErrors = Partial<Record<keyof CreateInvoiceForm, string>>

const initialForm: CreateInvoiceForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    currency: 'USD',
    dueDate: '',
    totalAmount: '',
}

function getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return typeof payload.userId === 'string' ? payload.userId : null
    } catch {
        return null
    }
}

const CreateInvoice = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState<CreateInvoiceForm>(initialForm)
    const [errors, setErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)
    const [apiError, setApiError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const handleChange =
        (field: keyof CreateInvoiceForm) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, [field]: e.target.value }))
                setErrors((prev) => ({ ...prev, [field]: '' }))
                setApiError('')
                setSuccessMessage('')
            }

    const validate = (): FormErrors => {
        const next: FormErrors = {}

        if (!form.customerName.trim()) {
            next.customerName = 'Customer name is required.'
        }

        if (!form.customerEmail.trim()) {
            next.customerEmail = 'Email is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
            next.customerEmail = 'Enter a valid email address.'
        }

        if (!form.customerPhone.trim()) {
            next.customerPhone = 'Phone number is required.'
        }

        if (!form.currency) {
            next.currency = 'Select a currency.'
        }

        if (!form.dueDate) {
            next.dueDate = 'Due date is required.'
        }

        const amount = Number(form.totalAmount)
        if (form.totalAmount === '' || Number.isNaN(amount)) {
            next.totalAmount = 'Enter a valid amount.'
        } else if (amount < 0) {
            next.totalAmount = 'Amount cannot be negative.'
        }

        return next
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const validationErrors = validate()
        setErrors(validationErrors)
        if (Object.keys(validationErrors).length > 0) return

        const token = localStorage.getItem('token')
        const userId = getUserIdFromToken()

        if (!token || !userId) {
            setApiError('You must be logged in to create an invoice.')
            return
        }

        try {
            setSubmitting(true)
            setApiError('')

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/invoice/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        customerName: form.customerName.trim(),
                        customerEmail: form.customerEmail.trim(),
                        customerPhone: form.customerPhone.trim(),
                        currency: form.currency,
                        status: DEFAULT_STATUS,
                        createdBy: userId,
                        dueDate: form.dueDate,
                        totalAmount: Number(form.totalAmount),
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message ?? 'Failed to create invoice')
            }

            const invoiceNumber = data?.data?.invoiceNumber ?? ''
            setSuccessMessage(
                invoiceNumber
                    ? `Invoice ${invoiceNumber} created successfully.`
                    : 'Invoice created successfully.'
            )
            setForm(initialForm)
        } catch (err) {
            setSuccessMessage('')
            setApiError(
                err instanceof Error ? err.message : 'Something went wrong. Try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Create invoice
                </Typography>
                <Typography color="text.secondary">
                    Enter customer and invoice details. New invoices are saved as drafts.
                </Typography>
            </Box>

            {successMessage && (
                <Alert severity="success">{successMessage}</Alert>
            )}
            {apiError && <Alert severity="error">{apiError}</Alert>}

            <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Customer
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Who is this invoice for?
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Customer name"
                            value={form.customerName}
                            onChange={handleChange('customerName')}
                            error={Boolean(errors.customerName)}
                            helperText={errors.customerName}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Customer email"
                            type="email"
                            value={form.customerEmail}
                            onChange={handleChange('customerEmail')}
                            error={Boolean(errors.customerEmail)}
                            helperText={errors.customerEmail}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Customer phone"
                            value={form.customerPhone}
                            onChange={handleChange('customerPhone')}
                            error={Boolean(errors.customerPhone)}
                            helperText={errors.customerPhone}
                            fullWidth
                            required
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Invoice details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Amount, currency, and due date.
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            label="Total amount"
                            type="number"
                            value={form.totalAmount}
                            onChange={handleChange('totalAmount')}
                            error={Boolean(errors.totalAmount)}
                            helperText={errors.totalAmount}
                            fullWidth
                            required
                            inputProps={{ min: 0, step: '0.01' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            select
                            label="Currency"
                            value={form.currency}
                            onChange={handleChange('currency')}
                            error={Boolean(errors.currency)}
                            helperText={errors.currency}
                            fullWidth
                            required
                        >
                            {CURRENCIES.map((c) => (
                                <MenuItem key={c.code} value={c.code}>
                                    {c.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            label="Due date"
                            type="date"
                            value={form.dueDate}
                            onChange={handleChange('dueDate')}
                            error={Boolean(errors.dueDate)}
                            helperText={errors.dueDate}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                min: new Date().toISOString().split('T')[0],
                            }}
                        />
                    </Grid>
                </Grid>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="flex-end"
                    sx={{ mt: 3 }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        disabled={submitting}
                        onClick={() => navigate('/dashboard')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? 'Creating…' : 'Create invoice'}
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    )
}

export default CreateInvoice