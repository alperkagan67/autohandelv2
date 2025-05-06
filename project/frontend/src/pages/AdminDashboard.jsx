import { useState } from 'react'
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  Paper
} from '@mui/material'
import CustomerForms from '../components/admin/CustomerForms'
import VehicleManagement from '../components/admin/VehicleManagement'
import VehicleInquiries from '../components/admin/VehicleInquiries'

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 4 }}
      >
        Admin Dashboard
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Fahrzeugverwaltung" />
          <Tab label="Kundenformulare" />
          <Tab label="Anfragen" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {currentTab === 0 && <VehicleManagement />}
        {currentTab === 1 && <CustomerForms />}
        {currentTab === 2 && <VehicleInquiries />}
      </Box>
    </Container>
  )
}

export default AdminDashboard