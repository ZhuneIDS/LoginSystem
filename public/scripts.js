const sprite = document.getElementById('animated-sprite');
const spriteWidth = 160;
const spriteHeight = 160;
const totalFrames = 4; // 2x2 grid, so 4 frames total
let currentFrame = 0;

window.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/profile-data');
      const data = await response.json();
      console.log("Received profile data:", data);

      // Save profile data to localStorage
      for (const key in data) {
        if (data[key]) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      }

      // Load profiles from localStorage and append to DOM
      loadProfiles();
    //   function animateSprite() {
    //     const frameX = currentFrame % 2; // Calculate X position (column)
    //     const frameY = Math.floor(currentFrame / 2); // Calculate Y position (row)
    
    //     const posX = -frameX * spriteWidth;
    //     const posY = -frameY * spriteHeight;
    
    //     sprite.style.backgroundPosition = `${posX}px ${posY}px`;
    
    //     currentFrame = (currentFrame + 1) % totalFrames; // Loop back to the first frame
    // }
    
    // // Animate every 500ms (adjust to speed up or slow down)
    // setInterval(animateSprite, 500);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  });

  function loadProfiles() {
    const accountsDiv = document.getElementById('accounts');
    accountsDiv.innerHTML = ''; // Clear any existing content

    // Iterate over localStorage items
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const account = JSON.parse(localStorage.getItem(key));
        if (account) {
          let accountCard = document.createElement('div');
          accountCard.className = 'card';

          if (key === 'bnetProfile') {
            accountCard.innerHTML = `
              <h3>Battle.net Account</h3>
              <p>BattleTag: ${account.battletag}</p>
              <p>ID: ${account.id}</p>
           <p>Access Token: ${"account.token"}</p>
              <button onclick="fetchWoWCharacter()">Fetch WoW Character</button>
              <div id="wow-character"></div>
              <button onclick="fetchWoWCharacterMedia()">Fetch WoW Character Media</button>
              <div id="wow-character-media"></div>
            `;
            console.log("Appending Battle.net card to DOM:", accountCard);
          } else if (key === 'eveProfile') {
            accountCard.innerHTML = `
              <h3>EVE Online Account</h3>
              <p>Character Name: ${account.CharacterName}</p>
              <p>Character ID: ${account.CharacterID}</p>
              <p>Access Token: ${account.accessToken}</p>
              <button onclick="fetchEveAssets(${account.CharacterID}, '${account.accessToken}')">Fetch Assets</button>
              <div id="assets-${account.CharacterID}"></div>
            `;
            console.log("Appending EVE Online card to DOM:", accountCard);
          }

          accountsDiv.appendChild(accountCard);
        }
      }
    }
  }

  async function fetchWoWCharacter() {
    try {
      const response = await fetch('/fetch-wow-character');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const character = await response.json();
      console.log('WoW Character:', character);

      const wowCharacterDiv = document.getElementById('wow-character');
      wowCharacterDiv.innerHTML = `<pre>${JSON.stringify(character, null, 2)}</pre>`;
    } catch (error) {
      console.error('Error fetching WoW character:', error);
    }
  }

  async function fetchWoWCharacterAppearance() {
    try {
      const response = await fetch('/fetch-wow-character-appearance');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const appearance = await response.json();
      console.log('WoW Character Appearance:', appearance);
  
      const wowCharacterAppearanceDiv = document.getElementById('character-appearance');
      wowCharacterAppearanceDiv.innerHTML = `<pre>${JSON.stringify(appearance, null, 2)}</pre>`;
    } catch (error) {
      console.error('Error fetching WoW character appearance:', error);
    }
  }

  async function fetchWoWCharacterMedia() {
    try {
      const response = await fetch('/fetch-wow-character-media');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const characterMedia = await response.json();
      console.log('WoW Character Media:', characterMedia);
  
      const wowCharacterMediaDiv = document.getElementById('wow-character-media');
      wowCharacterMediaDiv.innerHTML = ''; // Clear any existing content
  
      characterMedia.assets.forEach(asset => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'img-container';
  
        const img = document.createElement('img');
        img.src = asset.value;
        img.alt = asset.key;
        img.className = 'character-image'; // Add a class for styling
        imgContainer.appendChild(img);
  
        wowCharacterMediaDiv.appendChild(imgContainer);
      });
    } catch (error) {
      console.error('Error fetching WoW character media:', error);
    }
  }
  

  document.getElementById('view-character-data').addEventListener('click', async () => {
    try {
      const response = await fetch('/fetch-wow-characters');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('WoW Characters:', data);
  
      const characterDataDiv = document.getElementById('character-data');
      characterDataDiv.innerHTML = ''; // Clear any existing content
  
      const realmGroups = {};
  
      data.wow_accounts.forEach(account => {
        account.characters.forEach(character => {
          const realm = character.realm.name;
          if (!realmGroups[realm]) {
            realmGroups[realm] = [];
          }
          realmGroups[realm].push(character);
        });
      });
  
      for (const [realm, characters] of Object.entries(realmGroups)) {
        // Sort characters by level in descending order
        characters.sort((a, b) => b.level - a.level);
  
        const realmCard = document.createElement('div');
        realmCard.className = 'card';
        realmCard.innerHTML = `<h3>Realm: ${realm}</h3>`;
        
        const realmCardContent = document.createElement('div');
        realmCardContent.className = 'realm-card';
  
        characters.forEach(character => {
          const characterDiv = document.createElement('div');
          characterDiv.className = 'character-card';
          characterDiv.innerHTML = `
            <div class="character">
              <p><strong>Name:</strong> ${character.name}</p>
              <p><strong>Race:</strong> ${character.playable_race.name}</p>
              <p><strong>Class:</strong> ${character.playable_class.name}</p>
              <p><strong>Level:</strong> ${character.level}</p>
            </div>
          `;
          realmCardContent.appendChild(characterDiv);
        });
  
        realmCard.appendChild(realmCardContent);
        characterDataDiv.appendChild(realmCard);
      }
    } catch (error) {
      console.error('Error fetching WoW characters:', error);
    }
  });
  

  async function fetchEveAssets(characterId, accessToken) {
    console.log("calling fetch eve assets 1")
    const url = `/fetch-eve-assets?characterId=${characterId}&accessToken=${accessToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const assets = await response.json();
      console.log(`Assets for character ${characterId}:`, assets);

      // Display the assets in the respective card
      const assetsDiv = document.getElementById(`assets-${characterId}`);
      assetsDiv.innerHTML = `<pre>${JSON.stringify(assets, null, 2)}</pre>`;
    } catch (error) {
      console.error("Error fetching EVE assets:", error);
    }
  }

  // $(document).ready(function () {
  //   $.get('/generate-model', function (data) {
  //     // Assuming data contains the necessary information to render the model
  //     new ZamModelViewer({
  //       container: "#model_3d",
  //       type: '3d',
  //       model: data,
  //     });
  //   }).fail(function () {
  //     console.error('Error fetching model data');
  //   });
  // });

  // function animateSprite() {
  //   const frameX = currentFrame % 2; // Calculate X position (column)
  //   const frameY = Math.floor(currentFrame / 2); // Calculate Y position (row)
  
  //   const posX = -frameX * spriteWidth;
  //   const posY = -frameY * spriteHeight;
  
  //   sprite.style.backgroundPosition = `${posX}px ${posY}px`;
  
  //   currentFrame = (currentFrame + 1) % totalFrames; // Loop back to the first frame
  // }
  
  // // Animate every 500ms (adjust to speed up or slow down)
  // setInterval(animateSprite, 500);

  document.getElementById('fetch-commodities').addEventListener('click', async () => {
    try {
      const response = await fetch('/fetch-commodities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const message = await response.text();
      console.log('Response from server:', message);
  
      // Optionally, display the message in the DOM
      const outputDiv = document.getElementById('output');
      outputDiv.textContent = message;
    } catch (error) {
      console.error('Error fetching commodities:', error);
    }
  });
  

  document.getElementById('fetch-specific-commodity').addEventListener('click', async () => {
    try {
      const response = await fetch('/fetch-commodity');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const commodity = await response.json();
      console.log('Commodity Details:', commodity);
  
      // Display the item details on the page
      const commodityDiv = document.getElementById('commodity-details');
      commodityDiv.innerHTML = `
        <h3>Item: ${commodity.itemDetails.name}</h3>
        <p>Level: ${commodity.itemDetails.level}</p>
        <p>Description: ${commodity.itemDetails.description || 'No description available'}</p>
      `;
    } catch (error) {
      console.error('Error fetching commodity:', error);
    }
  });

  const fetchEveAssetsButton = document.getElementById("fetch-eve-assets");
const eveAssetsDiv = document.getElementById("eve-assets");

document.getElementById("fetch-eve-industry-jobs").addEventListener("click", async () => {
  try {
      // Fetch user session profile to get CharacterID and AccessToken
      const response = await fetch('/profile-data');
      const data = await response.json();

      if (!data.eveProfile) {
          document.getElementById("eve-industry-jobs").innerHTML = "<p>No EVE profile found. Please authenticate.</p>";
          return;
      }

      const { CharacterID, accessToken } = data.eveProfile;

      console.log(`Fetching industry jobs for CharacterID: ${CharacterID}, AccessToken: ${accessToken}`);

      await fetchEveIndustryJobs(CharacterID, accessToken);
  } catch (error) {
      console.error("Error fetching profile data:", error);
  }
});
const eveIndustryJobsDiv = document.getElementById("eve-industry-jobs");
  
async function fetchEveAssets() {
  eveAssetsDiv.innerHTML = '<div class="loader"></div>'; // Show loading animation
  try {
      const response = await fetch('/profile-data');
      const data = await response.json();

      if (!data.eveProfile) {
          eveAssetsDiv.innerHTML = "<p>No EVE profile found. Please authenticate.</p>";
          return;
      }

      const { CharacterID, accessToken } = data.eveProfile;
      const url = `/fetch-eve-assets?characterId=${CharacterID}&accessToken=${accessToken}`;

      const assetsResponse = await fetch(url);
      if (!assetsResponse.ok) throw new Error(`HTTP error! status: ${assetsResponse.status}`);

      const assets = await assetsResponse.json();
      eveAssetsDiv.innerHTML = `<pre>${JSON.stringify(assets, null, 2)}</pre>`;
  } catch (error) {
      eveAssetsDiv.innerHTML = `<p>Error fetching assets: ${error.message}</p>`;
  }
}

async function fetchEveIndustryJobs(characterId, accessToken) {
  if (!characterId || !accessToken) {
      console.error("Missing character ID or access token.");
      document.getElementById("eve-industry-jobs").innerHTML = "<p>Error: Missing character ID or access token.</p>";
      return;
  }

  const url = `/fetch-eve-industry-jobs?characterId=${characterId}&accessToken=${accessToken}`;
  
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const jobs = await response.json();
      console.log("Industry Jobs Data:", jobs);

      let jobsHtml = "<h3>Industry Jobs</h3><ul>";
      
      jobs.forEach(job => {
          console.log(job);

          // Convert start_date and end_date to Date objects
          const startDate = new Date(job.start_date);
          const endDate = new Date(job.end_date);
          const now = new Date();

          // Calculate total duration (in seconds)
          const totalDurationSec = Math.floor((endDate - startDate) / 1000);

          // Calculate remaining time (in seconds)
          const remainingTimeSec = Math.floor((endDate - now) / 1000);

          // Convert seconds to days, hours, and minutes
          const totalDays = Math.floor(totalDurationSec / (24 * 3600));
          const totalHours = Math.floor((totalDurationSec % (24 * 3600)) / 3600);
          const totalMinutes = Math.floor((totalDurationSec % 3600) / 60);

          const remainingDays = Math.max(0, Math.floor(remainingTimeSec / (24 * 3600)));
          const remainingHours = Math.max(0, Math.floor((remainingTimeSec % (24 * 3600)) / 3600));
          const remainingMinutes = Math.max(0, Math.floor((remainingTimeSec % 3600) / 60));

          // Create readable time format
          const totalTimeStr = `${totalDays}d ${totalHours}h ${totalMinutes}m`;
          const remainingTimeStr = `${remainingDays}d ${remainingHours}h ${remainingMinutes}m`;

          jobsHtml += `
              <li>
                  <strong>Job ID:</strong> ${job.job_id}<br>
                  <strong>Blueprint:</strong> ${job.blueprint_type_id}<br>
                  <strong>Status:</strong> ${job.status}<br>
                  <strong>Runs:</strong> ${job.runs}<br>
                  <strong>Total Duration:</strong> ${totalTimeStr}<br>
                  <strong>Time Left:</strong> ${remainingTimeStr}
              </li>`;
      });

      jobsHtml += "</ul>";
      document.getElementById("eve-industry-jobs").innerHTML = jobsHtml;

  } catch (error) {
      console.error("Error fetching EVE industry jobs:", error);
      document.getElementById("eve-industry-jobs").innerHTML = `<p>Error fetching industry jobs: ${error.message}</p>`;
  }
}
 
fetchEveAssetsButton.addEventListener("click", fetchEveAssets);
