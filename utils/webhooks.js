//path: utils/webhooks.js
const WebSocket = require('ws');

// Mapping of Solar System IDs to System Names
const SYSTEMS_MAP = {
    30003607: 'Y-MPWL',
    30002510: 'Mista',
    30001393: 'D61A-G',
    30005305: 'Shintaht',
    30000142: 'D-6WS1',
    30002187: 'Amarr'
};

// Extract valid system IDs into a Set for fast lookup
const TARGET_SYSTEMS = new Set(Object.keys(SYSTEMS_MAP).map(Number));
// Store the latest 20 killmails
let killmails = [];
const connectToZkillboard = () => {
    console.log('Connecting to zKillboard WebSocket...');

    const ws = new WebSocket('wss://zkillboard.com/websocket/');

    ws.on('open', () => {
        console.log('✅ Connected to zKillboard WebSocket');
        
        // Subscribe to killmail stream
        const subscriptionMessage = JSON.stringify({
            action: 'sub',
            channel: 'killstream' // Can be changed to "public" or a specific entity like "alliance:99006756"
        });

        ws.send(subscriptionMessage);
        console.log('📡 Subscribed to killstream');
    });

    ws.on('message', (data) => {
        try {
            const killmail = JSON.parse(data);
            const systemId = killmail.solar_system_id;

            // Check if the kill happened in one of the target systems
            if (TARGET_SYSTEMS.has(systemId)) {
                const systemName = SYSTEMS_MAP[systemId] || 'Unknown System';

                const formattedKill = {
                    id: killmail.killmail_id,
                    time: killmail.killmail_time,
                    system: systemName,
                    systemId: systemId,
                    victim: killmail.victim.character_id || 'Unknown',
                    shipType: killmail.victim.ship_type_id || 'Unknown',
                    url: killmail.zkb.url
                };

                // Store the latest 20 killmails (remove the oldest)
                killmails.unshift(formattedKill);
                if (killmails.length > 20) killmails.pop();

                console.log(`💀 Kill in ${systemName} (System ID: ${systemId}):`, killmail);
            }
        } catch (error) {
            console.error('❌ Error parsing killmail:', error.message);
        }
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
    });

    ws.on('close', (code, reason) => {
        console.warn(`⚠️ WebSocket closed (code: ${code}, reason: ${reason})`);
        // Optionally reconnect after a delay
        setTimeout(connectToZkillboard, 5000);
    });
};

// Start WebSocket connection
connectToZkillboard();


// Export killmails so `apiRoutes.js` can access them
module.exports = { killmails };