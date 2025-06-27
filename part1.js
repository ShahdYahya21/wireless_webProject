let lastCalculation = null;

function calculate() {
  const bandwidth = parseFloat(document.getElementById('bandwidth').value);
  const quantizerBits = parseInt(document.getElementById('quantizerBits').value);
  const sourceEncoderRate = parseFloat(document.getElementById('sourceEncoderRate').value);
  const channelEncoderRate = parseFloat(document.getElementById('channelEncoderRate').value);
  const payloadToOverheadRatio = parseFloat(document.getElementById('payloadToOverheadRatio').value);

  if (
    isNaN(bandwidth) ||
    isNaN(quantizerBits) ||
    isNaN(sourceEncoderRate) ||
    isNaN(channelEncoderRate) ||
    isNaN(payloadToOverheadRatio) ||
    payloadToOverheadRatio <= 0
  ) {
    document.getElementById('resultContent').innerHTML =
      "<p class='result-item'><span class='result-value'>Please fill in all fields with valid positive numbers.</span></p>";
    lastCalculation = null;
    return;
  }

  const samplingFrequency = 2 * bandwidth;
  const inputRate = samplingFrequency * quantizerBits;
  const sourceEncoderOutput = inputRate * sourceEncoderRate;
  const channelEncoderOutput = sourceEncoderOutput / channelEncoderRate;

  // Burst rate calculation explained in ratio comments
  const burstRate = channelEncoderOutput * (1 + 1 / payloadToOverheadRatio);

  const resultsHTML = `
    <p class="result-item">Sampling Frequency: <span class="result-value">${samplingFrequency.toLocaleString()} Hz</span></p>
    <p class="result-item">Bit Rate after Source Encoder: <span class="result-value">${sourceEncoderOutput.toLocaleString()} bps</span></p>
    <p class="result-item">Bit Rate after Channel Encoder: <span class="result-value">${channelEncoderOutput.toLocaleString()} bps</span></p>
    <p class="result-item">Bit Rate after Burst Formatting: <span class="result-value">${burstRate.toLocaleString()} bps</span></p>
  `;

  document.getElementById('resultContent').innerHTML = resultsHTML;

  lastCalculation = {
    parameters: {
      bandwidth,
      quantizerBits,
      sourceEncoderRate,
      channelEncoderRate,
      payloadToOverheadRatio,
    },
    results: {
      samplingFrequency,
      sourceEncoderOutput,
      channelEncoderOutput,
      burstRate,
    }
  };
}

async function explainResults() {
  if (!lastCalculation) {
    alert('Please perform a calculation first!');
    return;
  }

  document.getElementById('resultContent').innerHTML += `
    <p style="color: #3498db; font-style: italic;">Generating AI explanation...</p>
  `;

  try {
    const response = await fetch('http://localhost:3000/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lastCalculation),
    });

    const data = await response.json();

    // Remove loading text
    const contentDiv = document.getElementById('resultContent');
    contentDiv.innerHTML = contentDiv.innerHTML.replace(/<p style="color: #3498db; font-style: italic;">.*?<\/p>/, '');

    // Append explanation
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
