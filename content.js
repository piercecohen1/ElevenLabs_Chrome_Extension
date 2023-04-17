let popupPort = null;

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'popup') {
    popupPort = port;
    port.onDisconnect.addListener(function () {
      popupPort = null;
    });
  }
});

let audioElement = new Audio();
let playState = 'stopped';

function playAudio(url, playbackRate) {
  audioElement.src = url;
  audioElement.playbackRate = playbackRate;
  audioElement.play();
  playState = 'playing';
}

function toggleAudioPlayback() {
  if (playState === 'playing') {
    audioElement.pause();
    playState = 'stopped';
  } else if (playState === 'stopped') {
    audioElement.play();
    playState = 'playing';
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggle-playback') {
    toggleAudioPlayback();
  } else if (request.action === 'scrub') {
    const scrubberValue = request.value;
    const scrubberMax = 100;
    const scrubberRatio = scrubberValue / scrubberMax;
    const scrubbedTime = scrubberRatio * audioElement.duration;
    audioElement.currentTime = scrubbedTime;
  } else if (request.action === 'read-aloud') {
    const api_key = request.apiKey;
    const text = request.text;

    chrome.storage.sync.get("playback_speed", function (data) {
      const playbackRate = data.playback_speed || 1;

      getVoices(api_key)
        .then((voices) => {
          const voice_id = (voices.find(voice => voice.name === "Bella") || voices[0]).voice_id;
          getTextToSpeechURL(voice_id, api_key, text)
            .then((audioURL) => {
              playAudio(audioURL, playbackRate);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
      });
    } else if (request.action === 'set-playback-speed') {
      const playbackSpeed = request.value;
      audioElement.playbackRate = playbackSpeed;
    }
  });

async function getTextToSpeechURL(voiceId, apiKey, text) {
  const apiEndpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const requestOptions = {
    method: "POST",
    headers: new Headers({
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ text: text }),
  };

  const response = await fetch(apiEndpoint, requestOptions);
  if (response.status === 200) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } else {
    throw new Error(`Error: ${response.statusText}`);
  }
}

function sendCurrentTimeRatio() {
  if (audioElement && audioElement.duration > 0) {
    const currentTimeRatio = audioElement.currentTime / audioElement.duration;
    chrome.storage.local.set({ currentTimeRatio: currentTimeRatio });
  }
}

audioElement.addEventListener("timeupdate", sendCurrentTimeRatio);

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === "scrub") {
//     const scrubberValue = request.value;
//     const scrubberMax = 100;
//     const scrubberRatio = scrubberValue / scrubberMax;
//     const scrubbedTime = scrubberRatio * audioElement.duration;
//     audioElement.currentTime = scrubbedTime;
//   }
// });

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'popup') {
    port.onMessage.addListener(messageHandler);
    port.onDisconnect.addListener(() => {
      port.onMessage.removeListener(messageHandler);
    });
  }
});

function messageHandler(message, port){
  switch(message.action) {
    case 'toggle-playback':
      toggleAudioPlayback();
      break;
    case 'scrub':
      const scrubberValue = message.value;
      const scrubberMax = 100;
      const scrubberRatio = scrubberValue / scrubberMax;
      const scrubbedTime = scrubberRatio * audioElement.duration;
      audioElement.currentTime = scrubbedTime;
      break;
    default:
      break;
  }
}