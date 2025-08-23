import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileText, Play } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateEnhancedFreezerLoad } from '@/utils/enhancedFreezerCalculations';
import { FREEZER_DEFAULTS } from '@/constants/freezerData';
import { useFocusEffect } from '@react-navigation/native';
import { generateFreezerPDF } from '@/utils/pdfGenerator';

export default function FreezerResultsScreen() {
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
      const roomData = await AsyncStorage.getItem('roomData');
      const conditionsData = await AsyncStorage.getItem('conditionsData');
      const productData = await AsyncStorage.getItem('productData');

      let dataInitialized = false;

      // If any data is missing, populate with defaults
      if (!roomData) {
        const defaultRoomData = {
          length: FREEZER_DEFAULTS.length.toString(),
          width: FREEZER_DEFAULTS.width.toString(),
          height: FREEZER_DEFAULTS.height.toString(),
          doorWidth: FREEZER_DEFAULTS.doorWidth.toString(),
          doorHeight: FREEZER_DEFAULTS.doorHeight.toString(),
          doorOpenings: FREEZER_DEFAULTS.dailyDoorOpenings.toString(),
          insulationType: FREEZER_DEFAULTS.insulationType,
          insulationThickness: FREEZER_DEFAULTS.insulationThickness,
          internalFloorThickness: FREEZER_DEFAULTS.internalFloorThickness.toString(),
          numberOfFloors: FREEZER_DEFAULTS.numberOfFloors.toString(),
          doorClearOpening: FREEZER_DEFAULTS.doorClearOpening.toString(),
          storageCapacity: FREEZER_DEFAULTS.storageCapacity.toString(),
        };
        await AsyncStorage.setItem('roomData', JSON.stringify(defaultRoomData));
        dataInitialized = true;
      }

      if (!conditionsData) {
        const defaultConditionsData = {
          externalTemp: FREEZER_DEFAULTS.externalTemp.toString(),
          internalTemp: FREEZER_DEFAULTS.internalTemp.toString(),
          operatingHours: FREEZER_DEFAULTS.operatingHours.toString(),
          pullDownTime: FREEZER_DEFAULTS.pullDownTime.toString(),
          roomHumidity: FREEZER_DEFAULTS.roomHumidity.toString(),
          steamHumidifierLoad: FREEZER_DEFAULTS.steamHumidifierLoad.toString(),
          airFlowPerFan: FREEZER_DEFAULTS.fanAirFlowRate.toString(),
        };
        await AsyncStorage.setItem('conditionsData', JSON.stringify(defaultConditionsData));
        dataInitialized = true;
      }

      if (!productData) {
        const defaultProductData = {
          productType: FREEZER_DEFAULTS.productType,
          dailyLoad: FREEZER_DEFAULTS.dailyProductLoad.toString(),
          incomingTemp: FREEZER_DEFAULTS.productIncomingTemp.toString(),
          outgoingTemp: FREEZER_DEFAULTS.productOutgoingTemp.toString(),
          storageType: FREEZER_DEFAULTS.storageType,
          numberOfPeople: FREEZER_DEFAULTS.numberOfPeople.toString(),
          workingHours: FREEZER_DEFAULTS.hoursWorking.toString(),
          lightingWattage: FREEZER_DEFAULTS.lightingWattage.toString(),
          equipmentLoad: FREEZER_DEFAULTS.equipmentLoad.toString(),
          fanMotorRating: FREEZER_DEFAULTS.fanMotorRating.toString(),
          numberOfFans: FREEZER_DEFAULTS.numberOfFans.toString(),
          fanOperatingHours: FREEZER_DEFAULTS.fanOperatingHours.toString(),
          fanAirFlowRate: FREEZER_DEFAULTS.fanAirFlowRate.toString(),
          doorHeatersLoad: FREEZER_DEFAULTS.doorHeatersLoad.toString(),
          trayHeatersLoad: FREEZER_DEFAULTS.trayHeatersLoad.toString(),
          peripheralHeatersLoad: FREEZER_DEFAULTS.peripheralHeatersLoad.toString(),
        };
        await AsyncStorage.setItem('productData', JSON.stringify(defaultProductData));
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
      const roomData = await AsyncStorage.getItem('roomData');
      const conditionsData = await AsyncStorage.getItem('conditionsData');
      const productData = await AsyncStorage.getItem('productData');

      console.log('Debug - Storage data:');
      console.log('roomData:', roomData);
      console.log('conditionsData:', conditionsData);
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
      const product = JSON.parse(productData!);

      console.log('Debug - Parsed data:');
      console.log('room:', room);
      console.log('conditions:', conditions);
      console.log('product:', product);

      const calculationResults = calculateEnhancedFreezerLoad(room, conditions, product);
      console.log('Debug - Calculation results:', calculationResults);
      setResults(calculationResults);
      
      // Show a brief success indicator
      if (calculationResults) {
        console.log('✅ Freezer calculations completed successfully');
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
      // Create demo data using Excel exact values
      const demoRoomData = {
        length: '7.0',
        width: '4.0',
        height: '3.5',
        doorWidth: '1.8',
        doorHeight: '2.0',
        doorOpenings: '15',
        insulationType: 'PUF',
        insulationThickness: 150,
        internalFloorThickness: '150',
        numberOfFloors: '1',
        doorClearOpening: '1800',
        storageCapacity: '10',
      };

      const demoConditionsData = {
        externalTemp: '45',
        internalTemp: '-35',
        operatingHours: '24',
        pullDownTime: '10',
        roomHumidity: '85',
        steamHumidifierLoad: '0',
        airFlowPerFan: '2000',
      };

      const demoProductData = {
        productType: 'fruit pulp',
        dailyLoad: '3000',
        incomingTemp: '25',
        outgoingTemp: '-15',
        storageType: 'Boxed',
        numberOfPeople: '2',
        workingHours: '16',
        lightingWattage: '140',
        equipmentLoad: '300',
        fanMotorRating: '0.37',
        numberOfFans: '6',
        fanOperatingHours: '24',
        fanAirFlowRate: '2000',
        doorHeatersLoad: '0.243',
        trayHeatersLoad: '2.0',
        peripheralHeatersLoad: '0',
        customCpAbove: '3.74',
        customCpBelow: '1.96',
        customLatentHeat: '233',
      };

      // Save demo data to AsyncStorage
      await AsyncStorage.setItem('roomData', JSON.stringify(demoRoomData));
      await AsyncStorage.setItem('conditionsData', JSON.stringify(demoConditionsData));
      await AsyncStorage.setItem('productData', JSON.stringify(demoProductData));

      // Recalculate with demo data
      calculateResults();
      
      Alert.alert(
        'Demo Data Loaded',
        'Sample freezer data has been loaded. You can now see the calculation results and modify the values in other tabs as needed.'
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
          operatingHours: 24,
          pullDownTime: results.pullDownTime
        },
        product: {
          type: results.productInfo.type,
          dailyLoad: results.productInfo.mass,
          incomingTemp: results.productInfo.incomingTemp,
          outgoingTemp: results.productInfo.outgoingTemp,
          storageType: results.storageCapacity.type,
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
          productLoad: {
            sensible: results.breakdown.product.sensibleAbove + results.breakdown.product.sensibleBelow,
            latent: results.breakdown.product.latent,
            total: results.breakdown.product.total
          },
          airInfiltrationLoad: results.breakdown.airChange,
          internalLoads: {
            occupancy: results.breakdown.miscellaneous.occupancy,
            lighting: results.breakdown.miscellaneous.lighting,
            equipment: results.breakdown.miscellaneous.equipment,
            total: results.breakdown.miscellaneous.total
          }
        },
        totalLoad: {
          finalLoadKW: results.loadSummary.finalLoad
        },
        conversions: {
          totalTR: results.totalTR,
          totalBTU: results.totalBTU
        }
      };

      await generateFreezerPDF(pdfResults, inputData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={4} totalSteps={4} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Results" step={4} totalSteps={4} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Setup Required</Text>
          <Text style={styles.errorText}>
            Please complete the following steps to calculate results:
          </Text>
          <View style={styles.stepsList}>
            <Text style={styles.stepText}>1. Fill out Room specifications</Text>
            <Text style={styles.stepText}>2. Set Operating conditions</Text>
            <Text style={styles.stepText}>3. Enter Product & Equipment information</Text>
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
      <Header title="Freezer Results" step={4} totalSteps={4} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Final Results Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Final Cooling Load</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Load:</Text>
            <Text style={styles.summaryValue}>{results.loadSummary.finalLoad.toFixed(2)} kW</Text>
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
            <Text style={styles.summaryValue}>{results.excelOutputs.SHR.toFixed(3)}</Text>
          </View>
        </View>

        {/* Specific Outputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Outputs</Text>
          
          <View style={styles.specificCard}>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Load in kJ/24 Hrs:</Text>
              <Text style={styles.specificValue}>{results.excelOutputs.totalKJ24Hr.toFixed(0)} kJ</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Sensible Heat in kJ/24 Hr:</Text>
              <Text style={styles.specificValue}>{results.excelOutputs.sensibleHeatKJ24Hr.toFixed(0)} kJ</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Latent Heat in kJ/24 Hr:</Text>
              <Text style={styles.specificValue}>{results.excelOutputs.latentHeatKJ24Hr.toFixed(0)} kJ</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>SHR (Sensible Heat Ratio):</Text>
              <Text style={styles.specificValue}>{results.excelOutputs.SHR.toFixed(3)}</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Air Qty Required:</Text>
              <Text style={styles.specificValue}>{results.excelOutputs.airQtyRequiredCfm.toFixed(0)} cfm</Text>
            </View>
            <View style={styles.specificRow}>
              <Text style={styles.specificLabel}>Maximum Storage:</Text>
              <Text style={styles.specificValue}>{results.excelOutputs.maximumStorageExcel.toFixed(0)} kg</Text>
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
              <Text style={styles.subBreakdownLabel}>• Before Freezing (25°C to -0.8°C)</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.product.sensibleAbove.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Latent Heat (Freezing at -0.8°C)</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.product.latent.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• After Freezing (-0.8°C to -15°C)</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.product.sensibleBelow.toFixed(3)} kW</Text>
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
              <Text style={styles.breakdownLabel}>5. Miscellaneous Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Occupancy</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.occupancy.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Lighting</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.lighting.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Equipment</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Peripheral Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.peripheralHeaters.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Door Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.doorHeaters.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Tray Heaters</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.trayHeaters.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Steam Humidifiers</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.steamHumidifiers.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>6. Fan Motor Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.fanMotor.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Before Safety:</Text>
              <Text style={styles.totalValue}>{results.loadSummary.totalBeforeSafety.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor (10%):</Text>
              <Text style={styles.breakdownValue}>{results.loadSummary.safetyFactor.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>Final Load:</Text>
              <Text style={styles.finalValue}>{results.loadSummary.finalLoad.toFixed(3)} kW</Text>
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
              <Text style={styles.infoLabel}>Maximum Storage (Excel):</Text>
              <Text style={styles.infoValue}>{results.excelOutputs.maximumStorageExcel.toFixed(0)} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Maximum Storage (Calc):</Text>
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
              <Text style={styles.infoLabel}>Required CFM (Excel Formula):</Text>
              <Text style={styles.infoValue}>{results.excelOutputs.airQtyRequiredCfm.toFixed(0)} CFM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Installed CFM:</Text>
              <Text style={styles.infoValue}>{results.conditions.totalAirFlow} CFM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Air Flow per Fan:</Text>
              <Text style={styles.infoValue}>{results.conditions.airFlowPerFan} CFM</Text>
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
              <Text style={styles.infoLabel}>People Load:</Text>
              <Text style={styles.infoValue}>{results.equipmentSummary.totalPeopleLoad.toFixed(3)} kW</Text>
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
    borderBottomColor: '#DBEAFE',
  },
  specificLabel: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  specificValue: {
    fontSize: 14,
    color: '#2563EB',
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
    borderTopColor: '#1E40AF',
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
    color: '#1E40AF',
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