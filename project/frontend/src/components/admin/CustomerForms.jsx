import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Alert,
  IconButton,
  Modal,
  Fade,
  Backdrop
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import CancelIcon from '@mui/icons-material/Cancel'
import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import CloseIcon from '@mui/icons-material/Close'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

const statusColors = {
  neu: 'success',
  in_bearbeitung: 'warning',
  abgeschlossen: 'info',
  abgelehnt: 'error'
}

const statusLabels = {
  neu: 'Neu',
  in_bearbeitung: 'In Bearbeitung',
  abgeschlossen: 'Abgeschlossen',
  abgelehnt: 'Abgelehnt'
}

function ImageWithFallback({ src, alt, onClick, ...props }) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
  }

  if (error) {
    return (
      <Box
        sx={{
          width: 200,
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius: 1,
          position: 'relative',
        }}
      >
        <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.500' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={onClick}>
      <Box
        component="img"
        src={src}
        alt={alt}
        onError={handleError}
        sx={{
          width: 200,
          height: 150,
          objectFit: 'cover',
          borderRadius: 1,
          backgroundColor: 'grey.100',
          transition: 'filter 0.2s',
          '&:hover': {
            filter: 'brightness(0.9)',
          },
        }}
        {...props}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          transition: 'opacity 0.2s',
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        <ZoomInIcon sx={{ color: 'white', fontSize: 32 }} />
      </Box>
    </Box>
  )
}

function ImageViewer({ images, open, onClose, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const handlePrevious = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious(e)
    if (e.key === 'ArrowRight') handleNext(e)
    if (e.key === 'Escape') onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            height: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            position: 'relative',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <Box
              component="img"
              src={images[currentIndex]}
              alt={`Bild ${currentIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
            
            <IconButton
              sx={{
                position: 'absolute',
                left: 16,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'grey.200' },
              }}
              onClick={handlePrevious}
            >
              <NavigateBeforeIcon />
            </IconButton>
            
            <IconButton
              sx={{
                position: 'absolute',
                right: 16,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'grey.200' },
              }}
              onClick={handleNext}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
          
          <Typography sx={{ mt: 1, textAlign: 'center' }}>
            Bild {currentIndex + 1} von {images.length}
          </Typography>
        </Box>
      </Fade>
    </Modal>
  )
}

function CustomerForms() {
  const [forms, setForms] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedForm, setSelectedForm] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const loadForms = async () => {
      try {
        console.log('Starting to fetch forms...');
        const response = await fetch('http://localhost:3000/api/customer-forms');
        console.log('API Response:', response);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', {
          dataType: typeof data,
          isArray: Array.isArray(data),
          length: data.length,
          rawData: data
        });
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Sample form:', data[0]);
        }
        
        setForms(data);
      } catch (error) {
        console.error('Error loading forms:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        setForms([]);
      }
    };
    
    loadForms();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRowClick = (form) => {
    setSelectedForm(form)
    setDetailsOpen(true)
  }

  const handleStatusChange = async (formId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/customer-forms/${formId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setForms(prevForms => 
        prevForms.map(form => 
          form.id === formId ? { ...form, status: newStatus } : form
        )
      );
      setDetailsOpen(false);
    } catch (error) {
      console.error('Error updating form status:', error);
    }
  }

  const handleImageClick = (index) => {
    setSelectedImageIndex(index)
    setImageViewerOpen(true)
  }

  return (
    <>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Fahrzeug</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((form) => (
                  <TableRow 
                    key={form.id} 
                    hover
                    onClick={() => handleRowClick(form)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell>{new Date(form.created_at).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{form.customer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {form.vehicle_brand} {form.vehicle_model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.vehicle_year} • {form.vehicle_mileage?.toLocaleString()} km
                      </Typography>
                    </TableCell>
                    <TableCell>
                    <Chip
                      size="small"
                      label={statusLabels[form.status] || form.status}
                      color={statusColors[form.status] || 'default'}
                    />
                    </TableCell>
                  </TableRow>
                ))}
              {forms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Keine Kundenanfragen vorhanden
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={forms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Einträge pro Seite"
        />
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedForm && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography component="span">
                  Kundenformular Details
                </Typography>
                <Chip
                  size="small"
                  label={statusLabels[selectedForm.status]}
                  color={statusColors[selectedForm.status]}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Typography variant="subtitle1" gutterBottom>Kundendaten</Typography>
      <Typography><strong>Name:</strong> {selectedForm.customer_name}</Typography>
      <Typography><strong>E-Mail:</strong> {selectedForm.email}</Typography>
      <Typography><strong>Telefon:</strong> {selectedForm.phone}</Typography>
      <Typography><strong>Datum:</strong> {new Date(selectedForm.created_at).toLocaleDateString('de-DE')}</Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <Typography variant="subtitle1" gutterBottom>Fahrzeugdaten</Typography>
      <Typography><strong>Marke:</strong> {selectedForm.vehicle_brand}</Typography>
      <Typography><strong>Modell:</strong> {selectedForm.vehicle_model}</Typography>
      <Typography><strong>Baujahr:</strong> {selectedForm.vehicle_year}</Typography>
      <Typography><strong>Kilometerstand:</strong> {Number(selectedForm.vehicle_mileage).toLocaleString()} km</Typography>
      <Typography><strong>Preis:</strong> {Number(selectedForm.vehicle_price).toLocaleString()} €</Typography>
      <Typography><strong>Kraftstoff:</strong> {selectedForm.vehicle_fuel_type}</Typography>
      <Typography><strong>Getriebe:</strong> {selectedForm.vehicle_transmission}</Typography>
      <Typography><strong>Leistung:</strong> {selectedForm.vehicle_power}</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="subtitle1" gutterBottom>Beschreibung</Typography>
      <Typography>{selectedForm.vehicle_description || 'Keine Beschreibung vorhanden'}</Typography>
    </Grid>
    <Grid item xs={12}>
  <Typography variant="subtitle1" gutterBottom>Bilder</Typography>
  {selectedForm.images && Array.isArray(selectedForm.images) ? (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {selectedForm.images.map((image, index) => (
        <ImageWithFallback
          key={index}
          src={image}
          alt={`Fahrzeug ${index + 1}`}
          onClick={() => handleImageClick(index)}
        />
      ))}
    </Box>
  ) : selectedForm.images && typeof selectedForm.images === 'string' ? (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {selectedForm.images.split(',').map((image, index) => (
        <ImageWithFallback
          key={index}
          src={image.trim()}
          alt={`Fahrzeug ${index + 1}`}
          onClick={() => handleImageClick(index)}
        />
      ))}
    </Box>
  ) : (
    <Alert severity="info">Keine Bilder vorhanden</Alert>
  )}
</Grid>
  </Grid>
</DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>
                Schließen
              </Button>
              <Button
                startIcon={<PendingIcon />}
                variant="contained"
                color="warning"
                onClick={() => handleStatusChange(selectedForm.id, 'in_bearbeitung')}
              >
                In Bearbeitung
              </Button>
              <Button
                startIcon={<CheckCircleIcon />}
                variant="contained"
                color="success"
                onClick={() => handleStatusChange(selectedForm.id, 'abgeschlossen')}
              >
                Annehmen
              </Button>
              <Button
                startIcon={<CancelIcon />}
                variant="contained"
                color="error"
                onClick={() => handleStatusChange(selectedForm.id, 'abgelehnt')}
              >
                Ablehnen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {selectedForm && (
        <ImageViewer
          images={selectedForm.images || []}
          open={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}
    </>
  )
}

export default CustomerForms