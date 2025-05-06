// src/components/VehicleCard.jsx
import { Link } from 'react-router-dom';

export const VehicleCard = ({ vehicle }) => {
  return (
    <Link to={`/vehicles/${vehicle.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
              {vehicle.fuelType}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-gray-600 text-sm">
                {vehicle.year} • {vehicle.transmission}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-xs text-gray-500">Preis</p>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(vehicle.price)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Kilometerstand</p>
              <p className="text-sm font-medium">
                {vehicle.mileage.toLocaleString()} km
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {vehicle.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {vehicle.features.length > 2 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{vehicle.features.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};