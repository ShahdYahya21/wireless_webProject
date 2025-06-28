import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import GoogleGenerativeAI from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/explain', async (req, res) => {
  const { parameters, results } = req.body;

  const prompt = `
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
- Interleaver Output: ${results.interleaverOutput} bps
- Burst Rate: ${results.burstRate} bps

Write a helpful and easy-to-understand explanation for a student.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const explanation = response.text();

    res.json({ explanation });
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
