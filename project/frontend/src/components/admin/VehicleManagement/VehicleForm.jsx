import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageUpload from '../../shared/ImageUpload';

const FUEL_TYPES = ['Benzin', 'Diesel', 'Elektro', 'Hybrid', 'Plug-in-Hybrid', 'Gas'];
const TRANSMISSION_TYPES = ['Automatik', 'Schaltgetriebe'];
const STATUS_OPTIONS = ['available', 'reserved', 'sold'];

function VehicleForm({ vehicle, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(vehicle || {
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    power: '',
    description: '',
    features: [],
    images: [],
    status: 'available'
  });
  const [newFeature, setNewFeature] = useState('');
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset error when user types
    setError(null);
  };

  const handleImageAdd = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleImageDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const requiredFields = ['brand', 'model', 'year', 'price', 'mileage', 'fuelType', 'transmission', 'power'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Bitte füllen Sie alle Pflichtfelder aus: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Validate numeric fields
    const numericFields = ['year', 'price', 'mileage'];
    for (const field of numericFields) {
      if (isNaN(Number(formData[field])) || Number(formData[field]) <= 0) {
        setError(`${field} muss eine gültige positive Zahl sein`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) {
        return;
      }

      // Prepare vehicle data
      const vehicleData = {
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        power: formData.power,
        description: formData.description,
        status: formData.status,
        features: formData.features
      };

      console.log('Submitting vehicle data:', vehicleData);
      console.log('Images to upload:', formData.images);

      // Call parent onSubmit with prepared data
      await onSubmit(vehicleData, formData.images);
      
      setSnackbarOpen(true);
      // Reset form after successful submission
      if (!vehicle) { // Only reset if it's a new vehicle
        setFormData({
          brand: '',
          model: '',
          year: '',
          price: '',
          mileage: '',
          fuelType: '',
          transmission: '',
          power: '',
          description: '',
          features: [],
          images: [],
          status: 'available'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Fehler beim Speichern des Fahrzeugs');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Rest of the form fields remain the same */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Grundinformationen
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Marke"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              error={error && !formData.brand}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Modell"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              error={error && !formData.model}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Baujahr"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              error={error && (!formData.year || isNaN(Number(formData.year)))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Preis"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              error={error && (!formData.price || isNaN(Number(formData.price)))}
              InputProps={{
                endAdornment: '€'
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Technische Daten
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Kilometerstand"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleInputChange}
              error={error && (!formData.mileage || isNaN(Number(formData.mileage)))}
              InputProps={{
                endAdornment: 'km'
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Leistung"
              name="power"
              placeholder="z.B. 150 PS"
              value={formData.power}
              onChange={handleInputChange}
              error={error && !formData.power}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              select
              label="Kraftstoff"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              error={error && !formData.fuelType}
            >
              {FUEL_TYPES.map(fuel => (
                <MenuItem key={fuel} value={fuel}>
                  {fuel}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              select
              label="Getriebe"
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              error={error && !formData.transmission}
            >
              {TRANSMISSION_TYPES.map(transmission => (
                <MenuItem key={transmission} value={transmission}>
                  {transmission}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {STATUS_OPTIONS.map(status => (
                <MenuItem key={status} value={status}>
                  {status === 'available' ? 'Verfügbar' :
                    status === 'reserved' ? 'Reserviert' : 'Verkauft'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Beschreibung
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Beschreibung"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detaillierte Beschreibung des Fahrzeugs..."
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Ausstattungsmerkmale
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Neues Merkmal hinzufügen"
                size="small"
                sx={{ mr: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddFeature}
                startIcon={<AddIcon />}
              >
                Hinzufügen
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  onDelete={() => handleRemoveFeature(index)}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Bilder
            </Typography>
            <ImageUpload
              images={formData.images}
              onImageAdd={handleImageAdd}
              onImageDelete={handleImageDelete}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={onCancel}>
                Abbrechen
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {vehicle ? 'Speichern' : 'Hinzufügen'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="Fahrzeug erfolgreich gespeichert"
      />
    </Paper>
  );
}

export default VehicleForm;