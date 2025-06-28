function calculateLinkMargin() {
    const c = 3 * 10**8; // Speed of light

    // Get input values
    let pathLoss = parseFloat(document.getElementById('pathLoss').value) || 0;
    const pathLossUnit = document.getElementById('pathLossUnit').value;

    let frequency = parseFloat(document.getElementById('frequency').value);
    const frequencyUnit = document.getElementById('frequencyUnit').value;

    const distance = parseFloat(document.getElementById('distance').value) || 0;

    let dataRate = parseFloat(document.getElementById('dataRate').value) || 1 ;
    const dataRateUnit = document.getElementById('dataRateUnit').value;

    let transmitGain = parseFloat(document.getElementById('transmitGain').value) || 0;
    const transmitGainUnit = document.getElementById('transmitGainUnit').value;

    let receiveGain = parseFloat(document.getElementById('receiveGain').value) || 0;
    const receiveGainUnit = document.getElementById('receiveGainUnit').value;

    let transmitAmplifierGain = parseFloat(document.getElementById('transmitAmplifierGain').value) || 0;
    const transmitAmplifierGainUnit = document.getElementById('transmitAmplifierGainUnit').value;

    let receiveAmplifierGain = parseFloat(document.getElementById('receiveAmplifierGain').value) || 0;
    const receiveAmplifierGainUnit = document.getElementById('receiveAmplifierGainUnit').value;

    let feederLoss = parseFloat(document.getElementById('feederLoss').value) || 0;
    const feederLossUnit = document.getElementById('feederLossUnit').value;

    let otherLosses = parseFloat(document.getElementById('otherLosses').value) || 0;
    const otherLossesUnit = document.getElementById('otherLossesUnit').value;

    let fadeMargin = parseFloat(document.getElementById('fadeMargin').value) || 0;
    const fadeMarginUnit = document.getElementById('fadeMarginUnit').value;

    let noiseFigure = parseFloat(document.getElementById('noiseFigure').value) || 0;
    const noiseFigureUnit = document.getElementById('noiseFigureUnit').value;

    const noiseTemperature = parseFloat(document.getElementById('noiseTemperature').value) || 1;

    let linkMargin = parseFloat(document.getElementById('linkMargin').value) || 0;
    const linkMarginUnit = document.getElementById('linkMarginUnit').value;

    const EbN0 = parseFloat(document.getElementById('EbN0').value); // Eb/N0 in dB

    // Function to convert to dB
    function toDb(value, unit) {
        if (unit === 'Unitless') {
            return 10 * Math.log10(value);
        } else if (unit === 'dBm') {
            return value - 30;
        } else {
            return value; // Already in dB
        }
    }

    // Convert all inputs to dB
    pathLoss = toDb(pathLoss, pathLossUnit);
    transmitGain = toDb(transmitGain, transmitGainUnit);
    receiveGain = toDb(receiveGain, receiveGainUnit);
    transmitAmplifierGain = toDb(transmitAmplifierGain, transmitAmplifierGainUnit);
    receiveAmplifierGain = toDb(receiveAmplifierGain, receiveAmplifierGainUnit);
    feederLoss = toDb(feederLoss, feederLossUnit);
    otherLosses = toDb(otherLosses, otherLossesUnit);
    fadeMargin = toDb(fadeMargin, fadeMarginUnit);
    noiseFigure = toDb(noiseFigure, noiseFigureUnit);
    linkMargin = toDb(linkMargin, linkMarginUnit);

    // Calculate path loss if not given
    if (!pathLoss && frequency && distance) {
        pathLoss = 10 * Math.log10((4 * Math.PI * frequency * distance)**2 / (c**2));
    }

    // Constants for the calculations
    const k = 1.38 * 10**-23; // Boltzmann constant in J/K
    const totalNoise = noiseTemperature * k; // Total noise value

    // Calculate Pr using the provided formula
    const pr = (transmitGain * receiveGain * transmitAmplifierGain * receiveAmplifierGain * pathLoss) /
        (feederLoss * otherLosses * fadeMargin * EbN0);

    // Calculate Pt using the provided formula
    const pt = pr * (k * totalNoise * EbN0); // Eq. for Pt using Eb/N0 and Pr

    // Display results
    document.getElementById('resultContent').innerHTML = `
        <p><strong>Power Transmitted (Pt):</strong> <span class="result-value">${pt.toFixed(2)} dB</span></p>
        <p><strong>Power Received (Pr):</strong> <span class="result-value">${pr.toFixed(2)} dB</span></p>
      
    `;
    window.lastLinkMarginCalculation = {
  parameters: {
    frequency, frequencyUnit,
    distance,
    dataRate, dataRateUnit,
    pathLoss, pathLossUnit,
    transmitGain, transmitGainUnit,
    receiveGain, receiveGainUnit,
    transmitAmplifierGain, transmitAmplifierGainUnit,
    receiveAmplifierGain, receiveAmplifierGainUnit,
    feederLoss, feederLossUnit,
    otherLosses, otherLossesUnit,
    fadeMargin, fadeMarginUnit,
    noiseFigure, noiseFigureUnit,
    noiseTemperature,
    EbN0
  },
  results: {
    Pt: pt,
    Pr: pr
  }
};

}

async function explainLinkMarginResults() {
  if (!window.lastLinkMarginCalculation) {
    alert('Please perform a calculation first!');
    return;
  }

  document.getElementById('resultContent').innerHTML += `
    <p style="color: #3498db; font-style: italic;">Generating AI explanation...</p>
  `;

  const p = lastLinkMarginCalculation.parameters;
  const r = lastLinkMarginCalculation.results;

  const prompt = `
You are a wireless communication engineer. Please provide a detailed, clear explanation for a student about the link margin and power calculation results below.

Parameters:
- Frequency: ${p.frequency} ${p.frequencyUnit}
- Distance: ${p.distance} meters
- Data Rate: ${p.dataRate} ${p.dataRateUnit}
- Path Loss: ${p.pathLoss} ${p.pathLossUnit}
- Transmit Antenna Gain: ${p.transmitGain} ${p.transmitGainUnit}
- Receive Antenna Gain: ${p.receiveGain} ${p.receiveGainUnit}
- Transmit Amplifier Gain: ${p.transmitAmplifierGain} ${p.transmitAmplifierGainUnit}
- Receive Amplifier Gain: ${p.receiveAmplifierGain} ${p.receiveAmplifierGainUnit}
- Feeder Loss: ${p.feederLoss} ${p.feederLossUnit}
- Other Losses: ${p.otherLosses} ${p.otherLossesUnit}
- Fade Margin: ${p.fadeMargin} ${p.fadeMarginUnit}
- Noise Figure: ${p.noiseFigure} ${p.noiseFigureUnit}
- Noise Temperature: ${p.noiseTemperature} K
- Eb/N0: ${p.EbN0} dB

Results:
- Received Power (Pr): ${r.Pr.toFixed(2)} dB
- Transmitted Power (Pt): ${r.Pt.toFixed(2)} dB

Please explain what these values represent, how they are derived, and how they affect wireless system design. Keep it accessible for engineering students.
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
