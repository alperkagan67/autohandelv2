import { useState } from 'react';
import {
    Container, Typography, Grid, Box, TextField,
    InputAdornment, MenuItem, FormControl,
    Select, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VehicleCard from '../components/VehicleCard';
import { useVehicles } from '../hooks/useVehicles';

const sortOptions = [
    { value: 'price_asc', label: 'Preis aufsteigend' },
    { value: 'price_desc', label: 'Preis absteigend' },
    { value: 'year_desc', label: 'Neuste zuerst' },
    { value: 'mileage_asc', label: 'Kilometerstand aufsteigend' }
];

function VehicleList() {
    const { vehicles = [], loading, error } = useVehicles();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('price_asc');

    if (loading) return <div>Laden...</div>;
    if (error) return <div>Error: {error}</div>;
/*************  ✨ Codeium Command ⭐  *************/
/**
 * A component that displays a list of vehicles. It allows the user to search by brand
 * or model and to sort the list by price, year, or mileage.
 *
 * @returns {React.ReactElement} A React component with a list of vehicles.
 */
/******  38ca0739-7933-4f49-974b-178de1b5b839  *******/    if (!Array.isArray(vehicles)) return <div>Keine Fahrzeuge verfügbar</div>;

    const filteredVehicles = vehicles
        .filter(vehicle =>
            vehicle.status !== 'sold' && (
                vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return (a.price || 0) - (b.price || 0);
                case 'price_desc':
                    return (b.price || 0) - (a.price || 0);
                case 'year_desc':
                    return (b.year || 0) - (a.year || 0);
                case 'mileage_asc':
                    return (a.mileage || 0) - (b.mileage || 0);
                default:
                    return 0;
            }
        });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 4
                }}
            >
                Unsere Fahrzeuge
            </Typography>

            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 4,
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Suchen Sie nach Marke oder Modell..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Sortierung</InputLabel>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="Sortierung"
                    >
                        {sortOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {filteredVehicles.map(vehicle => (
                    <Grid item key={vehicle.id} xs={12} sm={6} md={4} lg={3}>
                        <VehicleCard vehicle={vehicle} />
                    </Grid>
                ))}
            </Grid>

            {filteredVehicles.length === 0 && (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    color: 'text.secondary'
                }}>
                    <Typography variant="h6">
                        Keine Fahrzeuge gefunden
                    </Typography>
                    <Typography>
                        Bitte versuchen Sie es mit anderen Suchkriterien
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

export default VehicleList;