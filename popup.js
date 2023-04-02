function loadSettings() {
    chrome.storage.sync.get("api_key", function (data) {
      const apiKey = data.api_key;
      if (apiKey) {
        document.getElementById("api-key").value = apiKey;
      }
    });
  }
 
  document.getElementById("save-api-key").addEventListener("click", function () {
    const api_key = document.getElementById("api-key").value;
    chrome.storage.sync.set({ api_key: api_key }, function () {
        alert("API Key saved successfully!");
      });
    });
   
    // Load settings when the popup is opened
    loadSettings();