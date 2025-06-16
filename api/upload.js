import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { base64, filename } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!base64 || !filename || !apiKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const buffer = Buffer.from(base64, 'base64');

  try {
    const uploadRes = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/files?key=${apiKey}`,
      data: buffer,
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-File-Name': filename,
        'X-Goog-Upload-Protocol': 'raw'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      transformRequest: [(data) => data] // <- sehr wichtig!
    });

    return res.status(200).json({
      fileUri: uploadRes.data.name,
      fileMeta: uploadRes.data
    });

  } catch (err) {
    console.error('UPLOAD ERROR:', err.response?.data || err.message);
    return res.status(500).json({
      error: 'Upload failed',
      details: err.response?.data || err.message
    });
  }
}
