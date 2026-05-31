import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { EditOutlined } from '@mui/icons-material'
import { getAuthHeaders, getUserIdFromToken } from '../lib/auth'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

type Invoice = {
    _id: string
    invoiceNumber: string
    customerName: string
    customerEmail: string
    customerPhone: string
    currency: string
    status: InvoiceStatus
    dueDate: string
    totalAmount: number
    createdAt: string
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

type EditForm = {
    customerName: string
    customerEmail: string
    customerPhone: string
    status: InvoiceStatus
    dueDate: string
}

const Invoices = () => {
    const navigate = useNavigate()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null)
    const [editForm, setEditForm] = useState<EditForm | null>(null)
    const [saving, setSaving] = useState(false)
    const [editError, setEditError] = useState('')

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
                { headers: getAuthHeaders() }
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

    const handleDeleteConfirm = async () => {
        if (!invoiceToDelete) return

        const userId = getUserIdFromToken()
        if (!userId) {
            setDeleteError('You must be logged in to delete an invoice.')
            return
        }

        try {
            setDeleting(true)
            setDeleteError('')

            const encoded = encodeURIComponent(invoiceToDelete.invoiceNumber)
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/invoice/soft-delete/${encoded}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ userId }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message ?? 'Failed to delete invoice')
            }

            // Remove row from UI without full reload
            setInvoices((prev) =>
                prev.filter((inv) => inv._id !== invoiceToDelete._id)
            )
            setInvoiceToDelete(null)
        } catch (err) {
            setDeleteError(
                err instanceof Error ? err.message : 'Could not delete invoice.'
            )
        } finally {
            setDeleting(false)
        }
    }

    const closeEditModal = () => {
        setInvoiceToEdit(null)
        setEditForm(null)
        setEditError('')
    }

    const openEditModal = (inv: Invoice) => {
        setEditError('')
        setInvoiceToEdit(inv)
        setEditForm({
            customerName: inv.customerName,
            customerEmail: inv.customerEmail,
            customerPhone: inv.customerPhone ?? '',
            status: inv.status,
            dueDate: inv.dueDate.slice(0, 10),
        })
    }

    const handleEditFieldChange =
        (field: keyof EditForm) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!editForm) return
                setEditForm((prev) =>
                    prev ? { ...prev, [field]: e.target.value } : prev
                )
                setEditError('')
            }

    const handleEditSave = async () => {
        if (!invoiceToEdit || !editForm) return

        const userId = getUserIdFromToken()
        if (!userId) {
            setEditError('You must be logged in to update an invoice.')
            return
        }

        // Optional: reuse validation from CreateInvoice (name, email, due date)
        try {
            setSaving(true)
            setEditError('')

            const encoded = encodeURIComponent(invoiceToEdit.invoiceNumber)
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/invoice/update/${encoded}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        userId,
                        customerName: editForm.customerName.trim(),
                        customerEmail: editForm.customerEmail.trim(),
                        customerPhone: editForm.customerPhone.trim(),
                        status: editForm.status,
                        dueDate: editForm.dueDate,
                    }),
                }
            )

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message ?? 'Failed to update invoice')
            }

            // Update row in place — same pattern as delete filtering
            setInvoices((prev) =>
                prev.map((inv) =>
                    inv._id === invoiceToEdit._id ? { ...inv, ...data.data } : inv
                )
            )
            closeEditModal()
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Could not update invoice.')
        } finally {
            setSaving(false)
        }
    }

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
                                    <TableCell align="right">Actions</TableCell>
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
                                        <TableCell align="right">
                                            <Tooltip title="Delete invoice">
                                                <span>
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        aria-label={`Delete ${inv.invoiceNumber}`}
                                                        onClick={() => {
                                                            setDeleteError('')
                                                            setInvoiceToDelete(inv)
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Edit invoice">
                                                <span>
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        aria-label={`Edit ${inv.invoiceNumber}`}
                                                        onClick={() => openEditModal(inv)}
                                                    >
                                                        <EditOutlined fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
            <Dialog
                open={Boolean(invoiceToDelete)}
                onClose={() => !deleting && setInvoiceToDelete(null)}
            >
                <DialogTitle>Delete invoice?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will remove invoice{' '}
                        <strong>{invoiceToDelete?.invoiceNumber}</strong> for{' '}
                        <strong>{invoiceToDelete?.customerName}</strong>. This action cannot be
                        undone from the app.
                    </DialogContentText>
                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInvoiceToDelete(null)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(invoiceToEdit && editForm)}
                onClose={() => !saving && closeEditModal()}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Edit invoice {invoiceToEdit?.invoiceNumber}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Amount:{' '}
                            {invoiceToEdit &&
                                formatAmount(
                                    invoiceToEdit.totalAmount,
                                    invoiceToEdit.currency
                                )}
                        </Typography>

                        <TextField
                            label="Customer name"
                            value={editForm?.customerName ?? ''}
                            onChange={handleEditFieldChange('customerName')}
                            fullWidth
                            required
                            disabled={saving}
                        />
                        <TextField
                            label="Customer email"
                            type="email"
                            value={editForm?.customerEmail ?? ''}
                            onChange={handleEditFieldChange('customerEmail')}
                            fullWidth
                            required
                            disabled={saving}
                        />
                        <TextField
                            label="Customer phone"
                            value={editForm?.customerPhone ?? ''}
                            onChange={handleEditFieldChange('customerPhone')}
                            fullWidth
                            required
                            disabled={saving}
                        />
                        <TextField
                            select
                            label="Status"
                            value={editForm?.status ?? 'draft'}
                            onChange={handleEditFieldChange('status')}
                            fullWidth
                            required
                            disabled={saving}
                        >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="sent">Sent</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="overdue">Overdue</MenuItem>
                        </TextField>
                        <TextField
                            label="Due date"
                            type="date"
                            value={editForm?.dueDate ?? ''}
                            onChange={handleEditFieldChange('dueDate')}
                            fullWidth
                            required
                            disabled={saving}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    {editError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {editError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditModal} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}

export default Invoices