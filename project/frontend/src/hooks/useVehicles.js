import { useState, useEffect, useCallback } from 'react';
import { API_URL, VEHICLES_URL, UPLOADS_URL } from '../config/api';

export function useVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fahrzeuge abrufen
    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${VEHICLES_URL}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Vollständige URLs für Bilder hinzufügen
            const vehiclesWithFullUrls = data.map((vehicle) => ({
                ...vehicle,
                images: vehicle.images?.map((image) =>
                    image.startsWith('http') ? image : `${UPLOADS_URL}/${image}`
                ) || [],
            }));

            setVehicles(vehiclesWithFullUrls);
        } catch (err) {
            console.error('Fehler beim Abrufen der Fahrzeuge:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Einzelnes Fahrzeug abrufen
    const getVehicle = useCallback(async (id) => {
        try {
            const response = await fetch(`${VEHICLES_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Vollständige URLs für Bilder hinzufügen
            if (data && data.images) {
                data.images = data.images.map((image) =>
                    image.startsWith('http') ? image : `${UPLOADS_URL}/${image}`
                );
            }

            return data;
        } catch (err) {
            console.error('Fehler beim Abrufen eines Fahrzeugs:', err);
            throw err;
        }
    }, []);

    // Fahrzeug hinzufügen
    const addVehicle = useCallback(async (vehicleData, images) => {
        try {
            if (!vehicleData.brand || !vehicleData.model) {
                throw new Error('Marke und Modell sind erforderlich');
            }

            const formData = new FormData();

            // Numerische Werte konvertieren
            const numericFields = ['year', 'price', 'mileage'];
            numericFields.forEach((field) => {
                if (vehicleData[field]) {
                    vehicleData[field] = Number(vehicleData[field]);
                }
            });

            // Fahrzeugdaten hinzufügen
            Object.keys(vehicleData).forEach((key) => {
                if (key !== 'images' && key !== 'features') {
                    if (vehicleData[key] != null) {
                        formData.append(key, vehicleData[key]);
                    }
                }
            });

            // Features hinzufügen
            if (vehicleData.features && Array.isArray(vehicleData.features)) {
                formData.append('features', JSON.stringify(vehicleData.features));
            }

            // Bilder hinzufügen
            if (images && Array.isArray(images)) {
                images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            const response = await fetch(VEHICLES_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Fehler beim Erstellen des Fahrzeugs');
            }

            await fetchVehicles(); // Liste aktualisieren
        } catch (err) {
            console.error('Fehler beim Hinzufügen eines Fahrzeugs:', err);
            throw err;
        }
    }, [fetchVehicles]);

    // Fahrzeug aktualisieren
    const updateVehicle = useCallback(async (id, vehicleData) => {
        try {
            const formData = new FormData();

            // Numerische Werte konvertieren
            const numericFields = ['year', 'price', 'mileage'];
            numericFields.forEach((field) => {
                if (vehicleData[field]) {
                    vehicleData[field] = Number(vehicleData[field]);
                }
            });

            // Fahrzeugdaten hinzufügen
            Object.keys(vehicleData).forEach((key) => {
                if (key !== 'images' && key !== 'features') {
                    if (vehicleData[key] != null) {
                        formData.append(key, vehicleData[key]);
                    }
                }
            });

            // Features hinzufügen
            if (vehicleData.features && Array.isArray(vehicleData.features)) {
                formData.append('features', JSON.stringify(vehicleData.features));
            }

            // Bilder hinzufügen
            if (vehicleData.images && Array.isArray(vehicleData.images)) {
                vehicleData.images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            const response = await fetch(`${VEHICLES_URL}/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Fehler beim Aktualisieren des Fahrzeugs');
            }

            await fetchVehicles(); // Liste aktualisieren
        } catch (err) {
            console.error('Fehler beim Aktualisieren eines Fahrzeugs:', err);
            throw err;
        }
    }, [fetchVehicles]);

    // Fahrzeug löschen
    const deleteVehicle = useCallback(async (id) => {
        try {
            const response = await fetch(`${VEHICLES_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Fehler beim Löschen des Fahrzeugs');
            }

            setVehicles((prevVehicles) =>
                prevVehicles.filter((vehicle) => vehicle.id !== id)
            );
        } catch (err) {
            console.error('Fehler beim Löschen eines Fahrzeugs:', err);
            throw err;
        }
    }, []);

    return {
        vehicles,
        loading,
        error,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicle,
        refetch: fetchVehicles,
    };
}
