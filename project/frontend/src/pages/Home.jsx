import { Container, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                        fontWeight: 700,
                    }}
                >
                    Willkommen bei KFZ Abaci
                </Typography>

                <Typography
                    variant="h5"
                    component="p"
                    sx={{
                        textAlign: 'center',
                        mb: 6,
                        maxWidth: '800px',
                        mx: 'auto',
                    }}
                >
                    Ihr vertrauenswürdiger Partner für den Kauf und Verkauf von Gebrauchtwagen
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Button
                        component={Link}
                        to="/vehicles"
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'grey.100',
                            },
                        }}
                    >
                        Fahrzeuge ansehen
                    </Button>
                    <Button
                        component={Link}
                        to="/sell"
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: 'white',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'grey.100',
                                bgcolor: 'rgba(255,255,255,0.1)',
                            },
                        }}
                    >
                        Fahrzeug verkaufen
                    </Button>
                </Box>
            </Container>
        </Box>
    )
}

export default Home