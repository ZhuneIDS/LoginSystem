const axios = require('axios');

async function fetchAndLogCommodityDetails(token, itemId) {
  try {
    const itemUrl = `https://us.api.blizzard.com/data/wow/item/${itemId}?namespace=static-us&locale=en_US&access_token=${token}`;
    const itemResponse = await axios.get(itemUrl);
    const itemDetails = itemResponse.data;
    if (itemDetails.level >= 200) {
      console.log(`Found Dragonflight item: ${itemDetails.name}`);
    } else {
      console.log(`Item ID ${itemId} does not belong to Dragonflight or does not meet level criteria.`);
    }
  } catch (itemError) {
    console.error(`Error fetching details for Item ID: ${itemId}`, itemError);
  }
}

module.exports = fetchAndLogCommodityDetails;