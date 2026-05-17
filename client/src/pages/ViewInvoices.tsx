import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

type Invoice = {
  _id: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  currency: string
  status: InvoiceStatus
  dueDate: string
  totalAmount: number
  createdAt: string
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function statusColor(
  status: InvoiceStatus
): 'default' | 'info' | 'success' | 'error' {
  switch (status) {
    case 'sent':
      return 'info'
    case 'paid':
      return 'success'
    case 'overdue':
      return 'error'
    default:
      return 'default'
  }
}

const Invoices = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadInvoices = useCallback(async () => {
    const token = localStorage.getItem('token')
    const userId = getUserIdFromToken()

    if (!token || !userId) {
      setError('You must be logged in to view invoices.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoice/get-all/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to load invoices')
      }

      setInvoices(Array.isArray(data.data) ? data.data : [])
    } catch (err) {
      setInvoices([])
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Invoices
          </Typography>
          <Typography color="text.secondary">
            All invoices you have created.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoice/new')}
        >
          Create invoice
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadInvoices}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 && !error ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Typography variant="h6" gutterBottom>
              No invoices yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Create your first invoice to see it here.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/invoice/new')}>
              Create invoice
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Due date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {inv.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inv.customerEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status}
                        size="small"
                        color={statusColor(inv.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatAmount(inv.totalAmount, inv.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Stack>
  )
}

export default Invoices