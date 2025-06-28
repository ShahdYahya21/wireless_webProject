function calculateLTE() {
    // Get inputs
    const rbBandwidth = parseFloat(document.getElementById('resourceBlockBandwidth').value);
    const rbBandwidthUnit = document.getElementById('rbBandwidthUnit').value;
    const subCarrierSpacing = parseFloat(document.getElementById('subCarrierSpacing').value);
    const subCarrierSpacingUnit = document.getElementById('subCarrierSpacingUnit').value;
    const ofdmSymbolsPerRB = parseInt(document.getElementById('ofdmSymbolsPerRB').value);
    const rbDuration = parseFloat(document.getElementById('rbDuration').value);
    const rbDurationUnit = document.getElementById('rbDurationUnit').value;
    const parallelRB = parseInt(document.getElementById('parallelRB').value);
    const qamType = parseInt(document.getElementById('qamType').value);

    if (
        isNaN(rbBandwidth) || isNaN(subCarrierSpacing) || isNaN(ofdmSymbolsPerRB) ||
        isNaN(rbDuration) || isNaN(parallelRB) || isNaN(qamType)
    ) {
        alert('Please fill all inputs with valid numbers.');
        return;
    }

    const rbBandwidthHz = convertToHz(rbBandwidth, rbBandwidthUnit);
    const subCarrierSpacingHz = convertToHz(subCarrierSpacing, subCarrierSpacingUnit);
    const rbDurationSeconds = convertToSeconds(rbDuration, rbDurationUnit);

    if (!Number.isInteger(rbBandwidthHz / subCarrierSpacingHz)) {
        alert("The ratio of Resource Block Bandwidth to Subcarrier Spacing must be an integer.");
        return;
    }

    if (!isPowerOfTwo(qamType)) {
        alert("QAM Type must be a power of 2.");
        return;
    }

    const numSubcarriersPerRB = rbBandwidthHz / subCarrierSpacingHz;
    const bitsPerRE = Math.log2(qamType);
    const bitsPerSymbol = bitsPerRE * numSubcarriersPerRB;
    const bitsPerRB = bitsPerSymbol * ofdmSymbolsPerRB;
    const maxTransmissionRate = (bitsPerRB * parallelRB) / rbDurationSeconds;

    // Calculate spectral efficiency (bps/Hz)
    // Total bandwidth per RB = Nsc * subcarrier spacing
    const bandwidthPerRB = numSubcarriersPerRB * subCarrierSpacingHz;
    const spectralEfficiency = bitsPerRB / (bandwidthPerRB * rbDurationSeconds);

    document.getElementById('resultContent').innerHTML = `
      <p>Number of Subcarriers per RB: ${numSubcarriersPerRB} subcarriers</p>
      <p>Bits per Resource Element: ${bitsPerRE.toFixed(2)} bits</p>
      <p>Bits per OFDM Symbol: ${bitsPerSymbol.toFixed(2)} bits</p>
      <p>Bits per OFDM Resource Block: ${bitsPerRB.toFixed(2)} bits</p>
      <p>Maximum Transmission Rate: ${maxTransmissionRate.toLocaleString()} bits per second (bps)</p>
      <p>Spectral Efficiency: ${spectralEfficiency.toFixed(2)}bps/Hz</p>
    `;

    lastCalculation = {
  parameters: {
    resourceBlockBandwidth: rbBandwidthHz,        // e.g., in Hz
    subCarrierSpacing: subCarrierSpacingHz,       // e.g., in Hz
    ofdmSymbolsPerRB: ofdmSymbolsPerRB,
    rbDuration: rbDurationSeconds,                 // in seconds
    parallelRB: parallelRB,
    qamType: qamType,
    bandwidthPerRB: bandwidthPerRB                 // (If you have this variable defined)
  },
  results: {
    numSubcarriersPerRB: numSubcarriersPerRB,
    bitsPerRE: bitsPerRE,
    bitsPerSymbol: bitsPerSymbol,
    bitsPerRB: bitsPerRB,
    maxTransmissionRate: maxTransmissionRate,
    spectralEfficiency: spectralEfficiency
  }
};

}

function convertToHz(value, unit) {
    switch (unit) {
        case 'kHz': return value * 1e3;
        case 'MHz': return value * 1e6;
        case 'GHz': return value * 1e9;
        default: return value;
    }
}

function convertToSeconds(value, unit) {
    switch (unit) {
        case 'ms': return value / 1000;
        case 'micros': return value / 1e6;
        default: return value;
    }
}

function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0 && value > 0;
}

async function explainLTE() {
  if (!lastCalculation) {
    alert('Please perform a calculation first!');
    return;
  }

  document.getElementById('resultContent').innerHTML += `
    <p style="color: #3498db; font-style: italic;">Generating AI explanation...</p>
  `;
const prompt = `
You are an expert in 4G LTE wireless communication systems. Please clearly and professionally explain the following parameters and calculation results for a student:

Parameters:
- Resource Block Bandwidth: ${lastCalculation.parameters.resourceBlockBandwidth} Hz
- Subcarrier Spacing: ${lastCalculation.parameters.subCarrierSpacing} Hz
- Number of OFDM Symbols per Resource Block: ${lastCalculation.parameters.ofdmSymbolsPerRB}
- Resource Block Duration: ${lastCalculation.parameters.rbDuration} seconds
- Number of Parallel Resource Blocks: ${lastCalculation.parameters.parallelRB}
- QAM Modulation Type: ${lastCalculation.parameters.qamType}

Results:
- Number of Subcarriers per Resource Block: ${lastCalculation.results.numSubcarriersPerRB}
- Bits per Resource Element (RE): ${lastCalculation.results.bitsPerRE}
- Bits per OFDM Symbol: ${lastCalculation.results.bitsPerSymbol}
- Bits per Resource Block: ${lastCalculation.results.bitsPerRB}
- Maximum Transmission Rate: ${lastCalculation.results.maxTransmissionRate.toFixed(2)} bps
- Spectral Efficiency: ${lastCalculation.results.spectralEfficiency.toFixed(4)} bits/sec/Hz

Please provide a detailed but easy-to-understand explanation of what these values mean and how they affect LTE system performance.
`;

  try {
    const response = await fetch('https://wireless-webproject.onrender.com/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }), // Send only the prompt

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

