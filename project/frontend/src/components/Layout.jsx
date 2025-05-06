import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Box } from '@mui/material'

function Layout() {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    )
}

export default Layout 