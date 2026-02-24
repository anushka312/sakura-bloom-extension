// background.js - Chrome Extension Service Worker
// This handles alarms for rituals when the app is closed.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Sakura Bloom Extension Installed');
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('ritual-')) {
    const ritualName = alarm.name.replace('ritual-', '');
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Sakura Bloom',
      message: `Time for your ritual: ${ritualName} 🌸`,
      priority: 2
    });
  }
});

// We sync rituals to alarms whenever the storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.sakura_bloom_state) {
    const state = changes.sakura_bloom_state.newValue;
    if (!state || !state.settings.notifications) {
      chrome.alarms.clearAll();
      return;
    }

    // Clear existing ritual alarms
    chrome.alarms.getAll(alarms => {
      alarms.forEach(a => {
        if (a.name.startsWith('ritual-')) chrome.alarms.clear(a.name);
      });

      // Set new alarms
      state.rituals.forEach(ritual => {
        if (ritual.reminderTime) {
          const [hours, minutes] = ritual.reminderTime.split(':').map(Number);
          const now = new Date();
          const scheduledTime = new Date();
          scheduledTime.setHours(hours, minutes, 0, 0);

          // If time has passed today, set for tomorrow
          if (scheduledTime <= now) {
            scheduledTime.setDate(now.getDate() + 1);
          }

          chrome.alarms.create(`ritual-${ritual.name}`, {
            when: scheduledTime.getTime(),
            periodInMinutes: 1440 // Daily
          });
        }
      });
    });
  }
});
