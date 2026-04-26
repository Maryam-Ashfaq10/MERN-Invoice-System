// client/src/layouts/AppLayout.tsx
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PeopleIcon from '@mui/icons-material/People'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import PaymentsIcon from '@mui/icons-material/Payments'
import AssessmentIcon from '@mui/icons-material/Assessment'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LogoutIcon from '@mui/icons-material/Logout'

const drawerWidth = 260

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Invoices', path: '/invoices', icon: <ReceiptLongIcon /> },
  { label: 'Customers', path: '/customers', icon: <PeopleIcon /> },
  { label: 'Products', path: '/products', icon: <Inventory2Icon /> },
  { label: 'Payments', path: '/payments', icon: <PaymentsIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
]

const AppLayout = () => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const pageTitle = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.path))
    return found?.label ?? 'Invoicing System'
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          InvoicePro
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { lg: `${drawerWidth}px` },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isDesktop && (
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700}>
              {pageTitle}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar sx={{ width: 34, height: 34 }}>A</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { lg: `${drawerWidth}px` },
          p: { xs: 2, md: 3 },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default AppLayout