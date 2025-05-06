// src/utils/storage.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_KEYS = {
    CUSTOMER_FORMS: 'kfz_customer_forms'
}

// Helper function to save images
async function saveImages(images) {
    const uploadDir = path.join(__dirname, '../../../uploads/vehicles');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedImages = [];

    for (const image of images) {
        const fileName = `${Date.now()}-${image.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Convert Blob/File to Buffer and save
        const buffer = await image.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        // Save the relative path that can be used in URLs
        savedImages.push(`/uploads/vehicles/${fileName}`);
    }

    return savedImages;
}

export const saveCustomerForm = async (formData) => {
    try {
        const forms = getCustomerForms();

        // Save images first
        const savedImagePaths = await saveImages(formData.images);

        const newForm = {
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'neu',
            customerName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            vehicle: {
                brand: formData.brand,
                model: formData.model,
                year: formData.year,
                mileage: formData.mileage,
                price: formData.price,
                fuelType: formData.fuelType,
                transmission: formData.transmission,
                power: formData.power,
                description: formData.description
            },
            images: savedImagePaths // Use the saved image paths
        };

        forms.unshift(newForm);
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_FORMS, JSON.stringify(forms));
        return newForm;
    } catch (error) {
        console.error('Error saving customer form:', error);
        throw error;
    }
}

export const getCustomerForms = () => {
    try {
        const forms = localStorage.getItem(STORAGE_KEYS.CUSTOMER_FORMS);
        return forms ? JSON.parse(forms) : [];
    } catch (error) {
        console.error('Error getting customer forms:', error);
        return [];
    }
}

export const updateFormStatus = (formId, newStatus) => {
    try {
        const forms = getCustomerForms();
        const updatedForms = forms.map(form =>
            form.id === formId ? { ...form, status: newStatus } : form
        );
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_FORMS, JSON.stringify(updatedForms));
    } catch (error) {
        console.error('Error updating form status:', error);
        throw error;
    }
}

// Helper function to clean up old images
export const cleanupOldImages = (oldImagePaths) => {
    try {
        oldImagePaths.forEach(imagePath => {
            const fullPath = path.join(__dirname, '../../../', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
    } catch (error) {
        console.error('Error cleaning up old images:', error);
    }
}