import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';
import { FileText, Play } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateBlastFreezerLoad } from '@/utils/blastFreezerCalculations';
import { BLAST_FREEZER_DEFAULTS } from '@/constants/blastFreezerData';
import { useFocusEffect } from '@react-navigation/native';

export default function BlastFreezerResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize default values on first load
  useEffect(() => {
    initializeDefaultValues();
  }, []);

  // Recalculate whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Add a small delay to ensure initialization is complete
      const timer = setTimeout(() => {
        calculateResults();
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  // Initialize default values on first load
  const initializeDefaultValues = async () => {
    try {
      // Check if data already exists
      const roomData = await AsyncStorage.getItem('blastFreezerRoomData');
      const conditionsData = await AsyncStorage.getItem('blastFreezerConditionsData');
      const constructionData = await AsyncStorage.getItem('blastFreezerConstructionData');
      const productData = await AsyncStorage.getItem('blastFreezerProductData');
      const usageData = await AsyncStorage.getItem('blastFreezerUsageData');

      let dataInitialized = false;

      // If any data is missing, populate with defaults
      if (!roomData) {
        const defaultRoomData = {
          length: BLAST_FREEZER_DEFAULTS.length.toString(),
          breadth: BLAST_FREEZER_DEFAULTS.breadth.toString(),
          height: BLAST_FREEZER_DEFAULTS.height.toString(),
          doorWidth: BLAST_FREEZER_DEFAULTS.doorWidth.toString(),
          doorHeight: BLAST_FREEZER_DEFAULTS.doorHeight.toString(),
        };
        await AsyncStorage.setItem('blastFreezerRoomData', JSON.stringify(defaultRoomData));
        dataInitialized = true;
      }

      if (!conditionsData) {
        const defaultConditionsData = {
          ambientTemp: BLAST_FREEZER_DEFAULTS.ambientTemp.toString(),
          roomTemp: BLAST_FREEZER_DEFAULTS.roomTemp.toString(),
          batchHours: BLAST_FREEZER_DEFAULTS.batchHours.toString(),
          operatingHours: BLAST_FREEZER_DEFAULTS.operatingHours.toString(),
        };
        await AsyncStorage.setItem('blastFreezerConditionsData', JSON.stringify(defaultConditionsData));
        dataInitialized = true;
      }

      if (!constructionData) {
        const defaultConstructionData = {
          insulationType: BLAST_FREEZER_DEFAULTS.insulationType,
          wallThickness: BLAST_FREEZER_DEFAULTS.wallThickness,
          ceilingThickness: BLAST_FREEZER_DEFAULTS.ceilingThickness,
          floorThickness: BLAST_FREEZER_DEFAULTS.floorThickness,
          internalFloorThickness: BLAST_FREEZER_DEFAULTS.internalFloorThickness.toString(),
        };
        await AsyncStorage.setItem('blastFreezerConstructionData', JSON.stringify(defaultConstructionData));
        dataInitialized = true;
      }

      if (!productData) {
        const defaultProductData = {
          productType: BLAST_FREEZER_DEFAULTS.productType,
          capacityRequired: BLAST_FREEZER_DEFAULTS.capacityRequired.toString(),
          incomingTemp: BLAST_FREEZER_DEFAULTS.incomingTemp.toString(),
          outgoingTemp: BLAST_FREEZER_DEFAULTS.outgoingTemp.toString(),
          storageCapacity: BLAST_FREEZER_DEFAULTS.storageCapacity.toString(),
          numberOfPeople: BLAST_FREEZER_DEFAULTS.numberOfPeople.toString(),
          workingHours: BLAST_FREEZER_DEFAULTS.workingHours.toString(),
          lightLoad: BLAST_FREEZER_DEFAULTS.lightLoad.toString(),
          fanMotorRating: BLAST_FREEZER_DEFAULTS.fanMotorRating.toString(),
        };
        await AsyncStorage.setItem('blastFreezerProductData', JSON.stringify(defaultProductData));
        dataInitialized = true;
      }

      if (!usageData) {
        const defaultUsageData = {
          peripheralHeatersQty: BLAST_FREEZER_DEFAULTS.peripheralHeatersQty.toString(),
          peripheralHeatersCapacity: BLAST_FREEZER_DEFAULTS.peripheralHeatersCapacity.toString(),
          doorHeatersQty: BLAST_FREEZER_DEFAULTS.doorHeatersQty.toString(),
          doorHeatersCapacity: BLAST_FREEZER_DEFAULTS.doorHeatersCapacity.toString(),
          trayHeatersQty: BLAST_FREEZER_DEFAULTS.trayHeatersQty.toString(),
          trayHeatersCapacity: BLAST_FREEZER_DEFAULTS.trayHeatersCapacity.toString(),
          drainHeatersQty: BLAST_FREEZER_DEFAULTS.drainHeatersQty.toString(),
          drainHeatersCapacity: BLAST_FREEZER_DEFAULTS.drainHeatersCapacity.toString(),
          airFlowPerFan: BLAST_FREEZER_DEFAULTS.airFlowPerFan.toString(),
        };
        await AsyncStorage.setItem('blastFreezerUsageData', JSON.stringify(defaultUsageData));
        dataInitialized = true;
      }

      // If we initialized any data, calculate results immediately
      if (dataInitialized) {
        setTimeout(() => {
          calculateResults();
        }, 200);
      }
    } catch (error) {
      console.error('Error initializing default values:', error);
    }
  };

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('blastFreezerRoomData');
      const conditionsData = await AsyncStorage.getItem('blastFreezerConditionsData');
      const constructionData = await AsyncStorage.getItem('blastFreezerConstructionData');
      const productData = await AsyncStorage.getItem('blastFreezerProductData');
      const usageData = await AsyncStorage.getItem('blastFreezerUsageData');

      console.log('Debug - Storage data:');
      console.log('roomData:', roomData);
      console.log('conditionsData:', conditionsData);
      console.log('constructionData:', constructionData);
      console.log('productData:', productData);
      console.log('usageData:', usageData);

      // Check which data is missing
      const missingData = [];
      if (!roomData) missingData.push('Room specifications');
      if (!conditionsData) missingData.push('Operating conditions');
      if (!constructionData) missingData.push('Construction details');
      if (!productData) missingData.push('Product information');
      if (!usageData) missingData.push('Usage information');

      if (missingData.length > 0) {
        console.log('Missing data:', missingData);
        setResults(null);
        console.warn(`Missing data: ${missingData.join(', ')}`);
        return;
      }

      const room = JSON.parse(roomData!);
      const conditions = JSON.parse(conditionsData!);
      const construction = JSON.parse(constructionData!);
      const product = JSON.parse(productData!);
      const usage = JSON.parse(usageData!);

      // Merge all data for calculation
      const mergedRoomData = { ...room, ...construction };
      const mergedProductData = { ...product, ...usage };

      console.log('Debug - Merged data:');
      console.log('mergedRoomData:', mergedRoomData);
      console.log('conditions:', conditions);
      console.log('mergedProductData:', mergedProductData);

      const calculationResults = calculateBlastFreezerLoad(mergedRoomData, conditions, mergedProductData);
      console.log('Debug - Calculation results:', calculationResults);
      setResults(calculationResults);
      
      if (calculationResults) {
        console.log('✅ Blast freezer calculations completed successfully');
      }
    } catch (error) {
      console.error('Error calculating results:', error);
      Alert.alert('Error', 'Unable to calculate results. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    try {
      // Create demo data using defaults
      const demoRoomData = {
        length: BLAST_FREEZER_DEFAULTS.length.toString(),
        breadth: BLAST_FREEZER_DEFAULTS.breadth.toString(),
        height: BLAST_FREEZER_DEFAULTS.height.toString(),
        doorWidth: BLAST_FREEZER_DEFAULTS.doorWidth.toString(),
        doorHeight: BLAST_FREEZER_DEFAULTS.doorHeight.toString(),
      };

      const demoConditionsData = {
        ambientTemp: BLAST_FREEZER_DEFAULTS.ambientTemp.toString(),
        roomTemp: BLAST_FREEZER_DEFAULTS.roomTemp.toString(),
        batchHours: BLAST_FREEZER_DEFAULTS.batchHours.toString(),
        operatingHours: BLAST_FREEZER_DEFAULTS.operatingHours.toString(),
      };

      const demoConstructionData = {
        insulationType: BLAST_FREEZER_DEFAULTS.insulationType,
        wallThickness: BLAST_FREEZER_DEFAULTS.wallThickness,
        ceilingThickness: BLAST_FREEZER_DEFAULTS.ceilingThickness,
        floorThickness: BLAST_FREEZER_DEFAULTS.floorThickness,
        internalFloorThickness: BLAST_FREEZER_DEFAULTS.internalFloorThickness.toString(),
      };

      const demoProductData = {
        productType: BLAST_FREEZER_DEFAULTS.productType,
        capacityRequired: BLAST_FREEZER_DEFAULTS.capacityRequired.toString(),
        incomingTemp: BLAST_FREEZER_DEFAULTS.incomingTemp.toString(),
        outgoingTemp: BLAST_FREEZER_DEFAULTS.outgoingTemp.toString(),
        storageCapacity: BLAST_FREEZER_DEFAULTS.storageCapacity.toString(),
        numberOfPeople: BLAST_FREEZER_DEFAULTS.numberOfPeople.toString(),
        workingHours: BLAST_FREEZER_DEFAULTS.workingHours.toString(),
        lightLoad: BLAST_FREEZER_DEFAULTS.lightLoad.toString(),
        fanMotorRating: BLAST_FREEZER_DEFAULTS.fanMotorRating.toString(),
      };

      const demoUsageData = {
        peripheralHeatersQty: BLAST_FREEZER_DEFAULTS.peripheralHeatersQty.toString(),
        peripheralHeatersCapacity: BLAST_FREEZER_DEFAULTS.peripheralHeatersCapacity.toString(),
        doorHeatersQty: BLAST_FREEZER_DEFAULTS.doorHeatersQty.toString(),
        doorHeatersCapacity: BLAST_FREEZER_DEFAULTS.doorHeatersCapacity.toString(),
        trayHeatersQty: BLAST_FREEZER_DEFAULTS.trayHeatersQty.toString(),
        trayHeatersCapacity: BLAST_FREEZER_DEFAULTS.trayHeatersCapacity.toString(),
        drainHeatersQty: BLAST_FREEZER_DEFAULTS.drainHeatersQty.toString(),
        drainHeatersCapacity: BLAST_FREEZER_DEFAULTS.drainHeatersCapacity.toString(),
        airFlowPerFan: BLAST_FREEZER_DEFAULTS.airFlowPerFan.toString(),
      };

      // Save demo data to AsyncStorage
      await AsyncStorage.setItem('blastFreezerRoomData', JSON.stringify(demoRoomData));
      await AsyncStorage.setItem('blastFreezerConditionsData', JSON.stringify(demoConditionsData));
      await AsyncStorage.setItem('blastFreezerConstructionData', JSON.stringify(demoConstructionData));
      await AsyncStorage.setItem('blastFreezerProductData', JSON.stringify(demoProductData));
      await AsyncStorage.setItem('blastFreezerUsageData', JSON.stringify(demoUsageData));

      // Recalculate with demo data
      calculateResults();
      
      Alert.alert(
        'Demo Data Loaded',
        'Sample blast freezer data has been loaded. You can now see the calculation results and modify the values in other tabs as needed.'
      );
    } catch (error) {
      console.error('Error loading demo data:', error);
      Alert.alert('Error', 'Failed to load demo data.');
    }
  };

  const handleExport = async () => {
    if (!results) return;

    const reportData = `
BLAST FREEZER COOLING LOAD CALCULATION REPORT
==============================================

ROOM SPECIFICATIONS:
- Dimensions: ${results.dimensions.length}m × ${results.dimensions.breadth}m × ${results.dimensions.height}m
- Volume: ${results.volume.toFixed(2)} m³
- Wall Area: ${results.areas.wall.toFixed(2)} m²
- Ceiling Area: ${results.areas.ceiling.toFixed(2)} m²
- Floor Area: ${results.areas.floor.toFixed(2)} m²
- Door Area: ${results.areas.door.toFixed(2)} m²

OPERATING CONDITIONS:
- Ambient Temperature: ${results.conditions.ambientTemp}°C
- Room Temperature: ${results.conditions.roomTemp}°C
- Temperature Difference: ${results.temperatureDifference.toFixed(1)}°C
- Batch Hours: ${results.batchHours} hrs
- Operating Hours: ${results.conditions.operatingHours} hrs/day

CONSTRUCTION:
- Insulation Type: ${results.construction.type}
- Wall Thickness: ${results.construction.wallThickness}mm
- Ceiling Thickness: ${results.construction.ceilingThickness}mm
- Floor Thickness: ${results.construction.floorThickness}mm
- Internal Floor Thickness: ${results.construction.internalFloorThickness}mm
- Wall U-Factor: ${results.construction.uFactors.walls.toFixed(3)} W/m²K
- Ceiling U-Factor: ${results.construction.uFactors.ceiling.toFixed(3)} W/m²K
- Floor U-Factor: ${results.construction.uFactors.floor.toFixed(3)} W/m²K

PRODUCT INFORMATION:
- Product Type: ${results.productInfo.type}
- Capacity Required: ${results.productInfo.mass} kg
- Incoming Temperature: ${results.productInfo.incomingTemp}°C
- Outgoing Temperature: ${results.productInfo.outgoingTemp}°C
- Specific Heat Above: ${results.productInfo.properties.specificHeatAbove} kJ/kg·K
- Specific Heat Below: ${results.productInfo.properties.specificHeatBelow} kJ/kg·K
- Latent Heat: ${results.productInfo.properties.latentHeat} kJ/kg
- Freezing Point: ${results.productInfo.properties.freezingPoint}°C

STORAGE CAPACITY:
- Maximum Storage: ${results.storageCapacity.maximum.toFixed(0)} kg
- Storage Density: ${results.storageCapacity.density} kg/m³
- Utilization: ${results.storageCapacity.utilization.toFixed(1)}%

COOLING LOAD BREAKDOWN:
1. Transmission Load:
   - Walls: ${results.breakdown.transmission.walls.toFixed(3)} kW
   - Ceiling: ${results.breakdown.transmission.ceiling.toFixed(3)} kW
   - Floor: ${results.breakdown.transmission.floor.toFixed(3)} kW
   - Total: ${results.breakdown.transmission.total.toFixed(3)} kW

2. Product Load (3-Stage):
   - Sensible Above Freezing: ${results.breakdown.product.sensibleAbove.toFixed(3)} kW
   - Latent Heat (Freezing): ${results.breakdown.product.latent.toFixed(3)} kW
   - Sensible Below Freezing: ${results.breakdown.product.sensibleBelow.toFixed(3)} kW
   - Total: ${results.breakdown.product.total.toFixed(3)} kW

3. Air Change Load: ${results.breakdown.airChange.loadKW.toFixed(3)} kW

4. Internal Loads:
   - Occupancy: ${results.breakdown.internal.occupancy.toFixed(3)} kW
   - Lighting: ${results.breakdown.internal.lighting.toFixed(3)} kW
   - Equipment: ${results.breakdown.internal.equipment.toFixed(3)} kW
   - Peripheral Heaters: ${results.breakdown.internal.peripheralHeaters.toFixed(3)} kW
   - Door Heaters: ${results.breakdown.internal.doorHeaters.toFixed(3)} kW
   - Tray Heaters: ${results.breakdown.internal.trayHeaters.toFixed(3)} kW
   - Drain Heaters: ${results.breakdown.internal.drainHeaters.toFixed(3)} kW
   - Total: ${results.breakdown.internal.total.toFixed(3)} kW

SPECIFIC OUTPUTS:
- Load in kJ/Batch: ${results.engineeringOutputs.loadKJPerBatch.toFixed(0)} kJ
- Sensible Heat in kJ/24 Hr: ${results.engineeringOutputs.sensibleHeatKJ24Hr.toFixed(0)} kJ
- Latent Heat in kJ/24 Hr: ${results.engineeringOutputs.latentHeatKJ24Hr.toFixed(0)} kJ
- SHR (Sensible Heat Ratio): ${results.engineeringOutputs.SHR.toFixed(3)}
- Air Qty Required: ${results.engineeringOutputs.airQtyRequiredCfm.toFixed(0)} CFM

FINAL RESULTS:
- Total Load (Before Safety): ${results.loadSummary.totalCalculatedKW.toFixed(3)} kW
- Safety Factor Load (5%): ${results.loadSummary.safetyFactorKW.toFixed(3)} kW
- Final Load: ${results.loadSummary.finalLoadKW.toFixed(3)} kW
- Refrigeration Capacity: ${results.totalTR.toFixed(2)} TR
- BTU/hr: ${results.totalBTU.toFixed(0)} BTU/hr
- Daily Energy: ${results.dailyEnergyConsumption.toFixed(0)} kWh/day

EQUIPMENT SUMMARY:
- Total Fan Load: ${results.equipmentSummary.totalFanLoad.toFixed(2)} kW
- Total Heater Load: ${results.equipmentSummary.totalHeaterLoad.toFixed(2)} kW
- Total Lighting Load: ${results.equipmentSummary.totalLightingLoad.toFixed(2)} kW
- Total People Load: ${results.equipmentSummary.totalPeopleLoad.toFixed(3)} kW

Generated by Enzo CoolCalc
Date: ${new Date().toLocaleDateString()}
    `;

    try {
      await Share.share({
        message: reportData,
        title: 'Blast Freezer Cooling Load Report'
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={6} totalSteps={6} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Results" step={6} totalSteps={6} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Setup Required</Text>
          <Text style={styles.errorText}>
            Please complete the following steps to calculate results:
          </Text>
          <View style={styles.stepsList}>
            <Text style={styles.stepText}>1. Fill out Room specifications</Text>
            <Text style={styles.stepText}>2. Set Operating conditions</Text>
            <Text style={styles.stepText}>3. Configure Construction details</Text>
            <Text style={styles.stepText}>4. Enter Product information</Text>
            <Text style={styles.stepText}>5. Set Heater usage</Text>
          </View>
          <Text style={styles.instructionText}>
            Use the tabs below to navigate between sections.
          </Text>
          <TouchableOpacity style={styles.demoButton} onPress={loadDemoData}>
            <Play color="#FFFFFF" size={16} strokeWidth={2} />
            <Text style={styles.demoButtonText}>Load Demo Data</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Blast Freezer Results" step={6} totalSteps={6} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Final Results Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Final Cooling Load</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Load:</Text>
            <Text style={styles.summaryValue}>{results.loadSummary.finalLoadKW.toFixed(2)} kW</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Refrigeration Tons:</Text>
            <Text style={styles.summaryValue}>{results.totalTR.toFixed(2)} TR</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>BTU/hr:</Text>
            <Text style={styles.summaryValue}>{results.totalBTU.toFixed(0)} BTU/hr</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>SHR (Sensible Heat Ratio):</Text>
            <Text style={styles.summaryValue}>{results.engineeringOutputs.SHR.toFixed(3)}</Text>
          </View>
        </View>

        {/* Specific Outputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Outputs</Text>
          
          <View style={styles.specificCard}>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Load in kJ/Batch:</Text>
              <Text style={styles.specificValue}>{results.engineeringOutputs.loadKJPerBatch.toFixed(0)} kJ</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Sensible Heat in kJ/24 Hr:</Text>
              <Text style={styles.specificValue}>{results.engineeringOutputs.sensibleHeatKJ24Hr.toFixed(0)} kJ</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Latent Heat in kJ/24 Hr:</Text>
              <Text style={styles.specificValue}>{results.engineeringOutputs.latentHeatKJ24Hr.toFixed(0)} kJ</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>SHR (Sensible Heat Ratio):</Text>
              <Text style={styles.specificValue}>{results.engineeringOutputs.SHR.toFixed(3)}</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Air Qty Required:</Text>
              <Text style={styles.specificValue}>{results.engineeringOutputs.airQtyRequiredCfm.toFixed(0)} CFM</Text>
            </View>
          </View>
        </View>

        {/* Load Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>1. Transmission Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Walls</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.transmission.walls.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Ceiling</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.transmission.ceiling.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Floor</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.transmission.floor.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>2. Product Load (3-Stage)</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Sensible Above Freezing</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.product.sensibleAbove.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Latent Heat (Freezing)</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.product.latent.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Sensible Below Freezing</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.product.sensibleBelow.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>3. Air Change Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.loadKW.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>4. Internal Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.internal.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Occupancy</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.occupancy.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Lighting</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.lighting.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Equipment</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Peripheral Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.peripheralHeaters.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Door Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.doorHeaters.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Tray Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.trayHeaters.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Drain Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.internal.drainHeaters.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Before Safety:</Text>
              <Text style={styles.totalValue}>{results.loadSummary.totalCalculatedKW.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor (5%):</Text>
              <Text style={styles.breakdownValue}>{results.loadSummary.safetyFactorKW.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>Final Load:</Text>
              <Text style={styles.finalValue}>{results.loadSummary.finalLoadKW.toFixed(3)} kW</Text>
            </View>
          </View>
        </View>

        {/* Room & Storage Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room & Storage Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Room Volume:</Text>
              <Text style={styles.infoValue}>{results.volume.toFixed(2)} m³</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Temperature Difference:</Text>
              <Text style={styles.infoValue}>{results.temperatureDifference.toFixed(1)}°C</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batch Processing Time:</Text>
              <Text style={styles.infoValue}>{results.batchHours} hours</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Maximum Storage:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.maximum.toFixed(0)} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Storage Utilization:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.utilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Storage Density:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.density} kg/m³</Text>
            </View>
          </View>
        </View>

        {/* Air Flow Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Air Flow Requirements</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Required CFM:</Text>
              <Text style={styles.infoValue}>{results.engineeringOutputs.airQtyRequiredCfm.toFixed(0)} CFM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Air Flow per Fan:</Text>
              <Text style={styles.infoValue}>{results.conditions.airFlowPerFan} CFM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Air Change Rate:</Text>
              <Text style={styles.infoValue}>{results.conditions.airChangeRate} changes/hr</Text>
            </View>
          </View>
        </View>

        {/* Equipment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Summary</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fan Motor Load:</Text>
              <Text style={styles.infoValue}>{results.equipmentSummary.totalFanLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Heater Load:</Text>
              <Text style={styles.infoValue}>{results.equipmentSummary.totalHeaterLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lighting Load:</Text>
              <Text style={styles.infoValue}>{results.equipmentSummary.totalLightingLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>People Load:</Text>
              <Text style={styles.infoValue}>{results.equipmentSummary.totalPeopleLoad.toFixed(3)} kW</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <FileText color="#FFFFFF" size={20} strokeWidth={2} />
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '100%',
  },
  stepText: {
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
    paddingLeft: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  demoButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  specificCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  specificRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  specificLabel: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  specificValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  subBreakdownLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  subBreakdownValue: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    borderBottomWidth: 0,
    backgroundColor: '#EBF8FF',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginTop: 8,
    paddingTop: 12,
    paddingBottom: 12,
  },
  finalLabel: {
    fontSize: 18,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  finalValue: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});