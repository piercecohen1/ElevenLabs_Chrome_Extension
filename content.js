chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'read-aloud') {
    const api_key = request.apiKey;
    const text = request.text;

    getVoices(api_key)
      .then((voices) => {
        // Select "Bella" as default voice or fallback to the first voice available
        const voice_id = voices.find(voice => voice.name === "Bella").voice_id || voices[0].voice_id;
        playAudio(voice_id, api_key, text);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});