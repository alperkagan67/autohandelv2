import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import VehicleList from './VehicleList';
import VehicleForm from './VehicleForm';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
  };

  const handleSubmit = (vehicleData) => {
    if (selectedVehicle) {
      // Edit existing vehicle
      setVehicles(prev =>
        prev.map(v => v.id === selectedVehicle.id ? { ...vehicleData, id: v.id } : v)
      );
    } else {
      // Add new vehicle
      setVehicles(prev => [...prev, { ...vehicleData, id: Date.now() }]);
    }
    setFormOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Fahrzeugverwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddVehicle}
        >
          Fahrzeug hinzufügen
        </Button>
      </Box>

      <VehicleList
        vehicles={vehicles}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
      />

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {selectedVehicle ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}
            </Typography>
            <IconButton onClick={() => setFormOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <VehicleForm
            vehicle={selectedVehicle}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default VehicleManagement;