import { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    IconButton,
    Typography,
    Fade,
    Backdrop
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

function ImageViewer({ images, open, onClose, initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    const handlePrevious = (e) => {
        e.stopPropagation();
        setImageError(false);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setImageError(false);
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') handlePrevious(e);
        if (e.key === 'ArrowRight') handleNext(e);
        if (e.key === 'Escape') onClose();
    };

    const handleImageError = () => {
        setImageError(true);
    };

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
                        borderRadius: 2,
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
                        {imageError ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <BrokenImageIcon sx={{ fontSize: 64, color: 'grey.500' }} />
                                <Typography color="text.secondary">
                                    Bild konnte nicht geladen werden
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                component="img"
                                src={images[currentIndex]}
                                alt={`Bild ${currentIndex + 1}`}
                                onError={handleImageError}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        )}

                        {images.length > 1 && (
                            <>
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
                            </>
                        )}
                    </Box>

                    <Typography sx={{ mt: 1, textAlign: 'center' }}>
                        Bild {currentIndex + 1} von {images.length}
                    </Typography>
                </Box>
            </Fade>
        </Modal>
    );
}

export default ImageViewer;