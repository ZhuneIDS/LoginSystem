const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/fetch-eve-assets', async (req, res) => {
  const { characterId, accessToken } = req.query;
  if (!characterId || !accessToken) {
    return res.status(400).json({ error: 'Missing characterId or accessToken' });
  }
  const url = `https://esi.evetech.net/latest/characters/${characterId}/assets/?datasource=tranquility`;
  try {
    const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Error fetching EVE assets' });
  }
});

// Add other API routes here

module.exports = router;