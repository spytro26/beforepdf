// Freezer specific constants and enhanced data
export const FREEZER_DEFAULTS = {
  // Room specs
  length: 7.0,      // Excel shows 7m
  width: 4.0,       // Excel shows 4m  
  height: 3.5,      // Excel shows 3.5m
  doorWidth: 1.8,   // Excel shows 1.8m
  doorHeight: 2.0,  // Excel shows 2.0m
  
  // Operating conditions
  externalTemp: 45,  // Excel shows 45°C
  internalTemp: -35, // Excel shows -35°C
  operatingHours: 24,
  pullDownTime: 10,
  roomHumidity: 85, // %RH - critical for SHR
  steamHumidifierLoad: 0, // kW
  
  // Construction
  insulationType: "PUF",
  insulationThickness: 150,
  internalFloorThickness: 150, // mm
  numberOfFloors: 1,  // Excel shows 1
  
  // Product & load
  productType: "fruit pulp",  // Excel shows "fruit pulp"
  dailyProductLoad: 3000,     // Excel shows 3000 kg/day
  productIncomingTemp: 25,
  productOutgoingTemp: -15,   // Excel shows -15°C
  storageType: "Boxed", // Default storage type
  
  // Equipment details
  fanMotorRating: 0.37, // kW
  numberOfFans: 6,
  fanOperatingHours: 24,
  fanAirFlowRate: 2000, // CFM per fan - Excel shows 2000
  doorHeatersLoad: 0.24, // kW
  trayHeatersLoad: 2.0, // kW
  peripheralHeatersLoad: 0, // kW
  doorClearOpening: 1800, // mm - Excel shows 1800
  storageCapacity: 10,    // kg/m³ - Excel shows 10
  
  // Usage
  numberOfPeople: 2,
  hoursWorking: 16, // Updated from 4 to 16 hours
  dailyDoorOpenings: 15,
  lightingWattage: 150,
  equipmentLoad: 300
};

// Enhanced thermal constants for Excel precision
export const ENHANCED_CONSTANTS = {
  // Air properties
  airDensity: 1.2, // kg/m³
  airSpecificHeat: 1.006, // kJ/kg·K
  enthalpyDiff: 0.1203, // kJ/L for air change calculations (Excel exact)
  
  // Equipment defaults
  fanMotorRating: 0.37, // kW
  fanQuantity: 6,
  defaultFanAirFlow: 2000, // CFM per fan
  doorHeaterLoad: 0.24, // kW for doors > 1.8m²
  doorHeaterThreshold: 1.8, // m² - doors larger than this need heaters
  doorInfiltrationFactor: 1800, // Infiltration calculation factor
  
  // Humidity constants
  defaultHumidity: 85, // %RH
  steamGeneratorCapacity: 0.407, // kW per unit
  
  // Air change rates by room type
  airChangeRates: {
    freezer: 9.4,      // Excel shows 9.4 L/S air change rate
    blastFreezer: 1.0,
    coldRoom: 0.3
  },
  
  // Heater capacities
  peripheralHeaterCapacity: 100, // W/m²
  defaultTrayHeatersLoad: 2.0, // kW
  defaultDoorHeatersLoad: 0.24, // kW
  
  // Updated occupancy hours
  defaultOccupancyHours: 16, // Update from 4 to match Excel
  
  // Safety factor
  safetyFactor: 1.1 // 10%
};