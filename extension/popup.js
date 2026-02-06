// 5th Ave Content Saver - Chrome Extension
// v2.0 - Supports Crypto, AI, and General pipelines

// Default API endpoint - update this to your Content Hub URL
const DEFAULT_API_ENDPOINT = 'https://3000-i8wcwhv91wsc5cw1epaap-02b9cc79.sandbox.novita.ai';

let apiEndpoint = DEFAULT_API_ENDPOINT;
let currentUrl = '';
let currentTitle = '';
let currentTopic = 'general'; // Default topic

// Topic button styling classes
const TOPIC_STYLES = {
  crypto: 'active-crypto',
  ai: 'active-ai',
  general: 'active-general'
};

// Save button labels and styles
const SAVE_LABELS = {
  crypto: { text: 'Save to Crypto News', class: 'crypto' },
  ai: { text: 'Save to AI News', class: 'ai' },
  general: { text: 'Save to Pipeline', class: 'general' }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await chrome.storage.sync.get(['apiEndpoint', 'lastTopic']);
  
  if (settings.apiEndpoint) {
    apiEndpoint = settings.apiEndpoint;
    document.getElementById('api-endpoint').value = apiEndpoint;
  } else {
    document.getElementById('api-endpoint').value = DEFAULT_API_ENDPOINT;
  }

  // Restore last-used topic
  if (settings.lastTopic && TOPIC_STYLES[settings.lastTopic]) {
    currentTopic = settings.lastTopic;
  }

  // Update dashboard link
  document.getElementById('dashboard-link').href = apiEndpoint;

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentUrl = tab.url;
    currentTitle = tab.title;

    document.getElementById('page-url').textContent = currentUrl;
    document.getElementById('page-title').textContent = currentTitle;

    // Auto-detect YouTube
    if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
      document.getElementById('page-title').textContent = '\uD83C\uDFAC ' + currentTitle;
    }

    // Auto-suggest topic based on URL
    autoSuggestTopic(currentUrl, currentTitle);
  }

  // Set active topic button
  setActiveTopic(currentTopic);

  // Topic button click handlers
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.dataset.topic;
      setActiveTopic(topic);
    });
  });

  // Platform button toggles
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const checkbox = btn.querySelector('input');
      checkbox.checked = !checkbox.checked;
      btn.classList.toggle('active', checkbox.checked);
    });
  });

  // Settings toggle
  document.getElementById('settings-toggle').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.toggle('show');
  });

  // Save settings
  document.getElementById('save-settings').addEventListener('click', async () => {
    const newEndpoint = document.getElementById('api-endpoint').value.trim();
    if (newEndpoint) {
      apiEndpoint = newEndpoint.replace(/\/$/, '');
      await chrome.storage.sync.set({ apiEndpoint });
      document.getElementById('dashboard-link').href = apiEndpoint;
      showStatus('Settings saved!', 'success');
    }
  });

  // Save button
  document.getElementById('save-btn').addEventListener('click', saveToAirtable);
});

// Auto-suggest topic based on URL and title
function autoSuggestTopic(url, title) {
  const text = (url + ' ' + title).toLowerCase();

  // Check for crypto signals
  const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'defi', 'nft', 'web3', 'coindesk', 'cointelegraph', 'decrypt.co'];
  const hasCrypto = cryptoKeywords.some(kw => text.includes(kw));

  // Check for AI signals
  const aiKeywords = ['artificial intelligence', ' ai ', 'openai', 'chatgpt', 'gpt-', 'claude', 'anthropic', 'deepmind', 'llm', 'machine learning', 'neural network', 'robot', 'nvidia', 'hugging face'];
  const hasAI = aiKeywords.some(kw => text.includes(kw));

  // Only auto-suggest if we have a clear signal (not both)
  if (hasCrypto && !hasAI) {
    currentTopic = 'crypto';
  } else if (hasAI && !hasCrypto) {
    currentTopic = 'ai';
  }
  // If both or neither, keep the last-used topic
}

// Set active topic
function setActiveTopic(topic) {
  currentTopic = topic;

  // Save preference
  chrome.storage.sync.set({ lastTopic: topic });

  // Update button styling
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.classList.remove('active-crypto', 'active-ai', 'active-general');
    if (btn.dataset.topic === topic) {
      btn.classList.add(TOPIC_STYLES[topic]);
    }
  });

  // Update save button
  const saveBtn = document.getElementById('save-btn');
  const label = SAVE_LABELS[topic];
  saveBtn.className = 'save-btn ' + label.class;
  saveBtn.innerHTML = '<span>\uD83D\uDCBE</span> ' + label.text;
}

// Save to Airtable via backend API
async function saveToAirtable() {
  const saveBtn = document.getElementById('save-btn');
  const customTitle = document.getElementById('custom-title').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const platforms = Array.from(document.querySelectorAll('.platform-btn input:checked'))
    .map(cb => cb.value);

  // Disable button and show loading
  saveBtn.disabled = true;
  const label = SAVE_LABELS[currentTopic];
  saveBtn.innerHTML = '<div class="spinner"></div> Saving...';
  showStatus('Saving to ' + label.text.replace('Save to ', '') + '...', 'loading');

  try {
    const response = await fetch(apiEndpoint + '/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: currentUrl,
        title: customTitle || currentTitle,
        notes: notes,
        platforms: platforms,
        topic: currentTopic
      })
    });

    const result = await response.json();

    if (result.success) {
      const tableName = result.table || label.text.replace('Save to ', '');
      showStatus('Saved to ' + tableName + '!', 'success');
      saveBtn.innerHTML = '\u2705 Saved!';

      // Reset after 2 seconds
      setTimeout(() => {
        saveBtn.innerHTML = '<span>\uD83D\uDCBE</span> ' + label.text;
        saveBtn.disabled = false;
      }, 2000);
    } else {
      throw new Error(result.error || 'Failed to save');
    }
  } catch (error) {
    console.error('Error:', error);
    showStatus(error.message, 'error');
    saveBtn.innerHTML = '<span>\uD83D\uDCBE</span> ' + label.text;
    saveBtn.disabled = false;
  }
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = (type === 'success' ? '\u2705 ' : type === 'error' ? '\u274C ' : '\u23F3 ') + message;
  status.className = 'status show ' + type;

  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      status.className = 'status';
    }, 4000);
  }
}
