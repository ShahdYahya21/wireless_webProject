import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/explain', async (req, res) => {
  const { parameters, results } = req.body;

  const prompt = `
You are an expert in wireless communication systems. Explain these results clearly for a student:

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
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ explanation: text });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
