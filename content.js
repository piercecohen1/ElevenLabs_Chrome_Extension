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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggle-playback') {
    toggleAudioPlayback();
  } else if (request.action === 'scrub') {
    const scrubberValue = request.value;
    const scrubberRatio = scrubberValue / 100;
    const scrubbedTime = scrubberRatio * audioElement.duration;
    audioElement.currentTime = scrubbedTime;
  } else if (request.action === 'read-aloud') {
    const api_key = request.apiKey;
    const text = request.text;

    getVoices(api_key)
      .then((voices) => {
        const voice_id = (voices.find(voice => voice.name === "Bella") || voices[0]).voice_id;
        getTextToSpeechURL(voice_id, api_key, text)
          .then((audioURL) => {
            playAudio(audioURL);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
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
