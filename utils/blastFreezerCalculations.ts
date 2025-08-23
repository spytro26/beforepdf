import { BLAST_FREEZER_CONSTANTS, BLAST_FREEZER_PRODUCTS, calculateUFactor } from '@/constants/blastFreezerData';

interface RoomData {
  length: string;
  breadth: string;
  height: string;
  doorWidth: string;
  doorHeight: string;
  doorClearOpening?: string; // Optional since it's calculated
  insulationType: string;
  wallThickness: number;
  ceilingThickness: number;
  floorThickness: number;
  internalFloorThickness: string;
}

interface ConditionsData {
  ambientTemp: string;
  roomTemp: string;
  batchHours: string;
  operatingHours: string;
}

interface ProductData {
  productType: string;
  capacityRequired: string;
  incomingTemp: string;
  outgoingTemp: string;
  storageCapacity: string;
  numberOfPeople: string;
  workingHours: string;
  lightLoad: string;
  fanMotorRating: string;
  peripheralHeatersQty: string;
  peripheralHeatersCapacity: string;
  doorHeatersQty: string;
  doorHeatersCapacity: string;
  trayHeatersQty: string;
  trayHeatersCapacity: string;
  drainHeatersQty: string;
  drainHeatersCapacity: string;
  airFlowPerFan: string;
}

export function calculateBlastFreezerLoad(
  roomData: RoomData, 
  conditionsData: ConditionsData, 
  productData: ProductData
) {
  // Parse input values with Excel defaults
  const length = parseFloat(roomData.length) || 5.0;
  const breadth = parseFloat(roomData.breadth) || 5.0;
  const height = parseFloat(roomData.height) || 3.5;
  const doorWidth = parseFloat(roomData.doorWidth) || 2.1;
  const doorHeight = parseFloat(roomData.doorHeight) || 2.1;
  const doorClearOpening = doorWidth * doorHeight; // Calculate from door dimensions
  const insulationType = roomData.insulationType || 'PUF';
  const wallThickness = roomData.wallThickness || 150;
  const ceilingThickness = roomData.ceilingThickness || 150;
  const floorThickness = roomData.floorThickness || 150;
  const internalFloorThickness = parseFloat(roomData.internalFloorThickness) || 150;
  
  const ambientTemp = parseFloat(conditionsData.ambientTemp) || 43;
  const roomTemp = parseFloat(conditionsData.roomTemp) || -35;
  const batchHours = parseFloat(conditionsData.batchHours) || 8;
  const operatingHours = parseFloat(conditionsData.operatingHours) || 24;
  
  const capacityRequired = parseFloat(productData.capacityRequired) || 2000;
  const incomingTemp = parseFloat(productData.incomingTemp) || -5;
  const outgoingTemp = parseFloat(productData.outgoingTemp) || -30;
  const storageCapacity = parseFloat(productData.storageCapacity) || 4;
  const numberOfPeople = parseFloat(productData.numberOfPeople) || 2;
  const workingHours = parseFloat(productData.workingHours) || 4;
  const lightLoad = parseFloat(productData.lightLoad) || 0.1;
  const fanMotorRating = parseFloat(productData.fanMotorRating) || 0.37;
  
  // Heater loads
  const peripheralHeatersQty = parseFloat(productData.peripheralHeatersQty) || 1;
  const peripheralHeatersCapacity = parseFloat(productData.peripheralHeatersCapacity) || 1.5;
  const doorHeatersQty = parseFloat(productData.doorHeatersQty) || 1;
  const doorHeatersCapacity = parseFloat(productData.doorHeatersCapacity) || 0.27;
  const trayHeatersQty = parseFloat(productData.trayHeatersQty) || 1;
  const trayHeatersCapacity = parseFloat(productData.trayHeatersCapacity) || 2.2;
  const drainHeatersQty = parseFloat(productData.drainHeatersQty) || 1;
  const drainHeatersCapacity = parseFloat(productData.drainHeatersCapacity) || 0.04;
  const airFlowPerFan = parseFloat(productData.airFlowPerFan) || 5847;
  
  // Calculate areas and volume
  const wallArea = 2 * (length * height) + 2 * (breadth * height);
  const ceilingArea = length * breadth;
  const floorArea = length * breadth;
  const volume = length * breadth * height;
  const doorArea = doorWidth * doorHeight;
  
  // Temperature difference
  const temperatureDifference = ambientTemp - roomTemp;
  
  // Get product data
  const product = BLAST_FREEZER_PRODUCTS[productData.productType as keyof typeof BLAST_FREEZER_PRODUCTS] || BLAST_FREEZER_PRODUCTS["General Food Items"];
  
  // Calculate storage capacity
  const maximumStorage = volume * storageCapacity * product.storageEfficiency;
  const storageUtilization = (capacityRequired / maximumStorage) * 100;
  
  // Calculate dynamic U-factors based on insulation type and thickness
  const wallUFactor = calculateUFactor(insulationType, wallThickness);
  const ceilingUFactor = calculateUFactor(insulationType, ceilingThickness);
  const floorUFactor = calculateUFactor(insulationType, floorThickness);
  
  // 1. EXACT Excel Formula: Transmission Load (Q = U × A × ΔT × hrs / 24 / 1000)
  const calculateTransmissionLoad = () => {
    const tempDiff = temperatureDifference;
    const hours = operatingHours; // Use operating hours for transmission
    
    // Excel formula: U × Area × ΔT × Hours / 24 / 1000 (to convert to kW)
    const wallLoad = (wallUFactor * wallArea * tempDiff * hours) / 24 / 1000;
    const ceilingLoad = (ceilingUFactor * ceilingArea * tempDiff * hours) / 24 / 1000;
    const floorLoad = (floorUFactor * floorArea * tempDiff * hours) / 24 / 1000;
    
    return {
      walls: wallLoad,
      ceiling: ceilingLoad,
      floor: floorLoad,
      total: wallLoad + ceilingLoad + floorLoad,
      // For detailed display (kJ/day)
      wallsKJDay: wallUFactor * wallArea * tempDiff * hours,
      ceilingKJDay: ceilingUFactor * ceilingArea * tempDiff * hours,
      floorKJDay: floorUFactor * floorArea * tempDiff * hours
    };
  };
  
  // 2. EXACT Excel Formula: Product Load (3-stage calculation)
  const calculateProductLoad = () => {
    const mass = capacityRequired;
    const { specificHeatAbove, specificHeatBelow, latentHeat, freezingPoint } = product;
    const pullDownHours = batchHours; // Use batch hours for product load calculation
    
    let sensibleAbove = 0;
    let latentLoad = 0;
    let sensibleBelow = 0;
    
    // Stage 1: Sensible heat above freezing (Excel formula: Mass × Cp × ΔT / PullDownTime / 3.6)
    if (incomingTemp > freezingPoint) {
      sensibleAbove = (mass * specificHeatAbove * (incomingTemp - freezingPoint)) / (pullDownHours * 3.6);
    }
    
    // Stage 2: Latent heat (freezing process) (Excel formula: Mass × LatentHeat / PullDownTime / 3.6)
    if (outgoingTemp < freezingPoint && incomingTemp > freezingPoint) {
      latentLoad = (mass * latentHeat) / (pullDownHours * 3.6);
    }
    
    // Stage 3: Sensible heat below freezing (Excel formula: Mass × Cp × ΔT / PullDownTime / 3.6)
    if (outgoingTemp < freezingPoint) {
      const startTemp = Math.max(incomingTemp, freezingPoint);
      sensibleBelow = (mass * specificHeatBelow * (startTemp - outgoingTemp)) / (pullDownHours * 3.6);
    }
    
    return {
      sensibleAbove,
      latent: latentLoad,
      sensibleBelow,
      total: sensibleAbove + latentLoad + sensibleBelow,
      // For detailed display (kJ)
      sensibleAboveKJ: mass * specificHeatAbove * Math.max(0, incomingTemp - freezingPoint),
      latentKJ: mass * latentHeat,
      sensibleBelowKJ: mass * specificHeatBelow * Math.max(0, Math.max(incomingTemp, freezingPoint) - outgoingTemp)
    };
  };
  
  // 3. EXACT Excel Formula: Air Change Load (Air changes × Volume × Enthalpy diff × Hrs / 1000)
  const calculateAirChangeLoad = () => {
    const roomVolume = volume;
    const airChangeRate = BLAST_FREEZER_CONSTANTS.airChangeRate; // 4.2 changes/hr
    const enthalpyDiff = BLAST_FREEZER_CONSTANTS.airEnthalpyDiff; // 0.14 kJ/kg
    const hours = operatingHours; // Use operating hours for air change
    
    // Excel formula: Air changes × Volume × Enthalpy difference × Hours / 1000
    const loadKW = (airChangeRate * roomVolume * enthalpyDiff * hours) / 1000;
    
    return {
      loadKW,
      airChangeRate,
      enthalpyDiff,
      totalKJDay: airChangeRate * roomVolume * enthalpyDiff * hours
    };
  };
  
  // 4. EXACT Excel Formula: Internal Load Calculations
  const calculateInternalLoads = () => {
    // Excel formula for occupancy: No of people × Heat Equiv(kW) × Hours / 24
    const occupancyLoad = (numberOfPeople * (BLAST_FREEZER_CONSTANTS.personHeatLoad / 1000) * workingHours) / 24;
    
    // Excel formula for lighting: Light load(kW) × Hours / 24
    const lightingLoad = (lightLoad * operatingHours) / 24;
    
    // Excel formula for equipment: Equipment load(kW) × Hours / 24
    const equipmentLoad = (fanMotorRating * operatingHours) / 24;
    
    // Excel formula for heaters: Heater capacity(kW) × Quantity × Hours / 24
    const peripheralHeaterLoad = (peripheralHeatersQty * peripheralHeatersCapacity * operatingHours) / 24;
    const doorHeaterLoad = (doorHeatersQty * doorHeatersCapacity * operatingHours) / 24;
    const trayHeaterLoad = (trayHeatersQty * trayHeatersCapacity * operatingHours) / 24;
    const drainHeaterLoad = (drainHeatersQty * drainHeatersCapacity * operatingHours) / 24;
    
    const totalHeaterLoad = peripheralHeaterLoad + doorHeaterLoad + trayHeaterLoad + drainHeaterLoad;
    
    return {
      occupancy: occupancyLoad,
      lighting: lightingLoad,
      equipment: equipmentLoad,
      peripheralHeaters: peripheralHeaterLoad,
      doorHeaters: doorHeaterLoad,
      trayHeaters: trayHeaterLoad,
      drainHeaters: drainHeaterLoad,
      totalHeaters: totalHeaterLoad,
      total: occupancyLoad + lightingLoad + equipmentLoad + totalHeaterLoad,
      // For detailed display (kJ/day)
      occupancyKJDay: numberOfPeople * BLAST_FREEZER_CONSTANTS.personHeatLoad * workingHours / 1000,
      lightingKJDay: lightLoad * operatingHours * 3.6,
      equipmentKJDay: fanMotorRating * operatingHours * 3.6,
      peripheralHeatersKJDay: peripheralHeatersQty * peripheralHeatersCapacity * operatingHours * 3.6,
      doorHeatersKJDay: doorHeatersQty * doorHeatersCapacity * operatingHours * 3.6,
      trayHeatersKJDay: trayHeatersQty * trayHeatersCapacity * operatingHours * 3.6,
      drainHeatersKJDay: drainHeatersQty * drainHeatersCapacity * operatingHours * 3.6
    };
  };
  
  // Calculate all loads
  const transmissionLoad = calculateTransmissionLoad();
  const productLoad = calculateProductLoad();
  const airLoad = calculateAirChangeLoad();
  const internalLoads = calculateInternalLoads();
  
  // 5. EXACT Excel Total Calculation
  const totalLoadKW = transmissionLoad.total + productLoad.total + airLoad.loadKW + internalLoads.total;
  
  // Calculate additional engineering outputs
  const loadKJPerBatch = totalLoadKW * batchHours * 3.6; // kW × hours × 3.6 = kJ
  
  // 24-Hour Heat Loads (Excel specific outputs)
  const sensibleHeatKJ24Hr = (productLoad.sensibleAbove + productLoad.sensibleBelow) * 24 * 3.6;
  const latentHeatKJ24Hr = productLoad.latent * 24 * 3.6;
  
  // SHR Calculation (Excel formula: Sensible Load / Total Load)
  const totalSensibleLoad = transmissionLoad.total + productLoad.sensibleAbove + productLoad.sensibleBelow + 
                           airLoad.loadKW + internalLoads.occupancy + internalLoads.lighting + 
                           internalLoads.equipment + internalLoads.totalHeaters;
  const totalLatentLoad = productLoad.latent;
  const totalLoadForSHR = totalSensibleLoad + totalLatentLoad;
  const SHR = totalLoadForSHR > 0 ? totalSensibleLoad / totalLoadForSHR : 1.0;
  
  // Air Quantity Required (CFM) - Excel formula: Load(kW) × 3517 / (1.2 × 1005 × ΔT)
  const airQtyRequiredCfm = (totalLoadKW * 3517) / (1.2 * 1005 * temperatureDifference);
  
  // 6. Apply Safety Factor (Excel shows 5% for blast freezer)
  const safetyFactor = BLAST_FREEZER_CONSTANTS.safetyFactor; // 1.05 (5%)
  const finalLoadKW = totalLoadKW * safetyFactor;
  const safetyFactorLoadKW = finalLoadKW - totalLoadKW;
  
  // Conversions (Excel standard)
  const totalTR = finalLoadKW / 3.517; // kW to TR
  const totalBTU = finalLoadKW * 3412; // kW to BTU/hr
  
  // Daily energy consumption
  const dailyEnergyConsumption = finalLoadKW * 24; // kWh/day
  
  return {
    dimensions: { length, breadth, height },
    doorDimensions: { width: doorWidth, height: doorHeight },
    areas: {
      wall: wallArea,
      ceiling: ceilingArea,
      floor: floorArea,
      door: doorArea
    },
    volume,
    storageCapacity: {
      maximum: maximumStorage,
      utilization: storageUtilization,
      density: storageCapacity
    },
    temperatureDifference,
    batchHours,
    construction: {
      type: insulationType,
      wallThickness,
      ceilingThickness,
      floorThickness,
      internalFloorThickness,
      uFactors: {
        walls: wallUFactor,
        ceiling: ceilingUFactor,
        floor: floorUFactor
      }
    },
    productInfo: {
      type: productData.productType,
      mass: capacityRequired,
      incomingTemp,
      outgoingTemp,
      properties: product
    },
    conditions: {
      ambientTemp,
      roomTemp,
      operatingHours,
      airChangeRate: BLAST_FREEZER_CONSTANTS.airChangeRate,
      doorClearOpening,
      airFlowPerFan
    },
    breakdown: {
      transmission: transmissionLoad,
      product: productLoad,
      airChange: airLoad,
      internal: internalLoads
    },
    // Load summary (Excel format)
    loadSummary: {
      totalCalculatedKW: totalLoadKW,
      safetyFactorKW: safetyFactorLoadKW,
      finalLoadKW: finalLoadKW,
      safetyPercentage: ((safetyFactor - 1) * 100)
    },
    // Conversions
    totalTR: totalTR,
    totalKW: finalLoadKW,
    totalBTU: totalBTU,
    dailyEnergyConsumption,
    
    // Engineering outputs (Excel specific)
    engineeringOutputs: {
      loadKJPerBatch: loadKJPerBatch,
      loadKW: totalLoadKW,
      sensibleHeatKJ24Hr: sensibleHeatKJ24Hr,
      latentHeatKJ24Hr: latentHeatKJ24Hr,
      SHR: SHR,
      airQtyRequiredCfm: airQtyRequiredCfm
    },
    
    // Thermal properties
    thermalProperties: {
      wallUFactor: wallUFactor,
      ceilingUFactor: ceilingUFactor,
      floorUFactor: floorUFactor,
      insulationEfficiency: `${insulationType} - ${BLAST_FREEZER_CONSTANTS.insulationThermalConductivity[insulationType as keyof typeof BLAST_FREEZER_CONSTANTS.insulationThermalConductivity]} W/mK`
    },
    
    // Equipment summary
    equipmentSummary: {
      totalFanLoad: fanMotorRating,
      totalHeaterLoad: (peripheralHeatersQty * peripheralHeatersCapacity) + 
                      (doorHeatersQty * doorHeatersCapacity) + 
                      (trayHeatersQty * trayHeatersCapacity) + 
                      (drainHeatersQty * drainHeatersCapacity),
      totalLightingLoad: lightLoad,
      totalPeopleLoad: (numberOfPeople * BLAST_FREEZER_CONSTANTS.personHeatLoad * workingHours) / (1000 * 24)
    }
  };
}