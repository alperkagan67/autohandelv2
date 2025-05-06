import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';

const statusColors = {
  new: 'success',
  inProgress: 'warning',
  completed: 'info',
  rejected: 'error'
};

const statusLabels = {
  new: 'Neu',
  inProgress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  rejected: 'Abgelehnt'
};

function VehicleInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const loadInquiries = () => {
      try {
        const storedInquiries = JSON.parse(localStorage.getItem('vehicleInquiries') || '[]');
        setInquiries(storedInquiries);
      } catch (error) {
        console.error('Error loading inquiries:', error);
        setInquiries([]);
      }
    };
    loadInquiries();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDetailsOpen(true);
  };

  const handleStatusChange = (inquiryId, newStatus) => {
    try {
      const updatedInquiries = inquiries.map(inquiry =>
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      );
      localStorage.setItem('vehicleInquiries', JSON.stringify(updatedInquiries));
      setInquiries(updatedInquiries);
      setDetailsOpen(false);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

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
              {inquiries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((inquiry) => (
                  <TableRow
                    key={inquiry.id}
                    hover
                    onClick={() => handleRowClick(inquiry)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell>
                      {new Date(inquiry.date).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{inquiry.customerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inquiry.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {inquiry.vehicle.brand} {inquiry.vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inquiry.vehicle.year} • {inquiry.vehicle.price.toLocaleString()} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusLabels[inquiry.status]}
                        color={statusColors[inquiry.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              {inquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Keine Anfragen vorhanden
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={inquiries.length}
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
        {selectedInquiry && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography component="span">
                  Anfrage Details
                </Typography>
                <Chip
                  size="small"
                  label={statusLabels[selectedInquiry.status]}
                  color={statusColors[selectedInquiry.status]}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Kundendaten</Typography>
                  <Typography><strong>Name:</strong> {selectedInquiry.customerName}</Typography>
                  <Typography><strong>E-Mail:</strong> {selectedInquiry.email}</Typography>
                  <Typography><strong>Telefon:</strong> {selectedInquiry.phone}</Typography>
                  <Typography><strong>Datum:</strong> {new Date(selectedInquiry.date).toLocaleDateString('de-DE')}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Fahrzeugdaten</Typography>
                  <Typography>
                    <strong>Fahrzeug:</strong> {selectedInquiry.vehicle.brand} {selectedInquiry.vehicle.model}
                  </Typography>
                  <Typography><strong>Jahr:</strong> {selectedInquiry.vehicle.year}</Typography>
                  <Typography><strong>Preis:</strong> {selectedInquiry.vehicle.price.toLocaleString()} €</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Nachricht</Typography>
                  <Typography>{selectedInquiry.message}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>
                Schließen
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleStatusChange(selectedInquiry.id, 'inProgress')}
              >
                In Bearbeitung
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange(selectedInquiry.id, 'completed')}
              >
                Abschließen
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleStatusChange(selectedInquiry.id, 'rejected')}
              >
                Ablehnen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default VehicleInquiries;