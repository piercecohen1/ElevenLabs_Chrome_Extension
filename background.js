chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "read-aloud",
    title: "Read aloud with AI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === "read-aloud") {
    chrome.storage.local.get("api_key", function (data) {
      const api_key = data.api_key;

      chrome.tabs.executeScript(
        {
          code: "window.getSelection().toString();",
        },
        function (selection) {
          const text = selection[0];
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "read-aloud",
              apiKey: api_key,
              text: text,
            });
          });
        }
      );
    });
  }
});