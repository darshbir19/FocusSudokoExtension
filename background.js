// Initialize the blocklist with some default sites
const defaultBlocklist = [
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'reddit.com'
];

// Initialize storage with default blocklist
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  chrome.storage.sync.get(['blocklist'], (result) => {
    if (!result.blocklist) {
      chrome.storage.sync.set({ blocklist: defaultBlocklist }, () => {
        console.log('Default blocklist set:', defaultBlocklist);
        updateRules(defaultBlocklist);
      });
    } else {
      console.log('Existing blocklist loaded:', result.blocklist);
      updateRules(result.blocklist);
    }
  });
});

// Update rules when blocklist changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blocklist) {
    console.log('Blocklist changed:', changes.blocklist.newValue);
    updateRules(changes.blocklist.newValue);
  }
});

// Function to update the declarativeNetRequest rules
function updateRules(blocklist) {
  console.log('Updating rules for blocklist:', blocklist);
  
  const rules = blocklist.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: '/sudoku.html'
      }
    },
    condition: {
      urlFilter: `*://*.${domain}/*`,
      resourceTypes: ['main_frame']
    }
  }));

  // First remove all existing rules
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleIds = existingRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds
    }, () => {
      // Then add new rules
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      }, () => {
        console.log('Rules updated successfully');
        // Verify the rules were added
        chrome.declarativeNetRequest.getDynamicRules((currentRules) => {
          console.log('Current active rules:', currentRules);
        });
      });
    });
  });
}

// Handle messages from the Sudoku page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'unblock') {
    console.log('Unblock request received');
    // Get the original URL from storage
    chrome.storage.local.get(['originalUrl'], (result) => {
      if (result.originalUrl) {
        console.log('Redirecting to original URL:', result.originalUrl);
        chrome.tabs.update(sender.tab.id, { url: result.originalUrl });
      }
    });
  }
});

// Store the original URL when redirecting to Sudoku
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log('Storing original URL:', details.url);
    chrome.storage.local.set({ originalUrl: details.url });
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

// Initial rules setup
chrome.storage.sync.get(['blocklist'], (result) => {
  updateRules(result.blocklist || defaultBlocklist);
}); 