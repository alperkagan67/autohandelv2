import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    Divider,
    CardActionArea
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'
import SpeedIcon from '@mui/icons-material/Speed'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import { formatCurrency } from '../utils/formatters'

function VehicleCard({ vehicle }) {
    const getImageUrl = (image) => {
        if (!image) return null;
        if (typeof image === 'string') return image;
        if (image instanceof File || image instanceof Blob) {
            try {
                return URL.createObjectURL(image);
            } catch (error) {
                console.error('Error creating object URL:', error);
                return null;
            }
        }
        return null;
    };

    const imageUrl = getImageUrl(vehicle.images?.[0]);

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                },
                borderRadius: 2,
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={`/vehicles/${vehicle.id}`}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
                {imageUrl ? (
                    <CardMedia
                        component="img"
                        height="200"
                        image={imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        sx={{ objectFit: 'cover' }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                        }}
                    >
                        <BrokenImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                    </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                        {vehicle.brand} {vehicle.model}
                    </Typography>

                    <Typography variant="h6" color="primary" gutterBottom>
                        {formatCurrency(vehicle.price)}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                            icon={<CalendarTodayIcon />}
                            label={vehicle.year}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            icon={<SpeedIcon />}
                            label={`${(vehicle.mileage / 1000).toFixed(0)}tkm`}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            icon={<LocalGasStationIcon />}
                            label={vehicle.fuelType}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Leistung:</strong> {vehicle.power}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Getriebe:</strong> {vehicle.transmission}
                        </Typography>
                    </Box>

                    {vehicle.features && vehicle.features.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {vehicle.features.slice(0, 3).map((feature, index) => (
                                <Chip
                                    key={index}
                                    label={feature}
                                    size="small"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        fontSize: '0.7rem'
                                    }}
                                />
                            ))}
                            {vehicle.features.length > 3 && (
                                <Chip
                                    label={`+${vehicle.features.length - 3}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default VehicleCard