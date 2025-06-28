function calculateCellularSystemDesign() {
    // Read inputs from the form
    const slotsPerCarrier = parseFloat(document.getElementById('slotsPerCarrier').value);
    const cityArea = parseFloat(document.getElementById('cityArea').value);
    const numUsers = parseFloat(document.getElementById('numUsers').value);
    const avgCallsPerDay = parseFloat(document.getElementById('avgCallPerDay').value);
    const avgCallDuration = parseFloat(document.getElementById('avgCallDuration').value);
    const avgCallDurationUnit = document.getElementById('avgCallDurationUnit').value;
    const probCallDropped = parseFloat(document.getElementById('probCallDropped').value);
    const minSIR = parseFloat(document.getElementById('minSIR').value);
    const minSIRUnit = document.getElementById('minSIRUnit').value;
    const powerAtRefDist = parseFloat(document.getElementById('powerAtRefDistance').value);
    const powerAtRefDistUnit = document.getElementById('powerAtRefDistanceUnit').value;
    const refDistance = parseFloat(document.getElementById('refDistance').value);
    const refDistanceUnit = document.getElementById('refDistanceUnit').value;
    const pathLossComponent = parseFloat(document.getElementById('pathLossComponent').value);
    const receiverSensitivity = parseFloat(document.getElementById('receiverSensitivity').value);
    const receiverSensitivityUnit = document.getElementById('receiverSensitivityUnit').value;

    // Conversion functions
    function convertToWatts(value, unit) {
        if (unit === 'dB' ) {
            return 10 ** (value / 10);
        } else if (unit === 'dBm') {
            return 10 ** (value - 30) / 10;
        } else if (unit === 'uW') {
            return value / 1e6;
        } else if (unit === 'mW') {
            return value / 1e3;
        } else {
            return value;
        }
    }

    function convertToLinear(value, unit) {
        if (unit === 'dB' || unit === 'dBm') {
            return 10 ** (value / 10);
        } else {
            return value;
        }
    }

    function convertDurationToMinutes(duration, unit) {
        if (unit === 'hours') {
            return duration * 60;
        } else if (unit === 'seconds') {
            return duration / 60;
        } else {
            return duration;
        }
    }

    function convertTomsquare(area) {
        return area * Math.pow(10, 6);
    }

    function convertDistanceToMeters(distance, unit) {
        switch (unit) {
            case 'km':
                return distance * 1000; // Convert kilometers to meters
            case 'cm':
                return distance / 100; // Convert centimeters to meters
            default:
                return distance; // Assume meters if no conversion needed
        }
    }

    // Calculate values
    const powerAtRefDistWatts = convertToWatts(powerAtRefDist, powerAtRefDistUnit);
    const receiverSensitivityWatts = convertToWatts(receiverSensitivity, receiverSensitivityUnit);
    const cityAreainmsquare = convertTomsquare(cityArea);

    // Calculate maximum distance
    const maxDistance = convertDistanceToMeters(refDistance, refDistanceUnit) / ( (receiverSensitivityWatts / powerAtRefDistWatts) ** (1 / pathLossComponent));

    // Calculate maximum cell size assuming hexagonal cells
    const maxCellSize = (3 * Math.sqrt(3) / 2) * (maxDistance ** 2);

    // Calculate the number of cells in the service area
    const numCells = Math.ceil(cityAreainmsquare / maxCellSize);

    // Calculate traffic load in the whole cellular system in Erlangs
    const avgCallDurationMinutes = convertDurationToMinutes(avgCallDuration, avgCallDurationUnit);
    const trafficLoadPerUser = (avgCallsPerDay * avgCallDurationMinutes) / (24 * 60); // in Erlangs
    const totalTrafficLoad = trafficLoadPerUser * numUsers; // in Erlangs

    // Calculate traffic load in each cell in Erlangs
    const cellTrafficLoad = totalTrafficLoad / numCells;

    // Calculate number of cells in each cluster 👎
    const minSIRLinear = convertToLinear(minSIR, minSIRUnit);
    const possibleNValues = [1, 3, 4, 7, 9, 12, 13, 16, 19, 21, 28];

    function calculateN(minSIRLinear, pathLossComponent) {
        for (const N of possibleNValues) {
            const calculatedSIR = ((Math.sqrt(3 * N)) ** pathLossComponent) / 6;
            if (calculatedSIR >= minSIRLinear) {
                return N;
            }
        }
        return -1; // If no suitable N value is found
    }

    const N = calculateN(minSIRLinear, pathLossComponent);
    if (N === -1) {
        alert("No suitable N value found for the given SIR and path loss component.");
        return;
    }

    // Function to get Erlang B based on probability of call dropped and traffic load
    function getErlangB(probCallDropped, trafficLoad) {
        // Example Erlang B table (replace with actual data)
        const erlangBTable = [
            [14, 0.02, 8],
            [13, 0.05, 8],
            [14, 0.05, 9],
            [16, 0.02, 9]
        ];

        // Round down trafficLoad to the nearest integer
        trafficLoad = Math.floor(trafficLoad);

        // Loop through the table to find a matching entry
        for (let i = 0; i < erlangBTable.length; i++) {
            const [channels, GOS, loadd] = erlangBTable[i];
            if (GOS === probCallDropped && loadd === trafficLoad) {
                return channels;
            }
        }

        return -1;
    }

    const numChannels = getErlangB(probCallDropped, cellTrafficLoad);
    if (numChannels === -1) {
        alert("No suitable number of channels found for the given GOS and traffic load.");
        return;
    }

    // Calculate minimum number of carriers needed
    const numCarriersNeeded = Math.ceil(numChannels / slotsPerCarrier);
    const totalNumCarriers = numCarriersNeeded * N;


    numChannelsaf = getErlangB(0.05, cellTrafficLoad);
    // Calculate minimum number of carriers needed
    const numCarriersNeededafterGos = Math.ceil(numChannelsaf / slotsPerCarrier);
    const totalNumCarriersafterGos = numCarriersNeededafterGos * N;

    // Display results
    const resultElement = document.getElementById('resultContent');
    resultElement.innerHTML = `
        <p>Maximum Distance between Transmitter and Receiver for Reliable Communication: <span class="result-value">${maxDistance.toFixed(2)} meters</span></p>
        <p>Maximum Cell Size: <span class="result-value">${maxCellSize.toFixed(2)} m²</span></p>
        <p>Number of Cells in the Service Area: <span class="result-value">${numCells} cells</span></p>
        <p>Traffic Load in the Whole Cellular System: <span class="result-value">${totalTrafficLoad.toFixed(2)} Erlangs</span></p>
        <p>Traffic Load in Each Cell: <span class="result-value">${cellTrafficLoad.toFixed(2)} Erlangs/cell</span></p>
        <p>Number of Cells in Each Cluster: <span class="result-value">${N}</span></p>
        <p>Minimum Number of Carriers Needed (in the whole system ): <span class="result-value">${totalNumCarriers} carriers</span></p>
        <p>Minimum Number of Carriers Needed if the GOS is changed to 5%: <span class="result-value">${totalNumCarriersafterGos} carriers</span></p>
    `;

    window.lastCellularCalculation = {
  parameters: {
    slotsPerCarrier,
    cityArea,
    numUsers,
    avgCallsPerDay,
    avgCallDuration,
    avgCallDurationUnit,
    probCallDropped,
    minSIR,
    minSIRUnit,
    powerAtRefDistance,
    powerAtRefDistanceUnit,
    refDistance,
    refDistanceUnit,
    pathLossComponent,
    receiverSensitivity,
    receiverSensitivityUnit
  },
  results: {
    maxDistance,
    maxCellSize,
    numCells,
    totalTrafficLoad,
    cellTrafficLoad,
    N,
    totalNumCarriers,
    totalNumCarriersafterGos
  }
};

}


async function explainCellularResults() {
  if (!window.lastCellularCalculation) {
    alert('Please perform a calculation first!');
    return;
  }

  document.getElementById('resultContent').innerHTML += `
    <p style="color: #3498db; font-style: italic;">Generating AI explanation...</p>
  `;

  const params = lastCellularCalculation.parameters;
  const results = lastCellularCalculation.results;

  const prompt = `
You are an expert in wireless cellular communication systems. Please clearly and professionally explain the following parameters and calculation results for a student:

Parameters:
- Slots per Carrier: ${params.slotsPerCarrier}
- Area of the City: ${params.cityArea} km²
- Number of Users: ${params.numUsers}
- Average Calls per Day: ${params.avgCallsPerDay} calls/day
- Average Call Duration: ${params.avgCallDuration} ${params.avgCallDurationUnit}
- Probability of Call Dropped (Grade of Service): ${params.probCallDropped}
- Minimum Required SIR: ${params.minSIR} ${params.minSIRUnit}
- Power at Reference Distance: ${params.powerAtRefDistance} ${params.powerAtRefDistanceUnit}
- Reference Distance: ${params.refDistance} ${params.refDistanceUnit}
- Path Loss Component: ${params.pathLossComponent}
- Receiver Sensitivity: ${params.receiverSensitivity} ${params.receiverSensitivityUnit}

Results:
- Maximum Transmit-Receive Distance: ${results.maxDistance.toFixed(2)} meters
- Maximum Cell Size: ${results.maxCellSize.toFixed(2)} m²
- Number of Cells in the City: ${results.numCells}
- Total Traffic Load: ${results.totalTrafficLoad.toFixed(2)} Erlangs
- Traffic Load per Cell: ${results.cellTrafficLoad.toFixed(2)} Erlangs
- Cluster Size (N): ${results.N}
- Minimum Carriers Required: ${results.totalNumCarriers}
- Minimum Carriers Required (if GOS changed to 5%): ${results.totalNumCarriersafterGos}

Please explain what these values mean, how they affect the design of the system, and how they interact with one another in real-world deployment.
`;

  try {
    const response = await fetch('https://wireless-webproject.onrender.com/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    const contentDiv = document.getElementById('resultContent');
    contentDiv.innerHTML = contentDiv.innerHTML.replace(/<p style="color: #3498db; font-style: italic;">.*?<\/p>/, '');

    contentDiv.innerHTML += `
      <div style="margin-top:20px; padding: 15px; background: #eaf4fb; border-radius: 8px;">
        <h3>AI Explanation:</h3>
        <p>${data.explanation.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  } catch (error) {
    alert('Failed to get AI explanation. See console for details.');
    console.error(error);
  }
}
