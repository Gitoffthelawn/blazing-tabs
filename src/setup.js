window.addEventListener('load', (event) => {
  chrome.windows.getCurrent((function(windowInfo) {
      const ownWindowId = windowInfo.id;

      callbacks.register('switchToTab', function(tabId) {
         chrome.tabs.get(tabId, function(tab) {
           chrome.tabs.highlight({"windowId": tab.windowId, "tabs": [tab.index]});
         });
      });

      const queryTabs = function() {
        chrome.runtime.sendMessage(null, {btabsMsgType: "queryTabs"});
      }

      window.onfocus = function () {
          queryTabs();
      };

      callbacks.register('closeTab', function(tabId) {
          chrome.tabs.remove(tabId, function() {});
      });

      chrome.runtime.onMessage.addListener(function(message, sender) {
          document.getElementById("tab-search").focus();

          if (message.btabsMsgType == "tabs") {
              const tabs = message.tabs.map((function(tab) {
                  var favIconUrl = null;
                  if (tab.favIconUrl) {
                      favIconUrl = tab.favIconUrl.toString();
                  }
                  return { id: tab.id
                         , windowId: tab.windowId
                         , index: tab.index
                         , title: tab.title
                         , favIconUrl: favIconUrl
                         , url: tab.url
                         };
              }));
              /* TODO add own window id here */
              callbacks.call('notifyTabs', {tabSources: tabs, ownWindowId: ownWindowId});
          }
      });

      queryTabs();
  }));
});
