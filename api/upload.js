import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { base64, filename, type } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!base64 || !filename || !apiKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const buffer = Buffer.from(base64, 'base64');

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/files?key=${apiKey}`,
      buffer,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Goog-Upload-File-Name': filename,
          'X-Goog-Upload-Protocol': 'raw'
        }
      }
    );

    res.status(200).json({
      fileUri: response.data.name,
      fileMeta: response.data
    });
  } catch (err) {
    res.status(500).json({
      error: 'Upload failed',
      details: err.response?.data || err.message
    });
  }
}
