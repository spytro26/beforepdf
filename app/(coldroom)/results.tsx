import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileText, Download, Play } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateColdRoomLoad } from '@/utils/coldRoomCalculations';
import { COLD_ROOM_DEFAULTS } from '@/constants/coldRoomData';
import { useFocusEffect } from '@react-navigation/native';
import { generateColdRoomPDF } from '@/utils/pdfGenerator';

export default function ColdRoomResultsScreen() {
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
      const roomData = await AsyncStorage.getItem('coldRoomData');
      const conditionsData = await AsyncStorage.getItem('coldRoomConditionsData');
      const constructionData = await AsyncStorage.getItem('coldRoomConstructionData');
      const productData = await AsyncStorage.getItem('coldRoomProductData');

      let dataInitialized = false;

      // If any data is missing, populate with defaults
      if (!roomData) {
        const defaultRoomData = {
          length: COLD_ROOM_DEFAULTS.length.toString(),
          width: COLD_ROOM_DEFAULTS.width.toString(),
          height: COLD_ROOM_DEFAULTS.height.toString(),
          doorWidth: COLD_ROOM_DEFAULTS.doorWidth.toString(),
          doorHeight: COLD_ROOM_DEFAULTS.doorHeight.toString(),
          doorOpenings: COLD_ROOM_DEFAULTS.dailyDoorOpenings.toString(),
          doorClearOpening: COLD_ROOM_DEFAULTS.doorClearOpening.toString(),
          storageDensity: COLD_ROOM_DEFAULTS.storageDensity.toString(),
          airFlowPerFan: COLD_ROOM_DEFAULTS.airFlowPerFan.toString(),
        };
        await AsyncStorage.setItem('coldRoomData', JSON.stringify(defaultRoomData));
        dataInitialized = true;
      }

      if (!conditionsData) {
        const defaultConditionsData = {
          externalTemp: COLD_ROOM_DEFAULTS.externalTemp.toString(),
          internalTemp: COLD_ROOM_DEFAULTS.internalTemp.toString(),
          operatingHours: COLD_ROOM_DEFAULTS.operatingHours.toString(),
          pullDownTime: COLD_ROOM_DEFAULTS.pullDownTime.toString(),
        };
        await AsyncStorage.setItem('coldRoomConditionsData', JSON.stringify(defaultConditionsData));
        dataInitialized = true;
      }

      if (!constructionData) {
        const defaultConstructionData = {
          insulationType: COLD_ROOM_DEFAULTS.insulationType,
          insulationThickness: COLD_ROOM_DEFAULTS.insulationThickness,
          internalFloorThickness: COLD_ROOM_DEFAULTS.internalFloorThickness.toString(),
          numberOfHeaters: COLD_ROOM_DEFAULTS.numberOfHeaters.toString(),
          numberOfDoors: COLD_ROOM_DEFAULTS.numberOfDoors.toString(),
        };
        await AsyncStorage.setItem('coldRoomConstructionData', JSON.stringify(defaultConstructionData));
        dataInitialized = true;
      }

      if (!productData) {
        const defaultProductData = {
          productType: COLD_ROOM_DEFAULTS.productType,
          dailyLoad: COLD_ROOM_DEFAULTS.dailyProductLoad.toString(),
          incomingTemp: COLD_ROOM_DEFAULTS.productIncomingTemp.toString(),
          outgoingTemp: COLD_ROOM_DEFAULTS.productOutgoingTemp.toString(),
          specificHeatAbove: COLD_ROOM_DEFAULTS.specificHeatAbove.toString(),
          respirationRate: COLD_ROOM_DEFAULTS.respirationRate.toString(),
          storageType: COLD_ROOM_DEFAULTS.storageType,
          numberOfPeople: COLD_ROOM_DEFAULTS.numberOfPeople.toString(),
          workingHours: COLD_ROOM_DEFAULTS.hoursWorking.toString(),
          lightingWattage: COLD_ROOM_DEFAULTS.lightingWattage.toString(),
          equipmentLoad: COLD_ROOM_DEFAULTS.equipmentLoad.toString(),
        };
        await AsyncStorage.setItem('coldRoomProductData', JSON.stringify(defaultProductData));
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
      const roomData = await AsyncStorage.getItem('coldRoomData');
      const conditionsData = await AsyncStorage.getItem('coldRoomConditionsData');
      const constructionData = await AsyncStorage.getItem('coldRoomConstructionData');
      const productData = await AsyncStorage.getItem('coldRoomProductData');

      console.log('Debug - Storage data:');
      console.log('roomData:', roomData);
      console.log('conditionsData:', conditionsData);
      console.log('constructionData:', constructionData);
      console.log('productData:', productData);

      // Check which data is missing
      const missingData = [];
      if (!roomData) missingData.push('Room specifications');
      if (!conditionsData) missingData.push('Operating conditions');
      if (!productData) missingData.push('Product information');

      if (missingData.length > 0) {
        console.log('Missing data:', missingData);
        setResults(null);
        // Don't show alert on first load, just log it
        console.warn(`Missing data: ${missingData.join(', ')}`);
        return;
      }

      const room = JSON.parse(roomData!);
      const conditions = JSON.parse(conditionsData!);
      const construction = constructionData ? JSON.parse(constructionData) : {};
      const product = JSON.parse(productData!);

      console.log('Debug - Parsed data:');
      console.log('room:', room);
      console.log('conditions:', conditions);
      console.log('construction:', construction);
      console.log('product:', product);

      // Merge construction data with room data
      const mergedRoomData = { ...room, ...construction };

      console.log('Debug - Merged room data:', mergedRoomData);

      const calculationResults = calculateColdRoomLoad(mergedRoomData, conditions, product);
      console.log('Debug - Calculation results:', calculationResults);
      setResults(calculationResults);
      
      // Show a brief success indicator
      if (calculationResults) {
        console.log('✅ Cold room calculations completed successfully');
      }
    } catch (error) {
      console.error('Error calculating results:', error);
      console.error('Error details:', error);
      Alert.alert('Error', 'Unable to calculate results. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    try {
      // Create demo data using defaults
      const demoRoomData = {
        length: COLD_ROOM_DEFAULTS.length.toString(),
        width: COLD_ROOM_DEFAULTS.width.toString(),
        height: COLD_ROOM_DEFAULTS.height.toString(),
        doorWidth: COLD_ROOM_DEFAULTS.doorWidth.toString(),
        doorHeight: COLD_ROOM_DEFAULTS.doorHeight.toString(),
        doorOpenings: COLD_ROOM_DEFAULTS.dailyDoorOpenings.toString(),
        doorClearOpening: COLD_ROOM_DEFAULTS.doorClearOpening.toString(),
        storageDensity: COLD_ROOM_DEFAULTS.storageDensity.toString(),
        airFlowPerFan: COLD_ROOM_DEFAULTS.airFlowPerFan.toString(),
      };

      const demoConditionsData = {
        externalTemp: COLD_ROOM_DEFAULTS.externalTemp.toString(),
        internalTemp: COLD_ROOM_DEFAULTS.internalTemp.toString(),
        operatingHours: COLD_ROOM_DEFAULTS.operatingHours.toString(),
        pullDownTime: COLD_ROOM_DEFAULTS.pullDownTime.toString(),
      };

      const demoConstructionData = {
        insulationType: COLD_ROOM_DEFAULTS.insulationType,
        insulationThickness: COLD_ROOM_DEFAULTS.insulationThickness,
        internalFloorThickness: COLD_ROOM_DEFAULTS.internalFloorThickness.toString(),
        numberOfHeaters: COLD_ROOM_DEFAULTS.numberOfHeaters.toString(),
        numberOfDoors: COLD_ROOM_DEFAULTS.numberOfDoors.toString(),
      };

      const demoProductData = {
        productType: COLD_ROOM_DEFAULTS.productType,
        dailyLoad: COLD_ROOM_DEFAULTS.dailyProductLoad.toString(),
        incomingTemp: COLD_ROOM_DEFAULTS.productIncomingTemp.toString(),
        outgoingTemp: COLD_ROOM_DEFAULTS.productOutgoingTemp.toString(),
        specificHeatAbove: COLD_ROOM_DEFAULTS.specificHeatAbove.toString(),
        respirationRate: COLD_ROOM_DEFAULTS.respirationRate.toString(),
        storageType: COLD_ROOM_DEFAULTS.storageType,
        numberOfPeople: COLD_ROOM_DEFAULTS.numberOfPeople.toString(),
        workingHours: COLD_ROOM_DEFAULTS.hoursWorking.toString(),
        lightingWattage: COLD_ROOM_DEFAULTS.lightingWattage.toString(),
        equipmentLoad: COLD_ROOM_DEFAULTS.equipmentLoad.toString(),
      };

      // Save demo data to AsyncStorage
      await AsyncStorage.setItem('coldRoomData', JSON.stringify(demoRoomData));
      await AsyncStorage.setItem('coldRoomConditionsData', JSON.stringify(demoConditionsData));
      await AsyncStorage.setItem('coldRoomConstructionData', JSON.stringify(demoConstructionData));
      await AsyncStorage.setItem('coldRoomProductData', JSON.stringify(demoProductData));

      // Recalculate with demo data
      calculateResults();
      
      Alert.alert(
        'Demo Data Loaded',
        'Sample cold room data has been loaded. You can now see the calculation results and modify the values in other tabs as needed.'
      );
    } catch (error) {
      console.error('Error loading demo data:', error);
      Alert.alert('Error', 'Failed to load demo data.');
    }
  };

  const handleExport = async () => {
    if (!results) return;

    try {
      // Gather input data for the PDF
      const inputData = {
        room: {
          length: results.dimensions.length,
          width: results.dimensions.width,
          height: results.dimensions.height,
          volume: results.volume,
          insulationType: results.construction.type,
          insulationThickness: results.construction.thickness
        },
        conditions: {
          externalTemp: results.conditions.externalTemp,
          internalTemp: results.conditions.internalTemp,
          temperatureDifference: results.temperatureDifference,
          operatingHours: results.conditions.operatingHours,
          pullDownTime: results.pullDownTime || 12
        },
        product: {
          type: results.productInfo.type,
          dailyLoad: results.productInfo.mass,
          incomingTemp: results.productInfo.incomingTemp,
          outgoingTemp: results.productInfo.outgoingTemp,
          storageType: results.storageCapacity.type || 'General Storage',
          numberOfPeople: results.conditions.numberOfPeople || 2
        }
      };

      // Format results for PDF
      const pdfResults = {
        room: inputData.room,
        conditions: inputData.conditions,
        product: inputData.product,
        loadBreakdown: {
          transmissionLoad: {
            walls: results.breakdown.transmission.walls,
            ceiling: results.breakdown.transmission.ceiling,
            floor: results.breakdown.transmission.floor,
            total: results.breakdown.transmission.total
          },
          productLoad: results.breakdown.product,
          respirationLoad: results.breakdown.respiration,
          airInfiltrationLoad: results.breakdown.airChange,
          internalLoads: {
            occupancy: results.breakdown.miscellaneous.occupancy,
            lighting: results.breakdown.miscellaneous.lighting,
            equipment: results.breakdown.miscellaneous.equipment,
            total: results.breakdown.miscellaneous.total
          }
        },
        totalLoad: {
          finalLoadKW: results.finalLoad
        },
        conversions: {
          totalTR: results.totalTR,
          totalBTU: results.totalBTU
        }
      };

      await generateColdRoomPDF(pdfResults, inputData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={5} totalSteps={5} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Results" step={5} totalSteps={5} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Setup Required</Text>
          <Text style={styles.errorText}>
            Please complete the following steps to calculate results:
          </Text>
          <View style={styles.stepsList}>
            <Text style={styles.stepText}>1. Fill out Room specifications</Text>
            <Text style={styles.stepText}>2. Set Operating conditions</Text>
            <Text style={styles.stepText}>3. Configure Construction details (optional)</Text>
            <Text style={styles.stepText}>4. Enter Product information</Text>
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
      <Header title="Cold Room Results" step={5} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Final Results Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Final Cooling Load</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Load:</Text>
            <Text style={styles.summaryValue}>{results.finalLoad.toFixed(2)} kW</Text>
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
            <Text style={styles.summaryLabel}>Daily Energy:</Text>
            <Text style={styles.summaryValue}>{results.dailyKJ.toFixed(0)} kJ/day</Text>
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
              <Text style={styles.breakdownLabel}>2. Product Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>3. Respiration Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.respiration.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>4. Air Change Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>5. Door Opening Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.doorOpening.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>6. Miscellaneous Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Equipment</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Occupancy</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.occupancy.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Lighting</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.lighting.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>7. Heater Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Peripheral</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.heaters.peripheral.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Door</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.heaters.door.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Steam</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.heaters.steam.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Before Safety:</Text>
              <Text style={styles.totalValue}>{results.totalBeforeSafety.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor (10%):</Text>
              <Text style={styles.breakdownValue}>{results.safetyFactorLoad.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>Final Load:</Text>
              <Text style={styles.finalValue}>{results.finalLoad.toFixed(3)} kW</Text>
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
              <Text style={styles.infoLabel}>Maximum Storage:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.maximum.toFixed(0)} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Storage Utilization:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.utilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available Capacity:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.availableCapacity.toFixed(0)} kg</Text>
            </View>
          </View>
        </View>

        {/* Air Flow Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Air Flow Requirements</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Required CFM:</Text>
              <Text style={styles.infoValue}>{results.airFlowInfo.requiredCfm} CFM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recommended CFM:</Text>
              <Text style={styles.infoValue}>{results.airFlowInfo.recommendedCfm.toFixed(0)} CFM</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <FileText color="#FFFFFF" size={20} strokeWidth={2} />
            <Text style={styles.exportButtonText}>Generate PDF</Text>
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