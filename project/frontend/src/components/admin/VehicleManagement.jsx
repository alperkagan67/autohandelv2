import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import VehicleList from './VehicleManagement/VehicleList';
import VehicleForm from './VehicleManagement/VehicleForm';
import { useVehicles } from '../../hooks/useVehicles';

function VehicleManagement() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, loading, error } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten?')) {
      try {
        await deleteVehicle(vehicle.id);
        showSnackbar('Fahrzeug erfolgreich gelöscht', 'success');
      } catch (error) {
        showSnackbar('Fehler beim Löschen des Fahrzeugs', 'error');
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (vehicleData, images) => {
    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, vehicleData);
        showSnackbar('Fahrzeug erfolgreich aktualisiert');
      } else {
        await addVehicle(vehicleData, images);
        showSnackbar('Fahrzeug erfolgreich hinzugefügt');
      }
      setFormOpen(false);
    } catch (error) {
      showSnackbar(error.message || 'Fehler beim Speichern des Fahrzeugs', 'error');
      console.error('Error saving vehicle:', error);
      throw error;
    }
  };

  const handleCloseForm = () => {
    if (window.confirm('Sind Sie sicher, dass Sie das Formular schließen möchten? Nicht gespeicherte Änderungen gehen verloren.')) {
      setFormOpen(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Fahrzeuge: {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Fahrzeugverwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddVehicle}
          aria-label="Fahrzeug hinzufügen"
        >
          Fahrzeug hinzufügen
        </Button>
      </Box>

      <VehicleList
        vehicles={vehicles}
        loading={loading}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
      />

      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        keepMounted={false}
        aria-labelledby="vehicle-dialog-title"
      >
        <DialogTitle id="vehicle-dialog-title">
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 1
          }}>
            <Typography variant="h6">
              {selectedVehicle ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}
            </Typography>
            <IconButton
              onClick={handleCloseForm}
              size="small"
              aria-label="Dialog schließen"
              sx={{
                '&:focus': {
                  outline: 'none'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <VehicleForm
            vehicle={selectedVehicle}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default VehicleManagement; 