import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { OpenAI } from 'openai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- Interleaver Output: ${results.interleaverOutput || 'N/A'} bps
- Burst Rate: ${results.burstRate} bps

Write a clear explanation.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', 
      messages: [{ role: 'user', content: prompt }],
    });

    const explanation = completion.choices[0].message.content;

    res.json({ explanation });
  } catch (err) {
    console.error('OpenAI API error:', err.message);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
