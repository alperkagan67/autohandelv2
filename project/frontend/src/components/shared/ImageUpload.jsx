    import { Box, Typography, IconButton } from '@mui/material';
    import DeleteIcon from '@mui/icons-material/Delete';
    import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
    import BrokenImageIcon from '@mui/icons-material/BrokenImage';

    function ImageUpload({ images = [], onImageAdd, onImageDelete }) {
        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const files = Array.from(e.dataTransfer.files).filter(
                file => file.type.startsWith('image/')
            );
            if (files.length > 0) {
                onImageAdd(files);
            }
        };

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

        const ImagePreview = ({ image, index }) => {
            const imageUrl = getImageUrl(image);

            if (!imageUrl) {
                return (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                        }}
                    >
                        <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                    </Box>
                );
            }

            return (
                <Box
                    sx={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: 1,
                    }}
                >
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={`Vorschau ${index + 1}`}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.fallback');
                            if (fallback) {
                                fallback.style.display = 'flex';
                            }
                        }}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <Box
                        className="fallback"
                        sx={{
                            display: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                        }}
                    >
                        <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => onImageDelete(index)}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        };

        return (
            <Box sx={{ width: '100%' }}>
                <Box
                    sx={{
                        border: '2px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                        backgroundColor: 'background.paper',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload').click()}
                >
                    <input
                        type="file"
                        id="image-upload"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(e) => onImageAdd(Array.from(e.target.files))}
                    />
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                        Bilder hier ablegen oder klicken zum Auswählen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Unterstützte Formate: JPG, PNG, GIF (max. 5MB pro Bild)
                    </Typography>
                </Box>

                {images.length > 0 && (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Hochgeladene Bilder ({images.length})
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: 2,
                            }}
                        >
                            {images.map((image, index) => (
                                <ImagePreview key={index} image={image} index={index} />
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }

    export default ImageUpload;