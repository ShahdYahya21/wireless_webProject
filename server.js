import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/explain', (req, res) => {
  const { parameters, results } = req.body;

  const explanation = `
    The system uses a bandwidth of ${parameters.bandwidth} Hz, leading to a sampling frequency of ${results.samplingFrequency} samples/sec.
    The quantizer creates an input bit rate of ${results.inputRate} bps.
    After source and channel encoding, the rates change to ${results.sourceEncoderOutput} bps and ${results.channelEncoderOutput} bps.
    With ${parameters.interleaverBits} interleaver bits, the interleaved output is ${results.interleaverOutput} bps.
    Finally, burst formatting gives a transmission rate of ${results.burstRate} bps.
  `;

  res.json({ explanation });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
