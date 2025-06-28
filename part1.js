let lastCalculation = null;

function calculate() {
  const bandwidth = parseFloat(document.getElementById('bandwidth').value);
  const quantizerBits = parseInt(document.getElementById('quantizerBits').value);
  const sourceEncoderRate = parseFloat(document.getElementById('sourceEncoderRate').value);
  const channelEncoderRate = parseFloat(document.getElementById('channelEncoderRate').value);
  const interleaverBits = parseFloat(document.getElementById('interleaverBits').value);
  const payloadToOverheadRatio = parseFloat(document.getElementById('payloadToOverheadRatio').value);

  if (
    isNaN(bandwidth) ||
    isNaN(quantizerBits) ||
    isNaN(sourceEncoderRate) ||
    isNaN(channelEncoderRate) ||
    isNaN(interleaverBits) ||
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
  const interleaverOutput = channelEncoderOutput;
  const burstRate = channelEncoderOutput * (1 + 1 / payloadToOverheadRatio);

  const resultsHTML = `
    <p class="result-item">sampling frequecy: <span class="result-value">${samplingFrequency.toLocaleString()} samples/sec</span></p>
    <p class="result-item">Bit rata after Quantizerter: <span class="result-value">${inputRate.toLocaleString()} bps</span></p>
    <p class="result-item">Bit Rate after Source Encoder: <span class="result-value">${sourceEncoderOutput.toLocaleString()} bps</span></p>
    <p class="result-item">Bit Rate after Channel Encoder: <span class="result-value">${channelEncoderOutput.toLocaleString()} bps</span></p>
    <p class="result-item">Bit Rate after Interleaver: <span class="result-value">${interleaverOutput.toLocaleString()} bps</span></p>
    <p class="result-item">Bit Rate after Burst Formatting: <span class="result-value">${burstRate.toLocaleString()} bps</span></p>
  `;

  document.getElementById('resultContent').innerHTML = resultsHTML;

  lastCalculation = {
    parameters: {
      bandwidth,
      quantizerBits,
      sourceEncoderRate,
      channelEncoderRate,
      interleaverBits,
      payloadToOverheadRatio,
    },
    results: {
      samplingFrequency,
      inputRate,
      sourceEncoderOutput,
      channelEncoderOutput,
      interleaverOutput,
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
