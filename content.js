let audioElement = new Audio();
let playState = 'stopped';

function playAudio(url) {
  audioElement.src = url;
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

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'popup') {
    port.onMessage.addListener(messageHandler);
    port.onDisconnect.addListener(() => {
      port.onMessage.removeListener(messageHandler);
    });
  }
});

function messageHandler(message, port) {
  switch (message.action) {
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
