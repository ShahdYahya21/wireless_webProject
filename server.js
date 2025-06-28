import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch'; // or skip if Node 18+ with global fetch

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/explain', async (req, res) => {
  const { parameters, results } = req.body;

  if (!parameters || !results) {
    return res.status(400).json({ error: 'Missing parameters or results in request body.' });
  }

  // Prepare prompt text for Gemini
  const promptText = `
You are an expert in communication systems. Please explain clearly and professionally the meaning of the following wireless system calculation results for a student:

Parameters:
- Bandwidth: ${parameters.bandwidth} Hz
- Quantizer Bits: ${parameters.quantizerBits}
- Source Encoder Rate: ${parameters.sourceEncoderRate}
- Channel Encoder Rate: ${parameters.channelEncoderRate}
- Interleaver Bits: ${parameters.interleaverBits}
- Payload-to-Overhead Ratio: ${parameters.payloadToOverheadRatio}

Results:
- Sampling Frequency: ${results.samplingFrequency} samples/sec
- Input Rate: ${results.inputRate} bps
- Source Encoder Output: ${results.sourceEncoderOutput} bps
- Channel Encoder Output: ${results.channelEncoderOutput} bps
- Interleaver Output: ${results?.interleaverOutput ?? 'N/A'} bps
- Burst Rate: ${results.burstRate} bps

Write a clear and detailed explanation suitable for a student learning the subject.
  `;

  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', errorText);
      return res.status(response.status).json({ error: 'Failed to generate explanation.' });
    }

    const data = await response.json();

    // The response structure contains the generated text here:
    const explanation = data.candidates?.[0]?.output || 'No explanation generated.';

    res.json({ explanation });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
