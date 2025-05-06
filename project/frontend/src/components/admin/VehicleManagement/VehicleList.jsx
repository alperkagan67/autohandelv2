import { useState } from 'react';
import { useVehicles } from '../../../hooks/useVehicles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, TablePagination, Typography, Box,
  Dialog, DialogTitle, DialogContent, Grid, Alert, Tooltip,
  Snackbar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import { formatCurrency } from '../../../utils/formatters';
import ImageViewer from '../../shared/ImageViewer';

const statusColors = {
  available: 'success',
  reserved: 'warning',
  sold: 'error'
};

const statusLabels = {
  available: 'Verfügbar',
  reserved: 'Reserviert',
  sold: 'Verkauft'
};

function VehicleList({ onEdit, onDelete }) {
  const { vehicles = [], loading, error } = useVehicles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (loading) return <Typography>Laden...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!Array.isArray(vehicles)) return <Typography>Keine Fahrzeuge verfügbar</Typography>;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenInNewWindow = (vehicle, e) => {
    e.stopPropagation();
    window.open(`/vehicles/${vehicle.id}`, '_blank');
  };

  const handleCopyUrl = (vehicle, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/vehicles/${vehicle.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarOpen(true);
    });
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageViewerOpen(true);
  };

  return (
    <>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fahrzeug</TableCell>
                <TableCell>Preis</TableCell>
                <TableCell>Kilometerstand</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle) => (
                  <TableRow
                    key={vehicle.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell>
                      <Box
                        component={RouterLink}
                        to={`/vehicles/${vehicle.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        {vehicle.images?.[0] && (
                          <Box
                            component="img"
                            src={vehicle.images[0]}
                            alt=""
                            sx={{
                              width: 60,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        )}
                        <Box>
                          <Typography variant="body1">
                            {vehicle.brand} {vehicle.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.year}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(vehicle.price)}</TableCell>
                    <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusLabels[vehicle.status] || statusLabels.available}
                        color={statusColors[vehicle.status] || statusColors.available}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Link kopieren">
                        <IconButton
                          size="small"
                          onClick={(e) => handleCopyUrl(vehicle, e)}
                          sx={{ mr: 1 }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="In neuem Tab öffnen">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenInNewWindow(vehicle, e)}
                          sx={{ mr: 1 }}
                        >
                          <LaunchIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Bearbeiten">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(vehicle);
                          }}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(vehicle);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Keine Fahrzeuge vorhanden
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={vehicles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Einträge pro Seite"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} von ${count}`
          }
        />
      </Paper>

      <ImageViewer
        images={selectedVehicle?.images || []}
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        selectedImage={selectedImage}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Link wurde in die Zwischenablage kopiert"
      />
    </>
  );
}

export default VehicleList;