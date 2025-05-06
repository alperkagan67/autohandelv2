import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fetch from 'node-fetch';

// Konfiguration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Korrekte Pfad-Konfiguration
const projectRoot = path.resolve(__dirname, '..', '..');
const uploadDir = path.join(projectRoot, 'uploads', 'vehicles');

// CORS Konfiguration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

// Express und Middleware
const app = express();
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.json());

// Wichtig: Statisches Verzeichnis korrekt einbinden
app.use('/uploads/vehicles', express.static(path.join(projectRoot, 'uploads', 'vehicles')));

// Upload-Verzeichnis erstellen
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
}

// PostgreSQL Pool
const { Pool } = pkg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'autohandel',
  password: '123456',
  port: 5432,
});

// Test-Endpunkt für DB-Verbindung
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Debugging: Logge die empfangenen Daten
    console.log('Empfangene Daten:', username, password);

    const adminUsername = 'root';
    const adminPassword = '123456';

    if (username === adminUsername && password === adminPassword) {
        const token = 'secure-admin-token';
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Ungültige Zugangsdaten' });
    }
});

// Multer Konfiguration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/octet-stream'
    ];
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

    if (allowedTypes.includes(file.mimetype) ||
        (file.originalname && file.originalname.match(allowedExtensions))) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// DELETE Fahrzeug
app.delete('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
        }
        await client.query('DELETE FROM vehicle_features WHERE vehicle_id = $1', [id]);
        await client.query('DELETE FROM vehicle_images WHERE vehicle_id = $1', [id]);
        await client.query('COMMIT');
        res.status(200).json({ message: 'Fahrzeug erfolgreich gelöscht' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Fehler beim Löschen des Fahrzeugs:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Fahrzeugs' });
    } finally {
        client.release();
    }
});

// Alle Fahrzeuge abrufen
app.get('/api/vehicles', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT v.*, 
            string_agg(DISTINCT vf.feature, ',') as features,
            string_agg(DISTINCT vi.image_url, ',') as images
            FROM vehicles v
            LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
            GROUP BY v.id
            ORDER BY v.created_at DESC
        `);
        const vehicles = rows.map(vehicle => ({
            ...vehicle,
            features: vehicle.features ? vehicle.features.split(',') : [],
            images: vehicle.images ? vehicle.images.split(',').map(url => `http://localhost:${port}${url}`) : []
        }));
        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: error.message });
    }
});

// Einzelnes Fahrzeug abrufen
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT v.*, 
            string_agg(DISTINCT vf.feature, ',') as features,
            string_agg(DISTINCT vi.image_url, ',') as images
            FROM vehicles v
            LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
            WHERE v.id = $1
            GROUP BY v.id
        `, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        const vehicle = {
            ...rows[0],
            features: rows[0].features ? rows[0].features.split(',') : [],
            images: rows[0].images ? rows[0].images.split(',').map(url => `http://localhost:${port}${url}`) : []
        };
        res.json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fahrzeug erstellen
app.post('/api/vehicles', upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { brand, model, year, price, mileage, fuelType, transmission, power, description, status } = req.body;
        let features = [];
        try {
            features = JSON.parse(req.body.features || '[]');
        } catch (e) {
            console.warn('Could not parse features:', e);
        }
        // Fahrzeug einfügen
        const vehicleResult = await client.query(
            'INSERT INTO vehicles (brand, model, year, price, mileage, fuel_type, transmission, power, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
            [brand, model, year, price, mileage, fuelType, transmission, power, description, status || 'available']
        );
        const vehicleId = vehicleResult.rows[0].id;
        // Features einfügen
        if (features.length > 0) {
            for (const feature of features) {
                await client.query(
                    'INSERT INTO vehicle_features (vehicle_id, feature) VALUES ($1, $2)',
                    [vehicleId, feature]
                );
            }
        }
        // Bilder speichern
        const savedImages = [];
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                const imageUrl = `/uploads/vehicles/${file.filename}`;
                savedImages.push(`http://localhost:${port}${imageUrl}`);
                await client.query(
                    'INSERT INTO vehicle_images (vehicle_id, image_url, sort_order) VALUES ($1, $2, $3)',
                    [vehicleId, imageUrl, index]
                );
            }
        }
        await client.query('COMMIT');
        res.status(201).json({
            message: 'Vehicle created successfully',
            id: vehicleId,
            images: savedImages
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating vehicle:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Fahrzeug aktualisieren
app.put('/api/vehicles/:id', upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const vehicleId = req.params.id;
        const { brand, model, year, price, mileage, fuelType, transmission, power, description, status } = req.body;
        let features = [];
        try {
            features = JSON.parse(req.body.features || '[]');
        } catch (e) {
            console.warn('Could not parse features:', e);
        }
        // Update vehicle data
        await client.query(
            `UPDATE vehicles 
             SET brand = $1, model = $2, year = $3, price = $4, mileage = $5, 
                 fuel_type = $6, transmission = $7, power = $8, description = $9, 
                 status = $10
             WHERE id = $11`,
            [brand, model, year, price, mileage, fuelType, transmission, power, description, status || 'available', vehicleId]
        );
        // Update features
        await client.query('DELETE FROM vehicle_features WHERE vehicle_id = $1', [vehicleId]);
        if (features.length > 0) {
            for (const feature of features) {
                await client.query(
                    'INSERT INTO vehicle_features (vehicle_id, feature) VALUES ($1, $2)',
                    [vehicleId, feature]
                );
            }
        }
        // Handle new images
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                await client.query(
                    'INSERT INTO vehicle_images (vehicle_id, image_url, sort_order) VALUES ($1, $2, $3)',
                    [vehicleId, `/uploads/vehicles/${file.filename}`, index]
                );
            }
        }
        await client.query('COMMIT');
        // Fetch updated vehicle data
        const { rows: updatedVehicle } = await client.query(`
            SELECT v.*, 
                string_agg(DISTINCT vf.feature, ',') as features,
                string_agg(DISTINCT vi.image_url, ',') as images
            FROM vehicles v
            LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
            WHERE v.id = $1
            GROUP BY v.id
        `, [vehicleId]);
        res.json({
            message: 'Vehicle updated successfully',
            vehicle: {
                ...updatedVehicle[0],
                features: updatedVehicle[0].features ? updatedVehicle[0].features.split(',') : [],
                images: updatedVehicle[0].images ? updatedVehicle[0].images.split(',') : []
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            error: 'Failed to update vehicle',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// Kundenformular speichern
app.post('/api/customer-forms', upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Debug-Logging
        console.log('Received body:', req.body);
        console.log('Received files:', req.files ? req.files.length : 0);
        // Validate required fields
        const requiredFields = [
            'customer_name', 'email', 'phone',
            'vehicle_brand', 'vehicle_model', 'vehicle_year',
            'vehicle_mileage', 'vehicle_price'
        ];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        // Insert form
        const result = await client.query(`
            INSERT INTO customer_forms (
                customer_name, 
                email, 
                phone, 
                vehicle_brand, 
                vehicle_model, 
                vehicle_year, 
                vehicle_mileage, 
                vehicle_price, 
                vehicle_fuel_type, 
                vehicle_transmission, 
                vehicle_power, 
                vehicle_description, 
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
            `,
            [
                req.body.customer_name,
                req.body.email,
                req.body.phone,
                req.body.vehicle_brand,
                req.body.vehicle_model,
                req.body.vehicle_year,
                req.body.vehicle_mileage,
                req.body.vehicle_price,
                req.body.vehicle_fuel_type || null,
                req.body.vehicle_transmission || null,
                req.body.vehicle_power || null,
                req.body.vehicle_description || null,
                'neu'
            ]
        );
        const formId = result.rows[0].id;
        console.log('Form inserted with ID:', formId);
        // Handle image upload
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await client.query(
                    'INSERT INTO customer_form_images (form_id, image_url) VALUES ($1, $2)',
                    [formId, `/uploads/vehicles/${file.filename}`]
                );
            }
            console.log('Images saved');
        }
        await client.query('COMMIT');
        console.log('Transaction committed successfully');
        res.status(201).json({
            success: true,
            message: 'Formular erfolgreich gespeichert',
            formId: formId
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in /api/customer-forms:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});

// GET-Endpoint zum Abrufen aller Kundenformulare
app.get('/api/customer-forms', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT cf.*, string_agg(cfi.image_url, ',') as images
            FROM customer_forms cf
            LEFT JOIN customer_form_images cfi ON cf.id = cfi.form_id
            GROUP BY cf.id
            ORDER BY cf.created_at DESC
        `);
        const forms = rows.map(form => ({
            ...form,
            images: form.images ? 
                form.images.split(',').map(url => `http://localhost:${port}${url}`) : 
                []
        }));
        res.json(forms);
    } catch (error) {
        console.error('Error fetching customer forms:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET-Endpoint zum Abrufen eines einzelnen Kundenformulars
app.get('/api/customer-forms/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT cf.*, string_agg(cfi.image_url, ',') as images
            FROM customer_forms cf
            LEFT JOIN customer_form_images cfi ON cf.id = cfi.form_id
            WHERE cf.id = $1
            GROUP BY cf.id
        `, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Form not found' });
        }
        const form = {
            ...rows[0],
            images: rows[0].images ? 
                rows[0].images.split(',').map(url => `http://localhost:${port}${url}`) : 
                []
        };
        res.json(form);
    } catch (error) {
        console.error('Error fetching customer form:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT-Endpoint zum Aktualisieren des Formularstatus
app.put('/api/customer-forms/:id/status', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { status } = req.body;
        const formId = req.params.id;
        await client.query(
            'UPDATE customer_forms SET status = $1 WHERE id = $2',
            [status, formId]
        );
        await client.query('COMMIT');
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating form status:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Funktion zum Generieren des Exposé-Textes mit Ollama
async function generateExposeWithOllama(vehicleData, features) {
  try {
    console.log('Erstelle strukturierten Prompt für Ollama...');
    // Hier beginnt der Prompt:
    const prompt = `
    Erstelle ein begeisterndes, ausführliches Fahrzeugexposé für einen Autohändler. Das Exposé soll professionell, aber enthusiastisch klingen und alle positiven Aspekte des Fahrzeugs hervorheben.

    Fahrzeuginformationen:
    Marke: ${vehicleData.brand}
    Modell: ${vehicleData.model}
    Baujahr: ${vehicleData.year}
    Preis: ${Number(vehicleData.price).toLocaleString('de-DE')} €
    Kilometerstand: ${Number(vehicleData.mileage).toLocaleString('de-DE')} km
    Kraftstoffart: ${vehicleData.fuel_type}
    Getriebe: ${vehicleData.transmission}
    Leistung: ${vehicleData.power}

    Ausstattungsmerkmale:
    ${features.map(feature => `- ${feature}`).join('\n')}

    ${vehicleData.description ? `Beschreibung: ${vehicleData.description}` : ''}

    Bildmaterial: Das Fahrzeug ist mit ${vehicleData.images ? vehicleData.images.split(',').length : 0} professionellen Fotos dokumentiert, die alle Aspekte des Fahrzeugs zeigen.

    Erzeuge ein AUSFÜHRLICHES Exposé mit folgenden Abschnitten:
    1. Eine begeisternde Überschrift mit dem Fahrzeugnamen
    2. Einen einleitenden Absatz (mindestens 5 Sätze), der die besonderen Vorzüge dieses Fahrzeugs hervorhebt
    3. Einen ausführlichen Abschnitt über die Fahreigenschaften und technischen Highlights (mindestens 7 Sätze)
    4. Eine detaillierte Beschreibung des Innen- und Außendesigns (mindestens 6 Sätze)
    5. Eine vollständige Auflistung der Ausstattungsmerkmale, geordnet nach Kategorien
    6. Einen Abschnitt über Wirtschaftlichkeit und Werterhalt (mindestens 4 Sätze)
    7. Eine Zusammenfassung, warum dieses Angebot besonders attraktiv ist (mindestens 3 Sätze)
    8. Kontaktinformationen mit einer persönlichen Einladung zur Besichtigung

    Verwende einen begeisternden, verkaufsfördernden Ton. Hebe Qualität, Zuverlässigkeit und besondere Merkmale hervor. Verwende positive Adjektive und betone den Wert des Angebots. Erwähne mehrfach die hochwertigen Bilder, die alle Details des Fahrzeugs zeigen.
    
    Formatiere den Text mit Markdown-Überschriften (# für Hauptüberschriften, ## für Unterüberschriften).
    Beginne mit "# [Marke] [Modell] ([Baujahr]) - Exklusives Angebot".
    `;
    // Hier endet der Prompt

    console.log('Sende Anfrage an Ollama...');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: prompt,
        stream: false
      }),
    });
    console.log('Ollama Antwort-Status:', response.status);
    if (!response.ok) {
      throw new Error(`Ollama API antwortete mit Status ${response.status}`);
    }
    const data = await response.json();
    console.log('Ollama Antwort erhalten, Textlänge:', data.response?.length || 0);
    if (!data.response || data.response.trim() === '') {
      throw new Error('Ollama lieferte keine Antwort');
    }
    return data.response;
  } catch (error) {
    console.error('Fehler bei Ollama API:', error);
    // Ausführlicher Fallback-Text mit allen verfügbaren Daten
    return `
# ${vehicleData.brand} ${vehicleData.model} (${vehicleData.year}) - Exklusives Angebot

Willkommen bei diesem exklusiven Angebot von KFZ Abaci. Wir präsentieren Ihnen einen außergewöhnlichen ${vehicleData.brand} ${vehicleData.model} aus dem Jahr ${vehicleData.year}, der durch seine hochwertige Verarbeitung, zuverlässige Technik und umfangreiche Ausstattung überzeugt. Dieses Fahrzeug vereint Komfort, Leistung und Wirtschaftlichkeit in einem attraktiven Gesamtpaket. Der gepflegte Zustand und die detaillierte Dokumentation machen dieses Angebot besonders empfehlenswert.

## Fahreigenschaften und technische Highlights

Der ${vehicleData.brand} ${vehicleData.model} besticht durch seine leistungsstarke Motorisierung mit ${vehicleData.power} und sein reaktionsschnelles ${vehicleData.transmission}. Die Kombination aus kraftvoller Beschleunigung und ausgewogenem Fahrverhalten sorgt für ein dynamisches Fahrerlebnis. Der effiziente ${vehicleData.fuel_type}-Motor bietet sowohl spritzige Leistung als auch angemessenen Verbrauch im Alltag. Die moderne Technik gewährleistet Zuverlässigkeit und Langlebigkeit bei gleichzeitig hohem Fahrkomfort.

## Innen- und Außendesign

Die elegante Außengestaltung des ${vehicleData.brand} ${vehicleData.model} wird durch die hochwertigen Materialien und die sorgfältige Verarbeitung unterstrichen. Die harmonischen Proportionen und die dynamische Linienführung verleihen dem Fahrzeug eine zeitlose Ästhetik. Im Innenraum erwartet Sie ein durchdachtes Raumkonzept mit hochwertigen Materialien und ergonomischer Bedienlogik. Die komfortablen Sitze, das ansprechende Armaturenbrett und die intuitive Anordnung aller Bedienelemente sorgen für ein erstklassiges Fahrerlebnis. Unsere detaillierten Fotos dokumentieren alle Aspekte dieses beeindruckenden Fahrzeugs.

## Ausstattungsmerkmale

**Komfort und Innenausstattung:**
${features.map(feature => `- ${feature}`).join('\n')}

## Wirtschaftlichkeit und Werterhalt

Mit einem Kilometerstand von nur ${Number(vehicleData.mileage).toLocaleString('de-DE')} km bietet dieses Fahrzeug ein ausgezeichnetes Preis-Leistungs-Verhältnis. Der zuverlässige ${vehicleData.fuel_type}-Motor gewährleistet wirtschaftlichen Betrieb bei gleichzeitig guter Performance. Der Werterhalt des ${vehicleData.brand} ${vehicleData.model} ist durch die Markenqualität und die zeitlose Gestaltung besonders hoch, was dieses Fahrzeug zu einer klugen Investition macht.

## Zusammenfassung

Dieses Angebot stellt eine seltene Gelegenheit dar, einen hochwertigen ${vehicleData.brand} ${vehicleData.model} in ausgezeichnetem Zustand zu erwerben. Die umfangreiche Ausstattung, die technische Zuverlässigkeit und der attraktive Preis von ${Number(vehicleData.price).toLocaleString('de-DE')} € machen dieses Fahrzeug zu einem herausragenden Angebot in seiner Klasse. Die umfassende Fotodokumentation unterstreicht den tadellosen Zustand dieses besonderen Fahrzeugs.

## Kontakt

Wir laden Sie herzlich ein, diesen außergewöhnlichen ${vehicleData.brand} ${vehicleData.model} persönlich bei uns zu besichtigen und bei einer Probefahrt zu erleben. Unser kompetentes Verkaufsteam steht Ihnen für alle Fragen zur Verfügung und berät Sie gerne zu Finanzierungsmöglichkeiten und weiteren Services. Kontaktieren Sie uns unter der Telefonnummer +49 (0) XXX XXXXXXX oder per E-Mail an info@kfz-abaci.de.
`;
  }
}

// Exposé generieren und als PDF zurückgeben
app.get('/api/vehicles/:id/expose', async (req, res) => {
  try {
    const { id } = req.params;
    // Fahrzeugdaten aus der Datenbank holen
    const { rows } = await pool.query(`
      SELECT v.*, 
        string_agg(DISTINCT vf.feature, ',') as features,
        string_agg(DISTINCT vi.image_url, ',') as images
      FROM vehicles v
      LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE v.id = $1
      GROUP BY v.id
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
    }
    console.log('Fahrzeugdaten:', rows[0]);
    const vehicle = rows[0];
    // Features robust extrahieren
    const features = (typeof vehicle.features === 'string' && vehicle.features)
      ? vehicle.features.split(',').filter(f => f && f.trim())
      : [];
    console.log('Features:', features);
    // Exposé-Text mit Ollama generieren
    const exposeText = await generateExposeWithOllama(vehicle, features || []);
    console.log('Exposé-Text generiert:', exposeText ? 'Ja' : 'Nein');
    // PDF erstellen
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 Format
    // Schriftarten
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    // Kopfzeile
    page.drawText("KFZ Abaci", {
      x: 50,
      y: 800,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.7)
    });
    // Fahrzeugbild einfügen, falls vorhanden
    if (vehicle.images) {
      const imageUrls = vehicle.images.split(',');
      if (imageUrls.length > 0) {
        try {
          const imagePath = path.join(uploadDir, path.basename(imageUrls[0].trim()));
          if (fs.existsSync(imagePath)) {
            const imageBytes = fs.readFileSync(imagePath);
            let image;
            if (imagePath.toLowerCase().endsWith('.jpg') || 
                imagePath.toLowerCase().endsWith('.jpeg')) {
              image = await pdfDoc.embedJpg(imageBytes);
            } else if (imagePath.toLowerCase().endsWith('.png')) {
              image = await pdfDoc.embedPng(imageBytes);
            }
            if (image) {
              const { width, height } = image.scale(0.5);
              page.drawImage(image, {
                x: 50,
                y: 670,
                width: 200,
                height: height * (200 / width)
              });
            }
          }
        } catch (error) {
          console.error('Fehler beim Einbetten des Bildes:', error);
        }
      }
    }
    // Exposé-Text in PDF einfügen
    const exposeLines = (typeof exposeText === 'string' ? exposeText.split('\n') : ['Kein Text generiert']);
    let y = 650;
    for (const line of exposeLines) {
      if (line.trim() === '') {
        y -= 10;
        continue;
      }
      // Überschriften erkennen und formatieren
      if (line.startsWith('# ')) {
        page.drawText(line.substring(2), {
          x: 50,
          y: y,
          size: 18,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        y -= 25;
      } else if (line.startsWith('## ')) {
        page.drawText(line.substring(3), {
          x: 50,
          y: y,
          size: 14,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.7)
        });
        y -= 20;
      } else if (line.startsWith('- ')) {
        page.drawText(line, {
          x: 50,
          y: y,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        });
        y -= 15;
      } else {
        // Normaler Text - auf Seitenbreite prüfen und ggf. umbrechen
        const words = line.split(' ');
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const lineWidth = font.widthOfTextAtSize(testLine, 10);
          if (lineWidth > 500) {
            page.drawText(currentLine, {
              x: 50,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0)
            });
            y -= 15;
            currentLine = word + ' ';
            if (y < 50) {
              page = pdfDoc.addPage([595.28, 841.89]);
              y = 800;
            }
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine.trim() !== '') {
          page.drawText(currentLine, {
            x: 50,
            y: y,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
          y -= 15;
        }
      }
      if (y < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
      }
    }
    // Fußzeile
    page.drawText(`KFZ Abaci | Fahrzeug-ID: ${vehicle.id} | Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, {
      x: 50,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    // PDF als Antwort senden
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fahrzeug_expose_${vehicle.brand}_${vehicle.model}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Fehler beim Erstellen des Exposés:', error);
    res.status(500).json({ error: error.message });
  }
});

// Minimaler Test-Endpunkt für PDF-Generierung
app.get('/api/pdf-test', async (req, res) => {
  try {
    // Erstelle einfaches PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    
    // Text hinzufügen ohne komplexe Formatierung
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText("Test PDF", {
      x: 50,
      y: 750,
      size: 30,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    // PDF speichern und senden
    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('PDF-Fehler:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error Handling Middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            error: 'File upload error',
            message: error.message
        });
    }
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Server starten
const startServer = async () => {
    try {
        // Teste Schreibzugriff
        fs.accessSync(uploadDir, fs.constants.W_OK);
        console.log('Upload directory is writable:', uploadDir);

        // Teste Datenbankverbindung (PostgreSQL-Version)
        const client = await pool.connect();
        console.log('Database connection successful');
        client.release();

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log('Upload directory:', uploadDir);
            console.log('CORS enabled for:', corsOptions.origin);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();