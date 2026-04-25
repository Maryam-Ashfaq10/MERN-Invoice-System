import { Container, Paper, Typography } from '@mui/material'

const Dashboard = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
        <h2>Invoicing System</h2>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Login successful. Welcome to your invoicing dashboard.
        </Typography>
      </Paper>
    </Container>
  )
}

export default Dashboard