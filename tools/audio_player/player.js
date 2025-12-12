/**
 * Audio Player for Parents - Chinese Interface
 * Fetches audio content from Cloudflare R2 and provides playback/download
 */

// =====================================================
// Configuration - Update these values for your R2 bucket
// =====================================================
const CONFIG = {
  // RSS Feeds
  feeds: [
    { id: 'daily', name: '天天学习', url: 'https://podcast.onswitch.ca/podcast/feed.xml' },
    { id: 'news', name: '每日新闻', url: 'https://podcast.onswitch.ca/podcast/ybzj_news.xml' }
  ],
  defaultFeedId: 'daily',

  // Cache duration in milliseconds (5 minutes)
  cacheDuration: 5 * 60 * 1000,
};

// =====================================================
// State
// =====================================================
let episodes = [];
let currentEpisode = null;
let isPlaying = false;

// =====================================================
// DOM Elements
// =====================================================
const $ = (id) => document.getElementById(id);

const elements = {
  // States
  loadingState: $('loadingState'),
  errorState: $('errorState'),
  emptyState: $('emptyState'),
  episodeList: $('episodeList'),

  // Error
  errorMessage: $('errorMessage'),
  retryBtn: $('retryBtn'),

  // Episodes
  episodes: $('episodes'),
  lastUpdated: $('lastUpdated'),

  // Now Playing
  nowPlaying: $('nowPlaying'),
  nowPlayingTitle: $('nowPlayingTitle'),
  currentTime: $('currentTime'),
  totalTime: $('totalTime'),
  progressBar: $('progressBar'),
  playPauseBtn: $('playPauseBtn'),
  rewindBtn: $('rewindBtn'),
  forwardBtn: $('forwardBtn'),

  // Audio
  audioPlayer: $('audioPlayer'),

  // Header
  refreshBtn: $('refreshBtn'),
  themeBtn: $('themeBtn'),
  feedSelect: $('feedSelect'),
};

// =====================================================
// Utilities
// =====================================================

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date string to Chinese locale
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format relative time in Chinese
 */
function formatRelativeTime(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  } catch {
    return '';
  }
}

// =====================================================
// State Management
// =====================================================

function showState(state) {
  const states = ['loadingState', 'errorState', 'emptyState', 'episodeList'];
  states.forEach(s => {
    elements[s]?.classList.toggle('hidden', s !== state);
  });
}

function showError(message) {
  elements.errorMessage.textContent = message;
  showState('errorState');
}

// =====================================================
// Feed Management
// =====================================================

function getActiveFeed() {
  const savedId = localStorage.getItem('activeFeedId');
  const feed = CONFIG.feeds.find(f => f.id === savedId) || CONFIG.feeds.find(f => f.id === CONFIG.defaultFeedId);
  return feed;
}

function initFeedSelector() {
  const activeFeed = getActiveFeed();

  elements.feedSelect.innerHTML = CONFIG.feeds.map(feed => `
    <option value="${feed.id}" ${feed.id === activeFeed.id ? 'selected' : ''}>
      ${feed.name}
    </option>
  `).join('');

  elements.feedSelect.addEventListener('change', (e) => {
    localStorage.setItem('activeFeedId', e.target.value);
    loadEpisodes();
  });
}

// =====================================================
// Theme Management
// =====================================================

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const iconMoon = elements.themeBtn.querySelector('.icon-moon');
  const iconSun = elements.themeBtn.querySelector('.icon-sun');

  if (theme === 'light') {
    iconMoon.classList.add('hidden');
    iconSun.classList.remove('hidden');
  } else {
    iconMoon.classList.remove('hidden');
    iconSun.classList.add('hidden');
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  elements.themeBtn.addEventListener('click', toggleTheme);
}

// =====================================================
// Data Fetching
// =====================================================

async function fetchAndParseRSS() {
  elements.refreshBtn.classList.add('spinning');

  try {
    // Add cache-busting query parameter
    const activeFeed = getActiveFeed();
    const url = activeFeed.url + (activeFeed.url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("XML Parsing Error");
    }

    return xmlDoc;
  } catch (error) {
    console.error('Failed to fetch RSS:', error);
    throw error;
  } finally {
    elements.refreshBtn.classList.remove('spinning');
  }
}

async function loadEpisodes() {
  showState('loadingState');

  try {
    const xmlDoc = await fetchAndParseRSS();
    const items = xmlDoc.querySelectorAll('item');

    if (items.length === 0) {
      showState('emptyState');
      return;
    }

    let channelImage = xmlDoc.querySelector('channel > image > url')?.textContent;
    if (!channelImage) {
      channelImage = xmlDoc.querySelector('channel > itunes\\:image, channel > image')?.getAttribute('href');
    }

    episodes = Array.from(items).map(item => {
      const enclosure = item.querySelector('enclosure');
      const audioUrl = enclosure ? enclosure.getAttribute('url') : '';

      // Parse duration
      let duration = item.querySelector('itunes\\:duration, duration')?.textContent || '';
      // If duration has no colons, it might be seconds
      if (duration && !duration.includes(':')) {
        duration = formatTime(parseInt(duration, 10));
      }

      // Parse image
      // Try standard itunes:image
      let thumbnail = item.getElementsByTagName('itunes:image')[0]?.getAttribute('href');
      if (!thumbnail) {
        // Fallback to channel image
        thumbnail = channelImage || null;
      }

      const pubDate = item.querySelector('pubDate')?.textContent;
      const guid = item.querySelector('guid')?.textContent;

      return {
        id: guid || audioUrl,
        title: item.querySelector('title')?.textContent || 'Untitled',
        description: item.querySelector('description')?.textContent || '',
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        duration: duration,
        audioUrl: audioUrl,
        thumbnail: thumbnail
      };
    }).filter(ep => ep.audioUrl); // Only include episodes with audio

    // Update last updated text
    const lastBuildDate = xmlDoc.querySelector('lastBuildDate')?.textContent || xmlDoc.querySelector('pubDate')?.textContent;

    if (lastBuildDate) {
      elements.lastUpdated.textContent = `最后更新：${formatRelativeTime(lastBuildDate)}`;
    } else if (episodes.length > 0) {
      // Fallback to latest episode date
      elements.lastUpdated.textContent = `最后更新：${formatRelativeTime(episodes[0].date)}`;
    }

    renderEpisodes();
    showState('episodeList');
  } catch (error) {
    console.error(error);
    showError('无法加载内容，请检查网络连接');
  }
}

// =====================================================
// Rendering
// =====================================================

function renderEpisodes() {
  elements.episodes.innerHTML = episodes.map((episode, index) => `
    <li class="episode-card" data-index="${index}" data-id="${episode.id}">
      <div class="episode-main-row">
        ${episode.thumbnail
      ? `<img class="episode-thumb" src="${episode.thumbnail}" alt="" loading="lazy" />`
      : `<div class="episode-thumb-placeholder">🎵</div>`
    }
        <div class="episode-info">
          <h3 class="episode-title">${escapeHtml(episode.title)}</h3>
          <div class="episode-meta">
            <span>📅 ${formatDate(episode.date)}</span>
            ${episode.duration ? `<span>⏱️ ${episode.duration}</span>` : ''}
          </div>
        </div>
        <div class="episode-actions">
          <button class="episode-btn download-btn" data-action="download" data-index="${index}" type="button" aria-label="下载">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="episode-btn play-btn" data-action="play" data-index="${index}" type="button" aria-label="播放">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
      ${episode.description ? `<div class="episode-description">${escapeHtml(episode.description)}</div>` : ''}
    </li>
  `).join('');

  // Add icon button listeners
  elements.episodes.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleEpisodeAction);
  });

  // Add card expand listeners
  elements.episodes.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', toggleEpisodeExpand);
  });
}

function toggleEpisodeExpand(e) {
  // Ignore clicks on buttons (handled by stopPropagation, but extra safety check)
  if (e.target.closest('button')) return;

  const card = e.currentTarget;
  card.classList.toggle('expanded');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updatePlayingState() {
  // Update episode cards
  elements.episodes.querySelectorAll('.episode-card').forEach(card => {
    const index = parseInt(card.dataset.index, 10);
    const isCurrentEpisode = currentEpisode && episodes[index]?.id === currentEpisode.id;
    card.classList.toggle('playing', isCurrentEpisode && isPlaying);

    const playBtn = card.querySelector('.play-btn');
    if (playBtn) {
      if (isCurrentEpisode && isPlaying) {
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        `;
        playBtn.classList.add('playing');
        playBtn.setAttribute('aria-label', '暂停');
      } else {
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
        playBtn.classList.remove('playing');
        playBtn.setAttribute('aria-label', '播放');
      }
    }
  });

  // Update now playing bar icons
  const iconPlay = elements.playPauseBtn.querySelector('.icon-play');
  const iconPause = elements.playPauseBtn.querySelector('.icon-pause');

  if (iconPlay && iconPause) {
    iconPlay.classList.toggle('hidden', isPlaying);
    iconPause.classList.toggle('hidden', !isPlaying);
  }
}

// =====================================================
// Audio Playback
// =====================================================

function handleEpisodeAction(e) {
  e.stopPropagation();
  const action = e.currentTarget.dataset.action;
  const index = parseInt(e.currentTarget.dataset.index, 10);
  const episode = episodes[index];

  if (!episode) return;

  if (action === 'play') {
    playEpisode(episode);
  } else if (action === 'download') {
    downloadEpisode(episode);
  }
}

function playEpisode(episode) {
  // If same episode is playing, toggle pause
  if (currentEpisode?.id === episode.id) {
    togglePlayPause();
    return;
  }

  // Load new episode
  currentEpisode = episode;
  elements.audioPlayer.src = episode.audioUrl;
  elements.nowPlayingTitle.textContent = episode.title;
  elements.nowPlaying.classList.remove('hidden');

  // Play
  elements.audioPlayer.play()
    .then(() => {
      isPlaying = true;
      updatePlayingState();
    })
    .catch(error => {
      console.error('Playback failed:', error);
      // On mobile, might need user interaction first
      isPlaying = false;
      updatePlayingState();
    });
}

function togglePlayPause() {
  if (!currentEpisode) return;

  if (isPlaying) {
    elements.audioPlayer.pause();
    isPlaying = false;
  } else {
    elements.audioPlayer.play()
      .then(() => {
        isPlaying = true;
      })
      .catch(console.error);
  }
  updatePlayingState();
}

function seekRelative(seconds) {
  if (!currentEpisode) return;
  elements.audioPlayer.currentTime = Math.max(0,
    Math.min(elements.audioPlayer.duration, elements.audioPlayer.currentTime + seconds)
  );
}

function downloadEpisode(episode) {
  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = episode.audioUrl;
  link.download = `${episode.title}.mp3`;
  link.target = '_blank';

  // For cross-origin files, just open in new tab
  // The user can then long-press/right-click to save
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =====================================================
// Audio Event Handlers
// =====================================================

function setupAudioEvents() {
  const audio = elements.audioPlayer;

  audio.addEventListener('timeupdate', () => {
    elements.currentTime.textContent = formatTime(audio.currentTime);
    if (audio.duration) {
      elements.progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    elements.totalTime.textContent = formatTime(audio.duration);
    elements.progressBar.max = 100;
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayingState();
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayingState();
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayingState();
    // Optionally auto-play next episode
    // playNextEpisode();
  });

  audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    isPlaying = false;
    updatePlayingState();
  });
}

function setupControls() {
  // Play/Pause button
  elements.playPauseBtn.addEventListener('click', togglePlayPause);

  // Rewind/Forward buttons
  elements.rewindBtn.addEventListener('click', () => seekRelative(-15));
  elements.forwardBtn.addEventListener('click', () => seekRelative(15));

  // Progress bar seeking
  elements.progressBar.addEventListener('input', (e) => {
    if (!elements.audioPlayer.duration) return;
    const time = (e.target.value / 100) * elements.audioPlayer.duration;
    elements.audioPlayer.currentTime = time;
  });

  // Refresh button
  elements.refreshBtn.addEventListener('click', loadEpisodes);

  // Retry button
  elements.retryBtn.addEventListener('click', loadEpisodes);
}

// =====================================================
// Media Session API (for lock screen controls on mobile)
// =====================================================

function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.setActionHandler('play', togglePlayPause);
  navigator.mediaSession.setActionHandler('pause', togglePlayPause);
  navigator.mediaSession.setActionHandler('seekbackward', () => seekRelative(-15));
  navigator.mediaSession.setActionHandler('seekforward', () => seekRelative(15));

  // Update metadata when episode changes
  elements.audioPlayer.addEventListener('loadedmetadata', () => {
    if (!currentEpisode) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentEpisode.title,
      artist: '语音播客',
      album: currentEpisode.date || '',
      artwork: currentEpisode.thumbnail ? [
        { src: currentEpisode.thumbnail, sizes: '512x512', type: 'image/jpeg' }
      ] : [],
    });
  });
}

// =====================================================
// Initialization
// =====================================================

function init() {
  setupAudioEvents();
  setupControls();
  setupMediaSession();
  initTheme();
  initFeedSelector();
  loadEpisodes();
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
