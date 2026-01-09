// Sidebar Navigation & Search for Options Page
// Version managed in manifest.json

document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeSearch();
  initializeRangeInputs();
});

// Initialize sidebar navigation
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.settings-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = item.getAttribute('data-section');
      switchSection(sectionName);
    });
  });

  // Handle hash navigation
  if (window.location.hash) {
    const sectionName = window.location.hash.substring(1);
    switchSection(sectionName);
  }
}

// Switch between sections
function switchSection(sectionName) {
  // Update nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-section') === sectionName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update sections
  const sections = document.querySelectorAll('.settings-section');
  sections.forEach(section => {
    if (section.getAttribute('data-section-content') === sectionName) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Update page title
  const titleMap = {
    'general': 'General Settings',
    'display': 'Display Settings',
    'features': 'Features',
    'advanced': 'Advanced Settings',
    'about': 'About'
  };

  const contentTitle = document.querySelector('.content-title');
  if (contentTitle && titleMap[sectionName]) {
    contentTitle.textContent = titleMap[sectionName];
  }

  // Update URL hash
  window.location.hash = sectionName;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById('searchSettings');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    performSearch(searchTerm);
  });
}

// Perform search across all settings
function performSearch(searchTerm) {
  const allSettingItems = document.querySelectorAll('.setting-item');
  const allSections = document.querySelectorAll('.settings-section');
  const allGroups = document.querySelectorAll('.section-group');

  if (!searchTerm) {
    // Reset: remove search highlighting
    allSettingItems.forEach(item => {
      item.classList.remove('search-match', 'search-hidden');
    });
    allGroups.forEach(group => group.style.display = '');
    return;
  }

  // Search and highlight
  let hasMatches = false;
  allSettingItems.forEach(item => {
    const label = item.querySelector('.setting-label')?.textContent.toLowerCase() || '';
    const hint = item.querySelector('.setting-hint')?.textContent.toLowerCase() || '';
    const isMatch = label.includes(searchTerm) || hint.includes(searchTerm);

    if (isMatch) {
      item.classList.add('search-match');
      item.classList.remove('search-hidden');
      hasMatches = true;

      // Show parent group and section
      const parentGroup = item.closest('.section-group');
      const parentSection = item.closest('.settings-section');
      if (parentGroup) parentGroup.style.display = 'block';
      if (parentSection) parentSection.classList.add('active');
    } else {
      item.classList.remove('search-match');
      item.classList.add('search-hidden');
    }
  });

  // Hide groups with no matches
  allGroups.forEach(group => {
    const visibleItems = group.querySelectorAll('.setting-item:not(.search-hidden)');
    if (visibleItems.length === 0) {
      group.style.display = 'none';
    }
  });

  // Show all sections when searching
  if (searchTerm) {
    allSections.forEach(section => section.classList.add('active'));
  }
}

// Initialize range input value displays
function initializeRangeInputs() {
  const rangeInputs = document.querySelectorAll('.range-input');

  rangeInputs.forEach(input => {
    const valueDisplay = document.getElementById(input.id + 'Value');
    if (valueDisplay) {
      input.addEventListener('input', () => {
        valueDisplay.textContent = input.value;
      });
    }
  });
}

// Export for use in options.js
window.switchSection = switchSection;
