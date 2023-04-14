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

document.getElementById("toggle-playback").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "toggle-playback",
    });
  });
});

document.getElementById("scrubber").addEventListener("input", function () {
  const scrubberValue = document.getElementById("scrubber").value;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "scrub",
      value: scrubberValue,
    });
  });
});

// Load settings when the popup is opened
loadSettings();
