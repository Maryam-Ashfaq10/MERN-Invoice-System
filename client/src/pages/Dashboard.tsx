// client/src/pages/Dashboard.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

const cards = [
  { label: 'Total Revenue', value: '$24,600' },
  { label: 'Outstanding', value: '$6,240' },
  { label: 'Paid This Month', value: '$9,180' },
  { label: 'Overdue Invoices', value: '8' },
]

const Dashboard = () => {
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

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {card.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {card.value}
                </Typography>
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
