import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// Type definitions for the calculator results
interface BlastFreezerResults {
  dimensions: any;
  conditions: any;
  productInfo: any;
  breakdown: any;
  loadSummary: any;
  totalTR: number;
  totalKW: number;
  totalBTU: number;
  engineeringOutputs: any;
  storageCapacity: any;
  temperatureDifference: number;
  batchHours: number;
  construction: any;
  equipmentSummary: any;
}

interface FreezerResults {
  room: any;
  conditions: any;
  product: any;
  loadBreakdown: any;
  totalLoad: any;
  conversions: any;
  engineering: any;
  summaryData: any;
}

interface ColdRoomResults {
  room: any;
  conditions: any;
  product: any;
  loadBreakdown: any;
  totalLoad: any;
  conversions: any;
  engineering: any;
  summaryData: any;
}

// HTML template for PDF generation
const generateHTMLTemplate = (title: string, content: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1E3A8A;
          font-size: 28px;
          margin: 0;
        }
        .header p {
          color: #64748B;
          font-size: 14px;
          margin: 5px 0 0 0;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #1E3A8A;
          font-size: 18px;
          border-bottom: 2px solid #3B82F6;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .section h3 {
          color: #1E40AF;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .result-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 15px;
        }
        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #E2E8F0;
        }
        .result-item:last-child {
          border-bottom: none;
        }
        .result-label {
          font-weight: 500;
          color: #64748B;
        }
        .result-value {
          font-weight: 600;
          color: #3B82F6;
        }
        .highlight-result {
          background: #EBF8FF;
          border: 2px solid #3B82F6;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .highlight-result h3 {
          color: #1E3A8A;
          margin: 0 0 10px 0;
        }
        .highlight-value {
          font-size: 24px;
          font-weight: bold;
          color: #3B82F6;
        }
        .page-break {
          page-break-before: always;
        }
        .input-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .input-item {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 10px;
        }
        .input-label {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
        }
        .input-value {
          font-size: 14px;
          color: #1E3A8A;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #E2E8F0;
          color: #64748B;
          font-size: 12px;
        }
        .powered-by {
          background: linear-gradient(135deg, #3B82F6, #1E40AF);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 14px;
          display: inline-block;
          margin: 15px 0;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
};

// Blast Freezer PDF Generator
export const generateBlastFreezerPDF = async (results: BlastFreezerResults, inputData: any) => {
  try {
    const currentDate = new Date().toLocaleDateString();
    
    const content = `
      <div class="header">
        <h1>BLAST FREEZER COOLING LOAD CALCULATION REPORT</h1>
        <p>Generated on ${currentDate} | Enzo CoolCalc</p>
      </div>

      <!-- PAGE 1: RESULTS -->
      <div class="section">
        <div class="highlight-result">
          <h3>Final Cooling Load</h3>
          <div class="highlight-value">${results.loadSummary.finalLoadKW.toFixed(2)} kW</div>
          <div style="margin-top: 10px;">
            <span style="color: #64748B;">Refrigeration Capacity: </span>
            <span style="color: #3B82F6; font-weight: 600;">${results.totalTR.toFixed(2)} TR</span>
            <span style="margin-left: 20px; color: #64748B;">BTU/hr: </span>
            <span style="color: #3B82F6; font-weight: 600;">${results.totalBTU.toFixed(0)} BTU/hr</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Load Breakdown</h2>
        <div class="result-grid">
          <div class="result-card">
            <h3>Transmission Load</h3>
            <div class="result-item">
              <span class="result-label">Walls:</span>
              <span class="result-value">${results.breakdown.transmission.walls.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Ceiling:</span>
              <span class="result-value">${results.breakdown.transmission.ceiling.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Floor:</span>
              <span class="result-value">${results.breakdown.transmission.floor.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.breakdown.transmission.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
          
          <div class="result-card">
            <h3>Product Load (3-Stage)</h3>
            <div class="result-item">
              <span class="result-label">Sensible Above Freezing:</span>
              <span class="result-value">${results.breakdown.product.sensibleAbove.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Latent Heat (Freezing):</span>
              <span class="result-value">${results.breakdown.product.latent.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Sensible Below Freezing:</span>
              <span class="result-value">${results.breakdown.product.sensibleBelow.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.breakdown.product.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
        </div>
        
        <div class="result-grid">
          <div class="result-card">
            <h3>Air Change Load</h3>
            <div class="result-item">
              <span class="result-label">Air Change Load:</span>
              <span class="result-value">${results.breakdown.airChange.loadKW.toFixed(3)} kW</span>
            </div>
          </div>
          
          <div class="result-card">
            <h3>Internal Loads</h3>
            <div class="result-item">
              <span class="result-label">Occupancy:</span>
              <span class="result-value">${results.breakdown.internal.occupancy.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Lighting:</span>
              <span class="result-value">${results.breakdown.internal.lighting.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Equipment:</span>
              <span class="result-value">${results.breakdown.internal.equipment.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Heaters:</span>
              <span class="result-value">${results.breakdown.internal.totalHeaters.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.breakdown.internal.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Engineering Outputs</h2>
        <div class="result-grid">
          <div class="result-card">
            <div class="result-item">
              <span class="result-label">Load in kJ/Batch:</span>
              <span class="result-value">${results.engineeringOutputs.loadKJPerBatch.toFixed(0)} kJ</span>
            </div>
            <div class="result-item">
              <span class="result-label">Sensible Heat in kJ/24 Hr:</span>
              <span class="result-value">${results.engineeringOutputs.sensibleHeatKJ24Hr.toFixed(0)} kJ</span>
            </div>
            <div class="result-item">
              <span class="result-label">Latent Heat in kJ/24 Hr:</span>
              <span class="result-value">${results.engineeringOutputs.latentHeatKJ24Hr.toFixed(0)} kJ</span>
            </div>
          </div>
          <div class="result-card">
            <div class="result-item">
              <span class="result-label">SHR (Sensible Heat Ratio):</span>
              <span class="result-value">${results.engineeringOutputs.SHR.toFixed(3)}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Air Qty Required:</span>
              <span class="result-value">${results.engineeringOutputs.airQtyRequiredCfm.toFixed(0)} CFM</span>
            </div>
            <div class="result-item">
              <span class="result-label">Safety Factor (5%):</span>
              <span class="result-value">${results.loadSummary.safetyFactorKW.toFixed(3)} kW</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: INPUTS -->
      <div class="page-break">
        <div class="header">
          <h1>INPUT PARAMETERS</h1>
          <p>Values used for calculation</p>
        </div>

        <div class="section">
          <h2>Room Specifications</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Length</div>
              <div class="input-value">${results.dimensions.length} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Breadth</div>
              <div class="input-value">${results.dimensions.breadth} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Height</div>
              <div class="input-value">${results.dimensions.height} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Volume</div>
              <div class="input-value">${(results.dimensions.length * results.dimensions.breadth * results.dimensions.height).toFixed(2)} m³</div>
            </div>
            <div class="input-item">
              <div class="input-label">Door Width</div>
              <div class="input-value">${results.dimensions.length} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Door Height</div>
              <div class="input-value">${results.dimensions.breadth} m</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Operating Conditions</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Ambient Temperature</div>
              <div class="input-value">${results.conditions.ambientTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Room Temperature</div>
              <div class="input-value">${results.conditions.roomTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Temperature Difference</div>
              <div class="input-value">${results.temperatureDifference.toFixed(1)}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Batch Hours</div>
              <div class="input-value">${results.batchHours} hrs</div>
            </div>
            <div class="input-item">
              <div class="input-label">Operating Hours</div>
              <div class="input-value">${results.conditions.operatingHours} hrs/day</div>
            </div>
            <div class="input-item">
              <div class="input-label">Air Change Rate</div>
              <div class="input-value">${results.conditions.airChangeRate} changes/hr</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Construction Details</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Insulation Type</div>
              <div class="input-value">${results.construction.type}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Wall Thickness</div>
              <div class="input-value">${results.construction.wallThickness} mm</div>
            </div>
            <div class="input-item">
              <div class="input-label">Ceiling Thickness</div>
              <div class="input-value">${results.construction.ceilingThickness} mm</div>
            </div>
            <div class="input-item">
              <div class="input-label">Floor Thickness</div>
              <div class="input-value">${results.construction.floorThickness} mm</div>
            </div>
            <div class="input-item">
              <div class="input-label">Wall U-Factor</div>
              <div class="input-value">${results.construction.uFactors.walls.toFixed(3)} W/m²K</div>
            </div>
            <div class="input-item">
              <div class="input-label">Internal Floor Thickness</div>
              <div class="input-value">${results.construction.internalFloorThickness} mm</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Product Information</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Product Type</div>
              <div class="input-value">${results.productInfo.type}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Capacity Required</div>
              <div class="input-value">${results.productInfo.mass} kg</div>
            </div>
            <div class="input-item">
              <div class="input-label">Incoming Temperature</div>
              <div class="input-value">${results.productInfo.incomingTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Outgoing Temperature</div>
              <div class="input-value">${results.productInfo.outgoingTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Storage Density</div>
              <div class="input-value">${results.storageCapacity.density} kg/m³</div>
            </div>
            <div class="input-item">
              <div class="input-label">Storage Utilization</div>
              <div class="input-value">${results.storageCapacity.utilization.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Equipment Summary</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Fan Motor Load</div>
              <div class="input-value">${results.equipmentSummary.totalFanLoad.toFixed(2)} kW</div>
            </div>
            <div class="input-item">
              <div class="input-label">Total Heater Load</div>
              <div class="input-value">${results.equipmentSummary.totalHeaterLoad.toFixed(2)} kW</div>
            </div>
            <div class="input-item">
              <div class="input-label">Lighting Load</div>
              <div class="input-value">${results.equipmentSummary.totalLightingLoad.toFixed(2)} kW</div>
            </div>
            <div class="input-item">
              <div class="input-label">People Load</div>
              <div class="input-value">${results.equipmentSummary.totalPeopleLoad.toFixed(3)} kW</div>
            </div>
            <div class="input-item">
              <div class="input-label">Air Flow per Fan</div>
              <div class="input-value">${results.conditions.airFlowPerFan} CFM</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="powered-by">🚀 Powered by Enzo</div>
        <p>Generated by Enzo CoolCalc - Blast Freezer Cooling Load Calculator</p>
        <p>Date: ${currentDate}</p>
      </div>
    `;

    const html = generateHTMLTemplate('Blast Freezer Cooling Load Report', content);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } else {
      Alert.alert('Success', 'PDF generated successfully!');
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF. Please try again.');
  }
};

// Freezer PDF Generator
export const generateFreezerPDF = async (results: any, inputData: any) => {
  try {
    const currentDate = new Date().toLocaleDateString();
    
    const content = `
      <div class="header">
        <h1>FREEZER COOLING LOAD CALCULATION REPORT</h1>
        <p>Generated on ${currentDate} | Enzo CoolCalc</p>
      </div>

      <!-- PAGE 1: RESULTS -->
      <div class="section">
        <div class="highlight-result">
          <h3>Final Cooling Load</h3>
          <div class="highlight-value">${results.totalLoad.finalLoadKW.toFixed(2)} kW</div>
          <div style="margin-top: 10px;">
            <span style="color: #64748B;">Refrigeration Capacity: </span>
            <span style="color: #3B82F6; font-weight: 600;">${results.conversions.totalTR.toFixed(2)} TR</span>
            <span style="margin-left: 20px; color: #64748B;">BTU/hr: </span>
            <span style="color: #3B82F6; font-weight: 600;">${results.conversions.totalBTU.toFixed(0)} BTU/hr</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Load Breakdown</h2>
        <div class="result-grid">
          <div class="result-card">
            <h3>Transmission Load</h3>
            <div class="result-item">
              <span class="result-label">Walls:</span>
              <span class="result-value">${results.loadBreakdown.transmissionLoad.walls.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Ceiling:</span>
              <span class="result-value">${results.loadBreakdown.transmissionLoad.ceiling.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Floor:</span>
              <span class="result-value">${results.loadBreakdown.transmissionLoad.floor.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.loadBreakdown.transmissionLoad.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
          
          <div class="result-card">
            <h3>Product Load</h3>
            <div class="result-item">
              <span class="result-label">Sensible Load:</span>
              <span class="result-value">${results.loadBreakdown.productLoad.sensible.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Latent Load:</span>
              <span class="result-value">${results.loadBreakdown.productLoad.latent.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.loadBreakdown.productLoad.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
        </div>
        
        <div class="result-grid">
          <div class="result-card">
            <h3>Air Infiltration</h3>
            <div class="result-item">
              <span class="result-label">Air Infiltration Load:</span>
              <span class="result-value">${results.loadBreakdown.airInfiltrationLoad.toFixed(3)} kW</span>
            </div>
          </div>
          
          <div class="result-card">
            <h3>Internal Loads</h3>
            <div class="result-item">
              <span class="result-label">Occupancy:</span>
              <span class="result-value">${results.loadBreakdown.internalLoads.occupancy.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Lighting:</span>
              <span class="result-value">${results.loadBreakdown.internalLoads.lighting.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Equipment:</span>
              <span class="result-value">${results.loadBreakdown.internalLoads.equipment.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.loadBreakdown.internalLoads.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: INPUTS -->
      <div class="page-break">
        <div class="header">
          <h1>INPUT PARAMETERS</h1>
          <p>Values used for calculation</p>
        </div>

        <div class="section">
          <h2>Room Specifications</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Length</div>
              <div class="input-value">${results.room.length} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Width</div>
              <div class="input-value">${results.room.width} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Height</div>
              <div class="input-value">${results.room.height} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Volume</div>
              <div class="input-value">${results.room.volume.toFixed(2)} m³</div>
            </div>
            <div class="input-item">
              <div class="input-label">Insulation Type</div>
              <div class="input-value">${results.room.insulationType}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Insulation Thickness</div>
              <div class="input-value">${results.room.insulationThickness} mm</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Operating Conditions</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">External Temperature</div>
              <div class="input-value">${results.conditions.externalTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Internal Temperature</div>
              <div class="input-value">${results.conditions.internalTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Temperature Difference</div>
              <div class="input-value">${results.conditions.temperatureDifference.toFixed(1)}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Operating Hours</div>
              <div class="input-value">${results.conditions.operatingHours} hrs/day</div>
            </div>
            <div class="input-item">
              <div class="input-label">Pull Down Time</div>
              <div class="input-value">${results.conditions.pullDownTime} hrs</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Product Information</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Product Type</div>
              <div class="input-value">${results.product.type}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Daily Load</div>
              <div class="input-value">${results.product.dailyLoad} kg</div>
            </div>
            <div class="input-item">
              <div class="input-label">Incoming Temperature</div>
              <div class="input-value">${results.product.incomingTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Outgoing Temperature</div>
              <div class="input-value">${results.product.outgoingTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Storage Type</div>
              <div class="input-value">${results.product.storageType || 'General Storage'}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Number of People</div>
              <div class="input-value">${results.product.numberOfPeople}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="powered-by">🚀 Powered by Enzo</div>
        <p>Generated by Enzo CoolCalc - Freezer Cooling Load Calculator</p>
        <p>Date: ${currentDate}</p>
      </div>
    `;

    const html = generateHTMLTemplate('Freezer Cooling Load Report', content);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } else {
      Alert.alert('Success', 'PDF generated successfully!');
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF. Please try again.');
  }
};

// Cold Room PDF Generator
export const generateColdRoomPDF = async (results: any, inputData: any) => {
  try {
    const currentDate = new Date().toLocaleDateString();
    
    const content = `
      <div class="header">
        <h1>COLD ROOM COOLING LOAD CALCULATION REPORT</h1>
        <p>Generated on ${currentDate} | Enzo CoolCalc</p>
      </div>

      <!-- PAGE 1: RESULTS -->
      <div class="section">
        <div class="highlight-result">
          <h3>Final Cooling Load</h3>
          <div class="highlight-value">${results.totalLoad.finalLoadKW.toFixed(2)} kW</div>
          <div style="margin-top: 10px;">
            <span style="color: #64748B;">Refrigeration Capacity: </span>
            <span style="color: #3B82F6; font-weight: 600;">${results.conversions.totalTR.toFixed(2)} TR</span>
            <span style="margin-left: 20px; color: #64748B;">BTU/hr: </span>
            <span style="color: #3B82F6; font-weight: 600;">${results.conversions.totalBTU.toFixed(0)} BTU/hr</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Load Breakdown</h2>
        <div class="result-grid">
          <div class="result-card">
            <h3>Transmission Load</h3>
            <div class="result-item">
              <span class="result-label">Walls:</span>
              <span class="result-value">${results.loadBreakdown.transmissionLoad.walls.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Ceiling:</span>
              <span class="result-value">${results.loadBreakdown.transmissionLoad.ceiling.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Floor:</span>
              <span class="result-value">${results.loadBreakdown.transmissionLoad.floor.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.loadBreakdown.transmissionLoad.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
          
          <div class="result-card">
            <h3>Product Load</h3>
            <div class="result-item">
              <span class="result-label">Product Load:</span>
              <span class="result-value">${results.loadBreakdown.productLoad.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Respiration Load:</span>
              <span class="result-value">${results.loadBreakdown.respirationLoad.toFixed(3)} kW</span>
            </div>
          </div>
        </div>
        
        <div class="result-grid">
          <div class="result-card">
            <h3>Air Infiltration</h3>
            <div class="result-item">
              <span class="result-label">Air Infiltration Load:</span>
              <span class="result-value">${results.loadBreakdown.airInfiltrationLoad.toFixed(3)} kW</span>
            </div>
          </div>
          
          <div class="result-card">
            <h3>Internal Loads</h3>
            <div class="result-item">
              <span class="result-label">Occupancy:</span>
              <span class="result-value">${results.loadBreakdown.internalLoads.occupancy.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Lighting:</span>
              <span class="result-value">${results.loadBreakdown.internalLoads.lighting.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label">Equipment:</span>
              <span class="result-value">${results.loadBreakdown.internalLoads.equipment.toFixed(3)} kW</span>
            </div>
            <div class="result-item">
              <span class="result-label"><strong>Total:</strong></span>
              <span class="result-value"><strong>${results.loadBreakdown.internalLoads.total.toFixed(3)} kW</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: INPUTS -->
      <div class="page-break">
        <div class="header">
          <h1>INPUT PARAMETERS</h1>
          <p>Values used for calculation</p>
        </div>

        <div class="section">
          <h2>Room Specifications</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Length</div>
              <div class="input-value">${results.room.length} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Width</div>
              <div class="input-value">${results.room.width} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Height</div>
              <div class="input-value">${results.room.height} m</div>
            </div>
            <div class="input-item">
              <div class="input-label">Volume</div>
              <div class="input-value">${results.room.volume.toFixed(2)} m³</div>
            </div>
            <div class="input-item">
              <div class="input-label">Insulation Type</div>
              <div class="input-value">${results.room.insulationType}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Insulation Thickness</div>
              <div class="input-value">${results.room.insulationThickness} mm</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Operating Conditions</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">External Temperature</div>
              <div class="input-value">${results.conditions.externalTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Internal Temperature</div>
              <div class="input-value">${results.conditions.internalTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Temperature Difference</div>
              <div class="input-value">${results.conditions.temperatureDifference.toFixed(1)}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Operating Hours</div>
              <div class="input-value">${results.conditions.operatingHours} hrs/day</div>
            </div>
            <div class="input-item">
              <div class="input-label">Pull Down Time</div>
              <div class="input-value">${results.conditions.pullDownTime} hrs</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Product Information</h2>
          <div class="input-grid">
            <div class="input-item">
              <div class="input-label">Product Type</div>
              <div class="input-value">${results.product.type}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Daily Load</div>
              <div class="input-value">${results.product.dailyLoad} kg</div>
            </div>
            <div class="input-item">
              <div class="input-label">Incoming Temperature</div>
              <div class="input-value">${results.product.incomingTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Outgoing Temperature</div>
              <div class="input-value">${results.product.outgoingTemp}°C</div>
            </div>
            <div class="input-item">
              <div class="input-label">Storage Type</div>
              <div class="input-value">${results.product.storageType || 'General Storage'}</div>
            </div>
            <div class="input-item">
              <div class="input-label">Number of People</div>
              <div class="input-value">${results.product.numberOfPeople}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="powered-by">🚀 Powered by Enzo</div>
        <p>Generated by Enzo CoolCalc - Cold Room Cooling Load Calculator</p>
        <p>Date: ${currentDate}</p>
      </div>
    `;

    const html = generateHTMLTemplate('Cold Room Cooling Load Report', content);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } else {
      Alert.alert('Success', 'PDF generated successfully!');
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF. Please try again.');
  }
};
