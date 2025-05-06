CREATE DATABASE IF NOT EXISTS autohandel;
USE autohandel;

CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mileage INT NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  transmission VARCHAR(50) NOT NULL,
  power VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  feature VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS customer_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    vehicle_brand VARCHAR(100) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_year INT NOT NULL,
    vehicle_mileage INT NOT NULL,
    vehicle_price DECIMAL(10, 2) NOT NULL,
    vehicle_fuel_type VARCHAR(50) NOT NULL,
    vehicle_transmission VARCHAR(50) NOT NULL,
    vehicle_power VARCHAR(50) NOT NULL,
    vehicle_description TEXT,
    status VARCHAR(20) DEFAULT 'neu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_form_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES customer_forms(id) ON DELETE CASCADE
);





USE autohandel;

-- Füge Dummy-Daten zur 'vehicles' Tabelle hinzu
INSERT INTO vehicles (brand, model, year, price, mileage, fuel_type, transmission, power, description, status)
VALUES 
('BMW', 'X5', 2021, 50000.00, 10000, 'Benzin', 'Automatik', 300, 'Gut gepflegtes Fahrzeug, wenig gefahren', 'available'),
('Audi', 'A4', 2019, 30000.00, 40000, 'Diesel', 'Manuell', 190, 'Sparsames und komfortables Fahrzeug', 'reserved'),
('Volkswagen', 'Golf', 2022, 25000.00, 5000, 'Hybrid', 'Automatik', 150, 'Neuwagen mit modernen Funktionen', 'available');

-- Füge Dummy-Daten zur 'vehicle_images' Tabelle hinzu
INSERT INTO vehicle_images (vehicle_id, image_url, sort_order)
VALUES
(1, '/uploads/vehicles/bmw-x5-1.jpg', 0),
(1, '/uploads/vehicles/bmw-x5-2.jpg', 1),
(2, '/uploads/vehicles/audi-a4-1.jpg', 0),
(3, '/uploads/vehicles/vw-golf-1.jpg', 0);

-- Füge Dummy-Daten zur 'vehicle_features' Tabelle hinzu
INSERT INTO vehicle_features (vehicle_id, feature)
VALUES
(1, 'Navigationssystem'),
(1, 'Klimaanlage'),
(2, 'Lederausstattung'),
(2, 'Sitzheizung'),
(3, 'Bluetooth-Schnittstelle'),
(3, 'Einparkhilfe');

-- Füge Dummy-Daten zur 'inquiries' Tabelle hinzu
INSERT INTO inquiries (vehicle_id, customer_name, email, phone, message, status)
VALUES
(1, 'Max Mustermann', 'max.mustermann@example.com', '0123456789', 'Ist der BMW X5 noch verfügbar? Würde gerne eine Probefahrt machen.', 'new'),
(2, 'Erika Musterfrau', 'erika.musterfrau@example.com', '0987654321', 'Kann ich den Audi A4 reservieren? Wann wäre die nächste Besichtigung möglich?', 'new'),
(3, 'John Doe', 'john.doe@example.com', '01712345678', 'Könnten Sie mir mehr Informationen über den Golf Hybrid geben?', 'new');
