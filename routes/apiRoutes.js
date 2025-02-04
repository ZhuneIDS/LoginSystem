//path: routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { killmails } = require('../utils/webhooks'); // Import killmails list


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
// Route to fetch EVE industry jobs
router.get('/fetch-eve-industry-jobs', async (req, res) => {
    const { characterId, accessToken } = req.query;
    console.log(`Received request for /fetch-eve-industry-jobs?characterId=${characterId}&accessToken=${accessToken}`);

    if (!characterId || !accessToken) {
        console.error("Missing character ID or access token.");
        return res.status(400).json({ error: 'Missing character ID or access token.' });
    }

    const url = `https://esi.evetech.net/latest/characters/${characterId}/industry/jobs/?datasource=tranquility`;
    try {
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching EVE industry jobs:", error);
        res.status(error.response?.status || 500).json({ error: 'Error fetching EVE industry jobs' });
    }
});

// Route to fetch character information
router.get('/fetch-my-character-info', async (req, res) => {
    const { characterId, accessToken } = req.query;
  
    if (!characterId || !accessToken) {
      return res.status(400).json({ error: 'Missing character ID or access token.' });
    }
  
    try {
      // Fetch character details
      const characterResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/?datasource=tranquility`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
  
      // Fetch wallet balance
      const walletResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/wallet/?datasource=tranquility`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
  
      // Fetch location
      const locationResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/location/?datasource=tranquility`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
  
      // Fetch ship type
      const shipResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/ship/?datasource=tranquility`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
  
      // Fetch skill queue
      const skillQueueResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/skillqueue/?datasource=tranquility`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
  
      // Fetch ship name using the ship type ID
      const shipNameResponse = await axios.get(`https://esi.evetech.net/latest/universe/types/${shipResponse.data.ship_type_id}/?datasource=tranquility`);
  
      // Fetch implants
      const implantsResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/implants/?datasource=tranquility`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
  
      // Fetch implant names using the implant IDs
      const implantNames = await Promise.all(
        implantsResponse.data.map(async (implantId) => {
          const implantResponse = await axios.get(`https://esi.evetech.net/latest/universe/types/${implantId}/?datasource=tranquility`);
          return implantResponse.data.name;
        })
      );
  
      // Combine all data
      const characterInfo = {
        name: characterResponse.data.name,
        corporation: characterResponse.data.corporation_id, // You can fetch corporation name separately if needed
        walletBalance: walletResponse.data,
        location: locationResponse.data.solar_system_id, // You can fetch system name separately if needed
        ship: shipNameResponse.data.name,
        skillQueue: skillQueueResponse.data,
        implants: implantNames // Array of implant names
      };
  
      res.json(characterInfo);
    } catch (error) {
      console.error("Error fetching character info:", error);
      res.status(error.response?.status || 500).json({ error: 'Error fetching character info' });
    }
  });

router.get('/fetch-system-name', async (req, res) => {
    const { systemId } = req.query;

    if (!systemId) {
        return res.status(400).json({ error: 'Missing system ID.' });
    }

    try {
        const response = await axios.get(`https://esi.evetech.net/latest/universe/systems/${systemId}/?datasource=tranquility`);
        res.json({ systemName: response.data.name });
    } catch (error) {
        console.error("Error fetching system name:", error);
        res.status(error.response?.status || 500).json({ error: 'Error fetching system name' });
    }
});

router.get('/fetch-ship-name', async (req, res) => {
    const { shipTypeId } = req.query;

    if (!shipTypeId) {
        return res.status(400).json({ error: 'Missing ship type ID.' });
    }

    try {
        const response = await axios.get(`https://esi.evetech.net/latest/universe/types/${shipTypeId}/?datasource=tranquility`);
        res.json({ shipName: response.data.name });
    } catch (error) {
        console.error("Error fetching ship name:", error);
        res.status(error.response?.status || 500).json({ error: 'Error fetching ship name' });
    }
});

router.get('/fetch-system-kills', async (req, res) => {
    const { systemId } = req.query;

    if (!systemId) {
      return res.status(400).json({ error: 'Missing system ID.' });
    }

    try {
      // Fetch kills from zkillboard for the given system ID
      const response = await axios.get(`https://zkillboard.com/api/kills/systemID/${systemId}/`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching system kills:", error);
      res.status(error.response?.status || 500).json({ error: 'Error fetching system kills' });
    }
  });

  router.get('/fetch-character-info', async (req, res) => {
    const { characterId, fields } = req.query;
  
    if (!characterId) {
      return res.status(400).json({ error: 'Missing character ID.' });
    }
  
    try {
      const requestedFields = fields ? fields.split(',') : [];
      const characterInfo = {};
  
      // Fetch character details if 'name' or 'corp' is requested
      if (requestedFields.includes('name') || requestedFields.includes('corp')) {
        const characterResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/?datasource=tranquility`);
        
        if (requestedFields.includes('name')) {
          characterInfo.name = characterResponse.data.name;
        }
  
        if (requestedFields.includes('corp')) {
          characterInfo.corporation = characterResponse.data.corporation_id;
        }
      }
  
      // Fetch ship type if 'ship' is requested
      if (requestedFields.includes('ship')) {
        const shipResponse = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/ship/?datasource=tranquility`);
        
        // Fetch ship name using the ship type ID
        const shipNameResponse = await axios.get(`https://esi.evetech.net/latest/universe/types/${shipResponse.data.ship_type_id}/?datasource=tranquility`);
        characterInfo.ship = shipNameResponse.data.name;
      }
  
      res.json(characterInfo);
    } catch (error) {
      console.error("Error fetching character info:", error);
      res.status(error.response?.status || 500).json({ error: 'Error fetching character info' });
    }
  });

  router.get('/fetch-killmail-details', async (req, res) => {
    const { killmailId, killmailHash } = req.query;
  
    if (!killmailId || !killmailHash) {
      return res.status(400).json({ error: 'Missing killmail ID or hash.' });
    }
  
    try {
      const response = await axios.get(`https://esi.evetech.net/latest/killmails/${killmailId}/${killmailHash}/?datasource=tranquility`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching killmail details:", error);
      res.status(error.response?.status || 500).json({ error: 'Error fetching killmail details' });
    }
  });

  router.get('/fetch-corporation-name', async (req, res) => {
    const { corporationId } = req.query;
  
    if (!corporationId) {
      return res.status(400).json({ error: 'Missing corporation ID.' });
    }
  
    try {
      const response = await axios.get(`https://esi.evetech.net/latest/corporations/${corporationId}/?datasource=tranquility`);
      res.json({ corporationName: response.data.name });
    } catch (error) {
      console.error("Error fetching corporation name:", error);
      res.status(error.response?.status || 500).json({ error: 'Error fetching corporation name' });
    }
  });

  // Webhook endpoint for zKillboard
router.post('/zkillboard-webhook', (req, res) => {
  const killmail = req.body;

  // Process the killmail data
  console.log('Received killmail in webhook:', killmail);

      // Broadcast the killmail to all connected clients
      if (app.locals.killmailClients) {
        app.locals.killmailClients.forEach(client => client(killmail));
    }

  // Respond to zKillboard to acknowledge receipt
  res.status(200).send('OK');
});

// API to get latest killmails
router.get('/api/killmails', (req, res) => {
  res.json(killmails);
});
  
module.exports = router;