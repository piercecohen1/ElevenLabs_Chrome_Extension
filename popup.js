function updateScrubberValue() {
  chrome.storage.local.get("currentTimeRatio", function (data) {
    const currentTimeRatio = data.currentTimeRatio;
    if (currentTimeRatio !== undefined) {
      const scrubberValue = Math.round(currentTimeRatio * 100);
      document.getElementById("scrubber").value = scrubberValue;
    }
  });
}

function loadSettings() {
  // Get API key
  chrome.storage.local.get("api_key", function (data) {
    const apiKey = data.api_key;
    if (apiKey) {
      document.getElementById("api-key").value = apiKey;
    }
  });
  // Get playback speed
  chrome.storage.sync.get("playback_speed", function (data) {
    const playbackSpeed = data.playback_speed;
    if (playbackSpeed) {
      document.getElementById("playback-speed").value = playbackSpeed;
    } else {
      document.getElementById("playback-speed").value = 1;
    }
  });
}

function continuouslyUpdateScrubberValue() {
  setInterval(updateScrubberValue, 100);
}

document.getElementById("save-api-key").addEventListener("click", function () {
  const api_key = document.getElementById("api-key").value;
  chrome.storage.local.set({ api_key: api_key }, function () {
    alert("API Key saved successfully!");
  });
});

document.getElementById("toggle-playback").addEventListener("click", function () {
  console.log('Play/Pause button clicked'); // Log when the button is clicked
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
  updateScrubberValue();
});

document.getElementById("playback-speed").addEventListener("change", function () {
  const playbackSpeed = parseFloat(this.value);
  chrome.storage.sync.set({ playback_speed: playbackSpeed }, function () {
    console.log("Playback speed saved:", playbackSpeed);
  });
});

updateScrubberValue();
loadSettings();
continuouslyUpdateScrubberValue();

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("playback-speed").addEventListener("change", function () {
    const playbackSpeed = parseFloat(document.getElementById("playback-speed").value);
    chrome.storage.sync.set({ playback_speed: playbackSpeed }, function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "set-playback-speed",
          value: playbackSpeed,
        });
      });
    });
  });
});