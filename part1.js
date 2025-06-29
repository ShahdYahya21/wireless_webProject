let lastCalculation = null;

function calculate() {
  const bandwidth = parseFloat(document.getElementById('bandwidth').value);
  const quantizerBits = parseInt(document.getElementById('quantizerBits').value);
  const sourceEncoderRate = parseFloat(document.getElementById('sourceEncoderRate').value);
  const channelEncoderRate = parseFloat(document.getElementById('channelEncoderRate').value);
  const interleaverBits = parseFloat(document.getElementById('interleaverBits').value);
  const payloadToOverheadRatio = parseFloat(document.getElementById('payloadToOverheadRatio').value);

 if (
  isNaN(bandwidth) || bandwidth <= 0 ||
  isNaN(quantizerBits) || quantizerBits <= 0 ||
  isNaN(sourceEncoderRate) || sourceEncoderRate <= 0 || sourceEncoderRate > 1 ||
  isNaN(channelEncoderRate) || channelEncoderRate <= 0 || channelEncoderRate > 1 ||
  isNaN(interleaverBits) || interleaverBits < 0 ||
  isNaN(payloadToOverheadRatio) || payloadToOverheadRatio <= 0
)
 {
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

  // Build prompt dynamically (you can customize this)
  const prompt = `
You are an expert in communication systems. Please explain clearly and professionally the meaning of the following wireless system calculation results for a student:

Parameters:
- Bandwidth: ${lastCalculation.parameters.bandwidth} Hz
- Quantizer Bits: ${lastCalculation.parameters.quantizerBits}
- Source Encoder Rate: ${lastCalculation.parameters.sourceEncoderRate}
- Channel Encoder Rate: ${lastCalculation.parameters.channelEncoderRate}
- Interleaver Bits: ${lastCalculation.parameters.interleaverBits}
- Payload-to-Overhead Ratio: ${lastCalculation.parameters.payloadToOverheadRatio}

Results:
- Sampling Frequency: ${lastCalculation.results.samplingFrequency} samples/sec
- Input Rate: ${lastCalculation.results.inputRate} bps
- Source Encoder Output: ${lastCalculation.results.sourceEncoderOutput} bps
- Channel Encoder Output: ${lastCalculation.results.channelEncoderOutput} bps
- Interleaver Output: ${lastCalculation.results.interleaverOutput} bps
- Burst Rate: ${lastCalculation.results.burstRate} bps

Write a helpful and easy-to-understand explanation for a student.
  `;

  try {
    const response = await fetch('https://wireless-webproject.onrender.com/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }), // Send only the prompt
    });

    const data = await response.json();

    // Remove loading message
    const contentDiv = document.getElementById('resultContent');
    contentDiv.innerHTML = contentDiv.innerHTML.replace(/<p style="color: #3498db; font-style: italic;">.*?<\/p>/, '');

    // Show explanation
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
