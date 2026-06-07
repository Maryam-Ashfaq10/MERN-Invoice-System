import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { getAuthHeaders, getUserIdFromToken } from '../lib/auth'

type InvoiceStats = {
  total: number
  draft: number
  sent: number
  paid: number
}

const statCards: { key: keyof InvoiceStats; label: string }[] = [
  { key: 'total', label: 'Total Invoices' },
  { key: 'draft', label: 'Draft Invoices' },
  { key: 'sent', label: 'Sent Invoices' },
  { key: 'paid', label: 'Paid Invoices' },
]

const Dashboard = () => {
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    const token = localStorage.getItem('token')
    const userId = getUserIdFromToken()

    if (!token || !userId) {
      setError('You must be logged in to view dashboard stats.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoice/stats/${userId}`,
        { headers: getAuthHeaders() }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to load dashboard stats')
      }

      setStats(data.data ?? null)
    } catch (err) {
      setStats(null)
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Welcome back
        </Typography>
        <Typography color="text.secondary">
          Here is an overview of your invoicing activity.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {card.label}
                </Typography>
                {loading ? (
                  <CircularProgress size={28} sx={{ mt: 1 }} />
                ) : (
                  <Typography variant="h5" fontWeight={700}>
                    {stats?.[card.key] ?? 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Recent Invoices
            </Typography>
            <Typography color="text.secondary">
              Table placeholder (invoice no, client, due date, status, amount).
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={1.5}>
              <Button variant="contained">Create Invoice</Button>
              <Button variant="outlined">Add Customer</Button>
              <Button variant="outlined">Record Payment</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default Dashboard
