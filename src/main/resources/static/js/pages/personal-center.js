/**
 * Personal Center Page Logic
 * Handles tab switching, sidebar toggling, and UI interactions.
 */

const PersonalCenter = {
    /**
     * Initialize the page
     */
    init() {
        console.log('Personal Center initialized');
        this.switchTab('dashboard');
        this.setupEventListeners();
    },

    /**
     * Setup any additional event listeners
     */
    setupEventListeners() {
        // Handle Sidebar Menu (My Account) - Auto close on mouse leave
        const myAccountGroup = document.getElementById('my-account-group');
        if (myAccountGroup) {
            myAccountGroup.addEventListener('mouseenter', () => {
                this.toggleMenu('my-account-sub', true);
            });
            myAccountGroup.addEventListener('mouseleave', () => {
                this.toggleMenu('my-account-sub', false);
            });
        }

        // Handle Sidebar Menu Toggling (Click as fallback)
        const toggleButtons = document.querySelectorAll('.toggle-menu-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                this.toggleMenu(targetId);
            });
        });

        // Handle Tab Switching
        const tabLinks = document.querySelectorAll('.tab-link');
        console.log('Found tab links:', tabLinks.length);
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                console.log('Switching to tab:', tabId);
                if (tabId) {
                    this.switchTab(tabId);
                }
            });
        });
    },

    /**
     * Toggle visibility of sidebar sub-menus
     * @param {string} id - The ID of the menu element
     * @param {boolean|null} forceState - Optional force open/close
     */
    toggleMenu(id, forceState = null) {
        const menu = document.getElementById(id);
        const arrow = document.getElementById('my-account-arrow');
        if (!menu) return;

        const shouldOpen = forceState !== null ? forceState : menu.classList.contains('hidden');

        if (shouldOpen) {
            menu.classList.remove('hidden');
            if (arrow) arrow.classList.add('rotate-180');
        } else {
            menu.classList.add('hidden');
            if (arrow) arrow.classList.remove('rotate-180');
        }
    },

    /**
     * Switch between different content tabs
     * @param {string} tabId - The ID of the tab to show (without 'tab-' prefix)
     */
    switchTab(tabId) {
        console.log('Executing switchTab for:', tabId);
        
        // 1. Hide all tab content sections
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.add('hidden');
        });

        // 2. Show the selected tab content
        const target = document.getElementById('tab-' + tabId);
        if (target) {
            target.classList.remove('hidden');
            // Trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // trigger reflow
            target.style.animation = '';
        } else {
            console.error('Target tab content not found: tab-' + tabId);
        }

        // 3. Update active state in the sidebar
        const links = document.querySelectorAll('.tab-link');
        links.forEach(link => {
            const dataTab = link.getAttribute('data-tab');
            if (dataTab === tabId) {
                link.classList.remove('text-on-surface-variant');
                link.classList.add('text-secondary', 'translate-x-1');
            } else {
                link.classList.add('text-on-surface-variant');
                link.classList.remove('text-secondary', 'translate-x-1');
            }
        });

        // 4. Reset sidebar active highlights if switching back to main dashboard
        if (tabId === 'dashboard') {
            links.forEach(link => {
                link.classList.add('text-on-surface-variant');
                link.classList.remove('text-secondary', 'translate-x-1');
            });
        }
    }
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PersonalCenter.init();
});
