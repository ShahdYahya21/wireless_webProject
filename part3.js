function calculateLinkMargin() {
  const k = 1.38e-23; // Boltzmann constant in J/K
  const c = 3e8; // Speed of light in m/s

 function isPositive(value) {
  return isValid(value) && value > 0;
}
function isNonNegative(value) {
  return isValid(value) && value >= 0;
}
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

if (
  !isPositive(noiseTemperature) ||
  !isNonNegative(noiseFigure) ||
  !isNonNegative(EbN0) ||
  !isNonNegative(feederLoss) ||
  !isNonNegative(otherLosses) ||
  !isNonNegative(fadeMargin) ||
  !isNonNegative(systemMargin) ||
  !isNonNegative(transmitGain) ||
  !isNonNegative(receiveGain) ||
  !isNonNegative(transmitAmplifierGain) ||
  !isNonNegative(receiveAmplifierGain)
) {
  alert("Please fill in all required input fields with valid numbers. Temperature must be > 0. All other values must be ≥ 0.");
  return;
}


if (!isValid(pathLoss)) {
  const frequency = parseFloat(document.getElementById('frequency').value);
  const distance = parseFloat(document.getElementById('distance').value);

  if (!isPositive(frequency) || !isPositive(distance)) {
    alert("Please provide either the path loss, or both frequency and distance (both must be > 0) to calculate it.");
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

  const p = window.lastLinkMarginCalculation.inputs;
  const r = window.lastLinkMarginCalculation.results;

  const prompt = `
You are a wireless communication engineer. Please explain clearly and thoroughly the following link margin calculation to a student:

Inputs:
- Path Loss: ${p.pathLoss} dB
- Transmit Antenna Gain: ${p.transmitGain} dB
- Receive Antenna Gain: ${p.receiveGain} dB
- Transmit Amplifier Gain: ${p.transmitAmplifierGain} dB
- Receive Amplifier Gain: ${p.receiveAmplifierGain} dB
- Feeder Loss: ${p.feederLoss} dB
- Other Losses: ${p.otherLosses} dB
- Fade Margin: ${p.fadeMargin} dB
- Noise Figure: ${p.noiseFigure} dB
- Noise Temperature: ${p.noiseTemperature} K
- Eb/N0: ${p.EbN0} dB
- System Margin: ${p.systemMargin} dB

Results:
- Received Power (Pr): ${r.Pr.toFixed(2)} dB
- Transmitted Power (Pt): ${r.Pt.toFixed(2)} dB

Please explain what these parameters mean, how the Pr and Pt were calculated, and their role in designing a wireless communication link. Keep it beginner-friendly but technically accurate.
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
