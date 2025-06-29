function calculateLinkMargin() {
  const k = 1.38e-23; // Boltzmann constant in J/K
  const c = 3e8; // Speed of light in m/s

  // Helper to check if a value is a valid number
  function isValid(value) {
    return value !== null && !isNaN(value);
  }

  // Get input values
  const noiseTemperature = parseFloat(document.getElementById('noiseTemperature').value);
  const noiseFigure = parseFloat(document.getElementById('noiseFigure').value);
  const EbN0 = parseFloat(document.getElementById('EbN0').value);
  const feederLoss = parseFloat(document.getElementById('feederLoss').value);
  const otherLosses = parseFloat(document.getElementById('otherLosses').value);
  const fadeMargin = parseFloat(document.getElementById('fadeMargin').value);
  const systemMargin = parseFloat(document.getElementById('linkMargin').value);
  const transmitGain = parseFloat(document.getElementById('transmitGain').value);
  const receiveGain = parseFloat(document.getElementById('receiveGain').value);
  const transmitAmplifierGain = parseFloat(document.getElementById('transmitAmplifierGain').value);
  const receiveAmplifierGain = parseFloat(document.getElementById('receiveAmplifierGain').value);
  let pathLoss = parseFloat(document.getElementById('pathLoss').value);

  // Prompt if required fields are missing
  if (!isValid(noiseTemperature) || !isValid(noiseFigure) || !isValid(EbN0) ||
      !isValid(feederLoss) || !isValid(otherLosses) || !isValid(fadeMargin) ||
      !isValid(systemMargin) || !isValid(transmitGain) || !isValid(receiveGain) ||
      !isValid(transmitAmplifierGain) || !isValid(receiveAmplifierGain)) {
    alert("Please fill in all required input fields.");
    return;
  }

  // If pathLoss is not provided, calculate using frequency and distance
  if (!isValid(pathLoss)) {
    const frequency = parseFloat(document.getElementById('frequency').value);
    const distance = parseFloat(document.getElementById('distance').value);

    if (!isValid(frequency) || !isValid(distance)) {
      alert("Please provide either the path loss or both frequency and distance to calculate it.");
      return;
    }
    pathLoss = 20 * Math.log10((4 * Math.PI * frequency * distance) / c); // Free space path loss
  }

  // Step 1: Convert T and k to dB
  const k_dB = 10 * Math.log10(k); // Boltzmann constant in dB
  const T_dB = 10 * Math.log10(noiseTemperature); // Noise temperature in dB

  // Step 2: Calculate Pr
  const Pr = systemMargin + k_dB + T_dB + noiseFigure + EbN0;

  // Step 3: Calculate Pt
  const Pt = Pr + pathLoss + feederLoss + otherLosses + fadeMargin
                  - transmitGain - receiveGain - transmitAmplifierGain - receiveAmplifierGain;

  // Display results
  document.getElementById('resultContent').innerHTML = `
      <p><strong>Power Transmitted (Pt):</strong> <span class="result-value">${Pt.toFixed(2)} dB</span></p>
      <p><strong>Power Received (Pr):</strong> <span class="result-value">${Pr.toFixed(2)} dB</span></p>
  `;

  // Save for explanation feature
  window.lastLinkMarginCalculation = {
    inputs: {
      pathLoss,
      transmitGain,
      receiveGain,
      transmitAmplifierGain,
      receiveAmplifierGain,
      feederLoss,
      otherLosses,
      fadeMargin,
      noiseFigure,
      noiseTemperature,
      EbN0,
      systemMargin,
    },
    results: {
      Pr,
      Pt,
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
