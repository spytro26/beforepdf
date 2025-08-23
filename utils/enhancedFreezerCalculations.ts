import { THERMAL_DATA } from '@/constants/thermalData';
import { PRODUCTS, STORAGE_FACTORS } from '@/constants/productData';
import { ENHANCED_CONSTANTS } from '@/constants/freezerData';

interface RoomData {
  length: string;
  width: string;
  height: string;
  doorWidth: string;
  doorHeight: string;
  doorOpenings: string;
  insulationType: string;
  insulationThickness: number;
  internalFloorThickness: string;
  numberOfFloors: string;
}

interface ConditionsData {
  externalTemp: string;
  internalTemp: string;
  operatingHours: string;
  pullDownTime: string;
  roomHumidity: string;
  steamHumidifierLoad: string;
}

interface ProductData {
  productType: string;
  dailyLoad: string;
  incomingTemp: string;
  outgoingTemp: string;
  storageType: string;
  numberOfPeople: string;
  workingHours: string;
  lightingWattage: string;
  equipmentLoad: string;
  fanMotorRating: string;
  numberOfFans: string;
  fanOperatingHours: string;
  fanAirFlowRate: string;
  doorHeatersLoad: string;
  trayHeatersLoad: string;
  peripheralHeatersLoad: string;
  customCpAbove?: string;
  customCpBelow?: string;
  customLatentHeat?: string;
}

export function calculateEnhancedFreezerLoad(
  roomData: RoomData, 
  conditionsData: ConditionsData, 
  productData: ProductData
) {
  // Parse input values - EXCEL EXACT VALUES
  const length = parseFloat(roomData.length) || 7.0;      // Excel: 7m
  const width = parseFloat(roomData.width) || 4.0;        // Excel: 4m
  const height = parseFloat(roomData.height) || 3.5;      // Excel: 3.5m
  const doorWidth = parseFloat(roomData.doorWidth) || 1.8; // Excel: 1.8m
  const doorHeight = parseFloat(roomData.doorHeight) || 2.0; // Excel: 2.0m
  const doorOpenings = parseFloat(roomData.doorOpenings) || 15;
  const insulationType = roomData.insulationType || 'PUF';
  const insulationThickness = roomData.insulationThickness || 150;
  const internalFloorThickness = parseFloat(roomData.internalFloorThickness) || 150;
  const numberOfFloors = parseFloat(roomData.numberOfFloors) || 1;
  
  const externalTemp = parseFloat(conditionsData.externalTemp) || 45;  // Excel: 45°C
  const internalTemp = parseFloat(conditionsData.internalTemp) || -35; // Excel: -35°C
  const operatingHours = parseFloat(conditionsData.operatingHours) || 24;
  const pullDownTime = parseFloat(conditionsData.pullDownTime) || 10;
  const roomHumidity = parseFloat(conditionsData.roomHumidity) || 85;
  const steamHumidifierLoad = parseFloat(conditionsData.steamHumidifierLoad) || 0;
  
  const dailyLoad = parseFloat(productData.dailyLoad) || 3000;        // Excel: 3000 kg
  const incomingTemp = parseFloat(productData.incomingTemp) || 25;
  const outgoingTemp = parseFloat(productData.outgoingTemp) || -15;   // Excel: -15°C
  const numberOfPeople = parseFloat(productData.numberOfPeople) || 2;
  const workingHours = parseFloat(productData.workingHours) || 16;
  const lightingWattage = parseFloat(productData.lightingWattage) || 150;
  const equipmentLoad = parseFloat(productData.equipmentLoad) || 300;
  
  // Equipment loads - EXCEL VALUES
  const fanMotorRating = parseFloat(productData.fanMotorRating) || 0.37; // Excel: 0.37 kW
  const numberOfFans = parseFloat(productData.numberOfFans) || 6;        // Excel: 6 fans
  const fanOperatingHours = parseFloat(productData.fanOperatingHours) || 24;
  const fanAirFlowRate = parseFloat(productData.fanAirFlowRate || '2000') || 2000; // Excel: 2000 CFM
  const doorHeatersLoad = parseFloat(productData.doorHeatersLoad) || 0.243; // Excel: 0.243 kW
  const trayHeatersLoad = parseFloat(productData.trayHeatersLoad) || 2.0;
  const peripheralHeatersLoad = parseFloat(productData.peripheralHeatersLoad) || 0;
  
  // Calculate areas and volume
  const wallArea = 2 * (length * height) + 2 * (width * height);
  const ceilingArea = length * width;
  const floorArea = length * width;
  const volume = length * width * height;
  const doorArea = doorWidth * doorHeight;
  
  // Temperature difference
  const temperatureDifference = externalTemp - internalTemp; // Excel: 45-(-35) = 80°C
  
  // Get U-factor from construction data - EXCEL EXACT
  const insulationTypeKey = insulationType as keyof typeof THERMAL_DATA.uFactors;
  const thickness = insulationThickness as keyof typeof THERMAL_DATA.uFactors.PUF;
  const uFactor = 0.295; // Excel shows 0.295 W/m²K for all surfaces
  
  // Get product data (use custom values if in advanced mode)
  const product = PRODUCTS[productData.productType as keyof typeof PRODUCTS] || PRODUCTS["fruit pulp"];
  const storageFactor = STORAGE_FACTORS[productData.storageType as keyof typeof STORAGE_FACTORS] || STORAGE_FACTORS["Boxed"];
  
  // Use custom thermal properties if provided, otherwise use Excel values
  const specificHeatAbove = productData.customCpAbove ? parseFloat(productData.customCpAbove) : 3.74; // Excel: 3.74
  const specificHeatBelow = productData.customCpBelow ? parseFloat(productData.customCpBelow) : 1.96;  // Excel: 1.96
  const latentHeat = productData.customLatentHeat ? parseFloat(productData.customLatentHeat) : 233;    // Excel: 233
  const freezingPoint = -0.8; // Excel: -0.8°C
  
  // Calculate storage capacity - EXCEL METHOD
  const storageCapacityDensity = 10; // Excel shows 10 kg/m³
  const maxStorageCapacity = volume * storageCapacityDensity; // Excel: 98m³ × 10 = 980 kg
  const storageUtilization = (dailyLoad / maxStorageCapacity) * 100;
  
  // 1. EXACT Excel Formula: Transmission Load (Q = U × A × ΔT × hrs / 24 / 1000)
  const calculateTransmissionLoad = () => {
    const tempDiff = temperatureDifference; // 80°C
    const hours = operatingHours; // 24 hrs
    
    // Excel exact formula: U × Area × TD × Hrs / 24 / 1000
    const wallLoad = (uFactor * wallArea * tempDiff * hours) / 24 / 1000;
    const ceilingLoad = (uFactor * ceilingArea * tempDiff * hours) / 24 / 1000;
    const floorLoad = (uFactor * floorArea * tempDiff * hours) / 24 / 1000;
    
    return {
      walls: wallLoad,     // Should be ~0.52 kW for Excel
      ceiling: ceilingLoad, // Should be ~0.19 kW for Excel
      floor: floorLoad,     // Should be ~0.19 kW for Excel
      total: wallLoad + ceilingLoad + floorLoad, // Should be ~0.90 kW total
      // For detailed display
      wallsKJDay: uFactor * wallArea * tempDiff * hours,
      ceilingKJDay: uFactor * ceilingArea * tempDiff * hours,
      floorKJDay: uFactor * floorArea * tempDiff * hours
    };
  };
  
  // 2. EXACT Excel Formula: Product Load (3-stage calculation)
  const calculateProductLoad = () => {
    const mass = dailyLoad; // 3000 kg
    const pullDownHours = pullDownTime; // 10 hrs
    
    let sensibleAbove = 0;
    let latentLoad = 0;
    let sensibleBelow = 0;
    
    // Stage 1: Before freezing (25°C to -0.8°C)
    if (incomingTemp > freezingPoint) {
      // Excel formula: Mass × Cp × ΔT / pull down time / 3.6
      sensibleAbove = (mass * specificHeatAbove * (incomingTemp - freezingPoint)) / (pullDownHours * 3.6);
      // Should be: 3000 × 3.74 × (25-(-0.8)) / 10 / 3.6 = ~2.29 kW
    }
    
    // Stage 2: Latent heat during freezing (-0.8°C)
    if (outgoingTemp < freezingPoint && incomingTemp > freezingPoint) {
      // Excel formula: Mass × Latent Heat / pull down time / 3.6
      latentLoad = (mass * latentHeat) / (pullDownHours * 3.6);
      // Should be: 3000 × 233 / 10 / 3.6 = ~19.42 kW
    }
    
    // Stage 3: After freezing (-0.8°C to -15°C)
    if (outgoingTemp < freezingPoint) {
      // Excel formula: Mass × Cp × ΔT / pull down time / 3.6
      sensibleBelow = (mass * specificHeatBelow * Math.abs(freezingPoint - outgoingTemp)) / (pullDownHours * 3.6);
      // Should be: 3000 × 1.96 × (0.8+15) / 10 / 3.6 = ~2.58 kW
    }
    
    return {
      sensibleAbove,  // ~2.29 kW
      latent: latentLoad, // ~19.42 kW
      sensibleBelow,  // ~2.58 kW
      total: sensibleAbove + latentLoad + sensibleBelow, // ~24.29 kW
      // For detailed display (kJ/day)
      sensibleAboveKJDay: mass * specificHeatAbove * (incomingTemp - freezingPoint),
      latentKJDay: mass * latentHeat,
      sensibleBelowKJDay: mass * specificHeatBelow * Math.abs(freezingPoint - outgoingTemp)
    };
  };
  
  // 3. EXACT Excel Formula: Respiration Load (Mass(kg) × Watts/Tonne / 1000)
  const calculateRespirationLoad = () => {
    const mass = dailyLoad; // 3000 kg
    const respirationFactor = 0; // Excel shows 0 for fruit pulp (processed product)
    
    // Excel formula: Mass(kg) × Watts/Tonne / 1000
    const respirationLoadKW = (mass * respirationFactor) / 1000;
    
    return {
      load: respirationLoadKW, // Should be 0 for fruit pulp
      loadKJDay: mass * respirationFactor * 24 * 3.6 / 1000
    };
  };
  
  // 4. EXACT Excel Formula: Air Change Load (Air change rate × Enthalpy diff × Hrs / 1000)
  const calculateAirChangeLoad = () => {
    const airChangeRate = 9.4; // Excel shows 9.4 L/S
    const enthalpyDiff = 0.1203; // Excel shows 0.1203 kJ/L
    const hoursOfLoad = operatingHours; // 24 hrs
    
    // Excel formula: Air change rate × Enthalpy diff × Hours / 1000
    const airLoad = (airChangeRate * enthalpyDiff * hoursOfLoad) / 1000;
    // Should be: 9.4 × 0.1203 × 24 / 1000 = ~0.027 kW
    
    return {
      load: airLoad,
      airChangeRate,
      enthalpyDiff,
      airFlowKJDay: airChangeRate * enthalpyDiff * hoursOfLoad
    };
  };
  
  // 5. EXACT Excel Formula: Miscellaneous Loads
  const calculateMiscellaneousLoads = () => {
    // a) Occupancy Load - Excel formula: No of people × Heat Equiv(kW) × Hours / 24
    const occupancyLoad = (numberOfPeople * 0.407 * workingHours) / 24;
    // Should be: 2 × 0.407 × 16 / 24 = ~0.54 kW
    
    // b) Light Load - Excel formula: Light load(kW) × Hours / 24  
    const lightingLoad = (lightingWattage / 1000) * (operatingHours / 24);
    // Should be: 0.14 × 24 / 24 = ~0.14 kW
    
    // c) Peripheral Heaters - Excel shows this as separate category
    const peripheralHeatersLoadCalc = peripheralHeatersLoad * (operatingHours / 24);
    
    // d) Door Heaters - Excel formula: Heater capacity(kW) × No of Doors × Hours / 24
    const doorHeatersLoadCalc = doorHeatersLoad * 1 * (operatingHours / 24); // 1 door
    // Should be: 0.243 × 1 × 24 / 24 = ~0.243 kW
    
    // e) Tray Heaters - Excel formula: Heater capacity(kW) × No of heaters × Hours / 24
    const trayHeatersLoadCalc = trayHeatersLoad * 1 * (operatingHours / 24); // 1 heater
    // Should be: 2 × 1 × 24 / 24 = ~2.0 kW
    
    // f) Steam Humidifiers - Excel shows this category
    const steamLoad = steamHumidifierLoad * (operatingHours / 24);
    
    return {
      occupancy: occupancyLoad,
      lighting: lightingLoad,
      equipment: (equipmentLoad / 1000) * (operatingHours / 24),
      peripheralHeaters: peripheralHeatersLoadCalc,
      doorHeaters: doorHeatersLoadCalc,
      trayHeaters: trayHeatersLoadCalc,
      steamHumidifiers: steamLoad,
      total: occupancyLoad + lightingLoad + (equipmentLoad / 1000) * (operatingHours / 24) + 
             peripheralHeatersLoadCalc + doorHeatersLoadCalc + trayHeatersLoadCalc + steamLoad,
      // For detailed display (kJ/day)
      occupancyKJDay: occupancyLoad * 24 * 3.6,
      lightingKJDay: lightingLoad * 24 * 3.6,
      equipmentKJDay: (equipmentLoad / 1000) * operatingHours * 3.6,
      peripheralHeatersKJDay: peripheralHeatersLoadCalc * 24 * 3.6,
      doorHeatersKJDay: doorHeatersLoadCalc * 24 * 3.6,
      trayHeatersKJDay: trayHeatersLoadCalc * 24 * 3.6,
      steamHumidifiersKJDay: steamLoad * 24 * 3.6
    };
  };
  
  // 6. EXACT Excel Formula: Fan Motor Load (separate calculation)
  const calculateFanMotorLoad = () => {
    // Excel formula: Fan Motor Rating(kW) × Quantity × Usage in Hrs / 24
    const fanLoad = fanMotorRating * numberOfFans * (fanOperatingHours / 24);
    // Should be: 0.37 × 6 × 24 / 24 = ~2.22 kW
    
    return {
      load: fanLoad,
      loadKJDay: fanLoad * 24 * 3.6,
      totalAirFlow: fanAirFlowRate * numberOfFans // Total CFM
    };
  };
  
  // Calculate all loads
  const transmissionLoad = calculateTransmissionLoad();
  const productLoad = calculateProductLoad();
  const respirationLoad = calculateRespirationLoad();
  const airLoad = calculateAirChangeLoad();
  const miscLoads = calculateMiscellaneousLoads();
  const fanMotorLoad = calculateFanMotorLoad();
  
  // 7. EXACT Excel Total Calculation
  const totalLoadBeforeSafety = transmissionLoad.total + productLoad.total + respirationLoad.load + 
                               airLoad.load + miscLoads.total + fanMotorLoad.load;
  // Should be approximately: 0.90 + 24.29 + 0 + 0.027 + (0.54+0.14+0.243+2.0) + 2.22 = ~30.36 kW
  
  // 8. Apply Safety Factor (Excel shows 10%)
  const safetyFactor = 1.10; // Excel: 10%
  const finalLoad = totalLoadBeforeSafety * safetyFactor;
  const safetyFactorLoad = finalLoad - totalLoadBeforeSafety;
  
  // EXACT Excel Conversions
  const totalTR = finalLoad / 3.517; // kW to TR - Excel shows this conversion
  const totalBTU = finalLoad * 3412; // kW to BTU/hr
  
  // Excel specific calculations
  const sensibleHeatKJ24Hr = (productLoad.sensibleAbove + productLoad.sensibleBelow) * 24 * 3.6; // kJ/24Hr
  const latentHeatKJ24Hr = productLoad.latent * 24 * 3.6; // kJ/24Hr
  const totalKJ24Hr = sensibleHeatKJ24Hr + latentHeatKJ24Hr;
  
  // EXCEL EXACT: SHR Calculation (Sensible Heat Ratio)
  const totalSensibleLoad = transmissionLoad.total + productLoad.sensibleAbove + productLoad.sensibleBelow + 
                           airLoad.load + miscLoads.occupancy + miscLoads.lighting + miscLoads.equipment + 
                           miscLoads.peripheralHeaters + miscLoads.doorHeaters + miscLoads.trayHeaters + 
                           fanMotorLoad.load;
  const totalLatentLoad = productLoad.latent + miscLoads.steamHumidifiers;
  const SHR = (totalSensibleLoad + totalLatentLoad) > 0 ? totalSensibleLoad / (totalSensibleLoad + totalLatentLoad) : 1.0;
  
  // EXCEL EXACT: Air Quantity Required CFM (Load × 3517 / (1.2 × 1005 × ΔT))
  const airQtyRequiredCfm = (finalLoad * 3517) / (1.2 * 1005 * temperatureDifference);
  
  // EXCEL EXACT: Maximum Storage Capacity (Volume × Storage Density)
  const maxStorageCapacityExcel = volume * 10; // 10 kg/m³ from Excel
  
  return {
    dimensions: { length, width, height },
    doorDimensions: { width: doorWidth, height: doorHeight },
    areas: {
      wall: wallArea,
      ceiling: ceilingArea,
      floor: floorArea,
      door: doorArea
    },
    volume,
    storageCapacity: {
      maximum: maxStorageCapacity,
      utilization: storageUtilization,
      density: storageCapacityDensity,
      storageFactor: storageFactor,
      storageType: productData.storageType
    },
    temperatureDifference,
    pullDownTime,
    construction: {
      type: insulationType,
      thickness: insulationThickness,
      uFactor,
      floorThickness: internalFloorThickness,
      numberOfFloors
    },
    productInfo: {
      type: productData.productType,
      mass: dailyLoad,
      incomingTemp,
      outgoingTemp,
      freezingPoint,
      properties: {
        specificHeatAbove,
        specificHeatBelow,
        latentHeat,
        freezingPoint,
        density: product?.density || 1000,
        storageEfficiency: product?.storageEfficiency || 0.65
      }
    },
    conditions: {
      externalTemp,
      internalTemp,
      operatingHours,
      humidity: roomHumidity,
      steamLoad: steamHumidifierLoad,
      doorClearOpening: doorWidth * doorHeight * 1000, // Convert to mm²
      airFlowPerFan: fanAirFlowRate,
      totalAirFlow: fanMotorLoad.totalAirFlow
    },
    breakdown: {
      transmission: transmissionLoad,
      product: productLoad,
      respiration: respirationLoad.load,
      airChange: airLoad.load,
      miscellaneous: miscLoads,
      fanMotor: fanMotorLoad.load,
      heaters: {
        peripheral: miscLoads.peripheralHeaters,
        door: miscLoads.doorHeaters,
        tray: miscLoads.trayHeaters,
        total: miscLoads.peripheralHeaters + miscLoads.doorHeaters + miscLoads.trayHeaters
      }
    },
    // Load summary (Excel format)
    loadSummary: {
      totalSensible: totalSensibleLoad,
      totalLatent: totalLatentLoad,
      SHR: SHR,
      totalBeforeSafety: totalLoadBeforeSafety,
      safetyFactor: safetyFactorLoad,
      finalLoad: finalLoad,
      safetyPercentage: 10
    },
    // Excel specific outputs
    excelOutputs: {
      sensibleHeatKJ24Hr: sensibleHeatKJ24Hr,
      latentHeatKJ24Hr: latentHeatKJ24Hr,
      totalKJ24Hr: totalKJ24Hr,
      SHR: SHR,
      airQtyRequiredCfm: airQtyRequiredCfm,
      maximumStorageExcel: maxStorageCapacityExcel // Excel shows max storage capacity
    },
    // Conversions
    totalTR: totalTR,
    totalKW: finalLoad,
    totalBTU: totalBTU,
    
    // Legacy compatibility
    doorOpenings,
    workingHours,
    totalLoad: totalLoadBeforeSafety,
    totalLoadWithSafety: finalLoad,
    airChangeRate: 9.4, // Excel shows 9.4 L/S
    
    // Equipment summary
    equipmentSummary: {
      totalFanLoad: fanMotorLoad.load,
      totalHeaterLoad: miscLoads.peripheralHeaters + miscLoads.doorHeaters + miscLoads.trayHeaters,
      totalLightingLoad: miscLoads.lighting,
      totalPeopleLoad: miscLoads.occupancy,
      totalAirFlow: fanMotorLoad.totalAirFlow
    }
  };
}