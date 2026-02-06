// 5th Ave Content Saver - Chrome Extension
// v3.0 - Instant webhook processing (no 15-minute wait)

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
  crypto: { text: 'Save & Process Crypto News', class: 'crypto' },
  ai: { text: 'Save & Process AI News', class: 'ai' },
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
  saveBtn.innerHTML = '<span>\u26A1</span> ' + label.text;

  // Show/hide processing info
  const processingInfo = document.getElementById('processing-info');
  if (processingInfo) {
    processingInfo.style.display = (topic === 'crypto' || topic === 'ai') ? 'block' : 'none';
  }
}

// Save to Airtable via backend API — triggers instant n8n webhook processing
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
  showStatus('Saving to ' + label.text.replace('Save & Process ', '').replace('Save to ', '') + '...', 'loading');

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
      const tableName = result.table || label.text.replace('Save & Process ', '').replace('Save to ', '');
      
      // Check if instant processing was triggered
      if (result.processing === 'started') {
        // Show processing status with record info
        showStatus('\u2705 Saved to ' + tableName + ' \u2014 \u26A1 Processing instantly via n8n...', 'success');
        saveBtn.innerHTML = '\u26A1 Processing...';
        saveBtn.className = 'save-btn processing';
        
        // Start polling for completion
        pollProcessingStatus(result.record.id, currentTopic, saveBtn, label);
      } else {
        // General topic or no processing needed
        showStatus('\u2705 Saved to ' + tableName + '!', 'success');
        saveBtn.innerHTML = '\u2705 Saved!';
        
        // Reset after 2 seconds
        setTimeout(() => {
          saveBtn.innerHTML = '<span>\u26A1</span> ' + label.text;
          saveBtn.className = 'save-btn ' + label.class;
          saveBtn.disabled = false;
        }, 2000);
      }
    } else {
      throw new Error(result.error || 'Failed to save');
    }
  } catch (error) {
    console.error('Error:', error);
    showStatus(error.message, 'error');
    saveBtn.innerHTML = '<span>\u26A1</span> ' + label.text;
    saveBtn.className = 'save-btn ' + label.class;
    saveBtn.disabled = false;
  }
}

// Poll the processing status endpoint to check if n8n has finished
async function pollProcessingStatus(recordId, topic, saveBtn, label) {
  const maxPolls = 30; // 30 polls * 3 seconds = 90 seconds max
  let pollCount = 0;
  
  const poll = async () => {
    pollCount++;
    
    try {
      const response = await fetch(apiEndpoint + '/api/process-status/' + recordId + '?topic=' + topic);
      const status = await response.json();
      
      if (status.status === 'complete') {
        // All content generated!
        const headline = status.fields.rewrittenHeadline ? (' \u2014 "' + status.fields.rewrittenHeadline + '"') : '';
        showStatus('\u2705 Content ready!' + headline, 'success');
        saveBtn.innerHTML = '\u2705 Content Ready!';
        saveBtn.className = 'save-btn ' + label.class;
        
        // Reset after 4 seconds
        setTimeout(() => {
          saveBtn.innerHTML = '<span>\u26A1</span> ' + label.text;
          saveBtn.disabled = false;
        }, 4000);
        return;
      }
      
      if (status.status === 'generating_content') {
        showStatus('\u26A1 Research done \u2014 generating social content & image prompt...', 'loading');
        saveBtn.innerHTML = '\u26A1 Generating content...';
      }
      
      if (pollCount < maxPolls) {
        setTimeout(poll, 3000);
      } else {
        // Timed out but still processing
        showStatus('\u2705 Saved! Processing continues in background \u2014 check dashboard for results.', 'success');
        saveBtn.innerHTML = '<span>\u26A1</span> ' + label.text;
        saveBtn.className = 'save-btn ' + label.class;
        saveBtn.disabled = false;
      }
    } catch (err) {
      console.error('Poll error:', err);
      // Don't fail — processing may still be running
      if (pollCount < maxPolls) {
        setTimeout(poll, 3000);
      } else {
        saveBtn.innerHTML = '<span>\u26A1</span> ' + label.text;
        saveBtn.className = 'save-btn ' + label.class;
        saveBtn.disabled = false;
      }
    }
  };
  
  // Start polling after 5 seconds (give n8n time to start)
  setTimeout(poll, 5000);
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status show ' + type;

  // Auto-hide success messages after 8 seconds (longer for processing updates)
  if (type === 'success') {
    setTimeout(() => {
      status.className = 'status';
    }, 8000);
  }
}
