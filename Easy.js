// EasyCSS Enhanced Framework JavaScript v2.0
// Comprehensive interactive components and utilities with RTL support

class EasyCSSEnhanced {
    constructor() {
        this.components = new Map();
        this.observers = new Map();
        this.theme = localStorage.getItem('easycss-theme') || 'light';
        this.direction = document.documentElement.dir || 'ltr';
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        this.initTheme();
        this.initModals();
        this.initDropdowns();
        this.initTabs();
        this.initAccordions();
        this.initTooltips();
        this.initToasts();
        this.initNavbarToggle();
        this.initSmoothScroll();
        this.initAnimationTriggers();
        this.initLoadingStates();
        this.initAlertClose();
        this.initLanguageToggle();
        this.initAccessibility();
        this.initPerformanceOptimizations();
        
        // Emit ready event
        this.emit('easycss:ready', { framework: this });
    }

    // Enhanced Theme Management
    initTheme() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon(this.theme);

        // Theme toggle handlers
        const toggles = document.querySelectorAll('[data-theme-toggle]');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleTheme());
        });

        // System preference detection
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('easycss-theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('easycss-theme', theme);
        this.updateThemeIcon(theme);
        this.emit('easycss:theme-changed', { theme });
    }

    updateThemeIcon(theme) {
        const icons = document.querySelectorAll('.theme-icon');
        icons.forEach(icon => {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
    }

    // Enhanced Modal Component
    initModals() {
        const modals = document.querySelectorAll('[data-modal]');
        const triggers = document.querySelectorAll('[data-modal-trigger]');

        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal-trigger');
                this.openModal(modalId);
            });
        });

        modals.forEach(modal => {
            const closeButtons = modal.querySelectorAll('[data-modal-close]');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => this.closeModal(modal));
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal(modal);
                }
            });

            // Close on backdrop click
            const backdrop = modal.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeModal(modal));
            }
        });
    }

    openModal(modalId) {
        const modal = document.querySelector(`[data-modal="${modalId}"]`);
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length) {
            focusableElements[0].focus();
        }

        // Trap focus within modal
        this.trapFocus(modal, focusableElements);
        
        this.emit('easycss:modal-opened', { modal, modalId });
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.emit('easycss:modal-closed', { modal });
    }

    trapFocus(container, focusableElements) {
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);
        
        // Remove listener when modal closes
        const removeListener = () => {
            container.removeEventListener('keydown', handleTabKey);
        };
        
        this.on('easycss:modal-closed', removeListener);
    }

    // Enhanced Dropdown Component
    initDropdowns() {
        const dropdowns = document.querySelectorAll('[data-dropdown]');

        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('[data-dropdown-trigger]');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!trigger || !menu) return;

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(dropdown);
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    this.closeDropdown(dropdown);
                }
            });

            // Enhanced keyboard navigation
            dropdown.addEventListener('keydown', (e) => {
                this.handleDropdownKeyboard(e, dropdown);
            });

            // Auto-positioning
            this.positionDropdown(dropdown, menu);
        });
    }

    toggleDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');
        
        // Close all other dropdowns
        document.querySelectorAll('[data-dropdown].active').forEach(d => {
            if (d !== dropdown) this.closeDropdown(d);
        });

        if (isActive) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        dropdown.classList.add('active');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            this.positionDropdown(dropdown, menu);
        }
        this.emit('easycss:dropdown-opened', { dropdown });
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
        this.emit('easycss:dropdown-closed', { dropdown });
    }

    positionDropdown(dropdown, menu) {
        const rect = dropdown.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Reset classes
        menu.classList.remove('dropdown-menu-up', 'dropdown-menu-right');

        // Check if dropdown should open upward
        if (rect.bottom + menuRect.height > viewportHeight && rect.top > menuRect.height) {
            menu.classList.add('dropdown-menu-up');
        }

        // Check if dropdown should align to the right
        if (rect.left + menuRect.width > viewportWidth && rect.right > menuRect.width) {
            menu.classList.add('dropdown-menu-right');
        }
    }

    handleDropdownKeyboard(e, dropdown) {
        const items = dropdown.querySelectorAll('.dropdown-item:not(:disabled)');
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);

        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.closeDropdown(dropdown);
                dropdown.querySelector('[data-dropdown-trigger]').focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                items[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                items[prevIndex].focus();
                break;
            case 'Enter':
            case ' ':
                if (document.activeElement.classList.contains('dropdown-item')) {
                    e.preventDefault();
                    document.activeElement.click();
                }
                break;
            case 'Home':
                e.preventDefault();
                items[0].focus();
                break;
            case 'End':
                e.preventDefault();
                items[items.length - 1].focus();
                break;
        }
    }

    // Enhanced Tabs Component
    initTabs() {
        const tabGroups = document.querySelectorAll('[data-tabs]');

        tabGroups.forEach(tabGroup => {
            const triggers = tabGroup.querySelectorAll('[data-tab-trigger]');
            const panels = tabGroup.querySelectorAll('[data-tab-panel]');

            triggers.forEach((trigger, index) => {
                trigger.addEventListener('click', () => {
                    const targetId = trigger.getAttribute('data-tab-trigger');
                    this.switchTab(tabGroup, targetId, index);
                });

                // Keyboard navigation
                trigger.addEventListener('keydown', (e) => {
                    this.handleTabKeyboard(e, triggers, index);
                });
            });
        });
    }

    switchTab(tabGroup, targetId, activeIndex) {
        const triggers = tabGroup.querySelectorAll('[data-tab-trigger]');
        const panels = tabGroup.querySelectorAll('[data-tab-panel]');

        // Remove active class from all triggers and panels
        triggers.forEach(trigger => trigger.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        // Add active class to target trigger and panel
        const targetTrigger = tabGroup.querySelector(`[data-tab-trigger="${targetId}"]`);
        const targetPanel = tabGroup.querySelector(`[data-tab-panel="${targetId}"]`);

        if (targetTrigger && targetPanel) {
            targetTrigger.classList.add('active');
            targetPanel.classList.add('active');
            
            // Update ARIA attributes
            triggers.forEach((trigger, index) => {
                trigger.setAttribute('aria-selected', index === activeIndex);
                trigger.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
            });

            panels.forEach(panel => {
                panel.setAttribute('aria-hidden', !panel.classList.contains('active'));
            });

            this.emit('easycss:tab-changed', { tabGroup, targetId, activeIndex });
        }
    }

    handleTabKeyboard(e, triggers, currentIndex) {
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = triggers.length - 1;
                break;
            default:
                return;
        }

        triggers[newIndex].focus();
        triggers[newIndex].click();
    }

    // Enhanced Accordion Component
    initAccordions() {
        const accordions = document.querySelectorAll('[data-accordion]');

        accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('.accordion-item');

            items.forEach((item, index) => {
                const trigger = item.querySelector('[data-accordion-trigger]');
                const content = item.querySelector('.accordion-content');
                const icon = item.querySelector('.accordion-icon');

                if (!trigger || !content) return;

                // Set initial ARIA attributes
                const contentId = `accordion-content-${Date.now()}-${index}`;
                content.id = contentId;
                trigger.setAttribute('aria-controls', contentId);
                trigger.setAttribute('aria-expanded', item.classList.contains('active'));

                trigger.addEventListener('click', () => {
                    this.toggleAccordionItem(item, icon, trigger, content);
                });

                // Keyboard navigation
                trigger.addEventListener('keydown', (e) => {
                    this.handleAccordionKeyboard(e, accordion, items, index);
                });
            });
        });
    }

    toggleAccordionItem(item, icon, trigger, content) {
        const isActive = item.classList.contains('active');
        
        if (isActive) {
            item.classList.remove('active');
            if (icon) icon.textContent = '+';
            trigger.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');
        } else {
            item.classList.add('active');
            if (icon) icon.textContent = '−';
            trigger.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');
        }

        this.emit('easycss:accordion-toggled', { item, isActive: !isActive });
    }

    handleAccordionKeyboard(e, accordion, items, currentIndex) {
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = items.length - 1;
                break;
            default:
                return;
        }

        const newTrigger = items[newIndex].querySelector('[data-accordion-trigger]');
        if (newTrigger) {
            newTrigger.focus();
        }
    }

    // Enhanced Tooltip Component
    initTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');

        tooltips.forEach(tooltip => {
            const content = tooltip.getAttribute('data-tooltip');
            let tooltipElement = tooltip.querySelector('.tooltip-content');

            if (!tooltipElement && content) {
                tooltipElement = document.createElement('div');
                tooltipElement.className = 'tooltip-content';
                tooltipElement.textContent = content;
                tooltipElement.setAttribute('role', 'tooltip');
                tooltip.appendChild(tooltipElement);
            }

            // Enhanced positioning
            tooltip.addEventListener('mouseenter', () => {
                this.positionTooltip(tooltip, tooltipElement);
            });

            // Keyboard support
            tooltip.addEventListener('focus', () => {
                this.positionTooltip(tooltip, tooltipElement);
            });
        });
    }

    positionTooltip(tooltip, tooltipElement) {
        if (!tooltipElement) return;

        const rect = tooltip.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Reset position classes
        tooltip.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right');

        // Determine best position
        const spaceTop = rect.top;
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;

        if (spaceTop > tooltipRect.height + 10) {
            tooltip.classList.add('tooltip-top');
        } else if (spaceBottom > tooltipRect.height + 10) {
            tooltip.classList.add('tooltip-bottom');
        } else if (spaceRight > tooltipRect.width + 10) {
            tooltip.classList.add('tooltip-right');
        } else if (spaceLeft > tooltipRect.width + 10) {
            tooltip.classList.add('tooltip-left');
        } else {
            tooltip.classList.add('tooltip-top'); // Default fallback
        }
    }

    // Enhanced Toast Component
    initToasts() {
        const triggers = document.querySelectorAll('[data-toast-trigger]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const config = JSON.parse(trigger.getAttribute('data-toast-trigger'));
                this.showToast(config);
            });
        });

        // Create toast container if it doesn't exist
        if (!document.querySelector('[data-toast-container]')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('data-toast-container', '');
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
    }

    showToast(config) {
        const { type = 'info', title, message, duration = 5000, persistent = false } = config;
        const container = document.querySelector('[data-toast-container]');
        
        if (!container) return;

        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        
        const iconMap = {
            success: '✅',
            warning: '⚠️',
            danger: '❌',
            info: 'ℹ️'
        };

        const content = `
            <div class="toast-icon">${iconMap[type] || 'ℹ️'}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;
        
        toast.innerHTML = content;
        container.appendChild(toast);

        // Show toast with animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Close button functionality
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            this.hideToast(toast);
        });

        // Auto dismiss (unless persistent)
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.hideToast(toast);
            }, duration);
        }

        this.emit('easycss:toast-shown', { toast, config });
        return toast;
    }

    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
                this.emit('easycss:toast-hidden', { toast });
            }
        }, 300);
    }

    // Enhanced Navbar Toggle
    initNavbarToggle() {
        const toggles = document.querySelectorAll('[data-navbar-toggle]');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const navbar = toggle.closest('.navbar');
                const nav = navbar.querySelector('.navbar-nav');
                
                if (nav) {
                    const isActive = nav.classList.contains('active');
                    nav.classList.toggle('active');
                    toggle.classList.toggle('active');
                    
                    // Update ARIA attributes
                    toggle.setAttribute('aria-expanded', !isActive);
                    nav.setAttribute('aria-hidden', isActive);
                    
                    this.emit('easycss:navbar-toggled', { navbar, nav, isActive: !isActive });
                }
            });
        });
    }

    // Enhanced Smooth Scroll
    initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80; // Account for fixed headers
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.addEventListener('blur', () => {
                        target.removeAttribute('tabindex');
                    }, { once: true });

                    this.emit('easycss:smooth-scroll', { target, link });
                }
            });
        });
    }

    // Enhanced Animation Triggers
    initAnimationTriggers() {
        if (!('IntersectionObserver' in window)) return;

        const animatedElements = document.querySelectorAll('[class*="animate-"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    this.emit('easycss:animation-triggered', { element: entry.target });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            // Respect reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }
            
            element.style.animationPlayState = 'paused';
            observer.observe(element);
        });

        this.observers.set('animations', observer);
    }

    // Enhanced Loading States
    initLoadingStates() {
        // Loading button demo
        const loadingButtons = document.querySelectorAll('[data-loading-btn]');
        loadingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.add('btn-loading');
                setTimeout(() => {
                    btn.classList.remove('btn-loading');
                }, 3000);
            });
        });

        // Loading demo trigger
        const loadingDemo = document.querySelector('[data-loading-demo]');
        if (loadingDemo) {
            loadingDemo.addEventListener('click', () => {
                this.showToast({
                    type: 'info',
                    title: 'Loading Demo',
                    message: 'Check out the various loading states throughout the page!',
                    duration: 3000
                });
            });
        }
    }

    // Alert Close Functionality
    initAlertClose() {
        const closeButtons = document.querySelectorAll('[data-alert-close]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const alert = button.closest('.alert');
                if (alert) {
                    alert.style.opacity = '0';
                    alert.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        alert.remove();
                    }, 300);
                }
            });
        });
    }

    // Language Toggle (RTL/LTR)
    initLanguageToggle() {
        const langButtons = document.querySelectorAll('[data-lang]');
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const direction = button.getAttribute('data-lang');
                document.documentElement.dir = direction;
                this.direction = direction;
                
                // Update text content based on direction
                if (direction === 'rtl') {
                    this.showToast({
                        type: 'success',
                        title: 'تم تغيير الاتجاه',
                        message: 'تم تغيير اتجاه النص إلى العربية بنجاح',
                        duration: 3000
                    });
                } else {
                    this.showToast({
                        type: 'success',
                        title: 'Direction Changed',
                        message: 'Text direction changed to left-to-right successfully',
                        duration: 3000
                    });
                }
                
                this.emit('easycss:direction-changed', { direction });
            });
        });
    }

    // Enhanced Accessibility Features
    initAccessibility() {
        // Skip to main content link
        this.createSkipLink();
        
        // Enhanced focus management
        this.initFocusManagement();
        
        // Keyboard navigation improvements
        this.initKeyboardNavigation();
        
        // Screen reader announcements
        this.initScreenReaderSupport();
    }

    createSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    initFocusManagement() {
        // Visible focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    initKeyboardNavigation() {
        // Enhanced keyboard support for interactive elements
        document.addEventListener('keydown', (e) => {
            // Global keyboard shortcuts
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const navbar = document.querySelector('.navbar-nav');
                if (navbar) {
                    const toggle = document.querySelector('[data-navbar-toggle]');
                    if (toggle) toggle.click();
                }
            }
        });
    }

    initScreenReaderSupport() {
        // Live region for dynamic content announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Performance Optimizations
    initPerformanceOptimizations() {
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Intersection Observer for performance
        this.initLazyLoading();
        
        // Prefetch important resources
        this.prefetchResources();
    }

    handleResize() {
        // Reposition dropdowns and tooltips
        document.querySelectorAll('[data-dropdown].active').forEach(dropdown => {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                this.positionDropdown(dropdown, menu);
            }
        });

        this.emit('easycss:resize', { width: window.innerWidth, height: window.innerHeight });
    }

    initLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const src = element.getAttribute('data-lazy');
                    
                    if (element.tagName === 'IMG') {
                        element.src = src;
                    } else {
                        element.style.backgroundImage = `url(${src})`;
                    }
                    
                    element.removeAttribute('data-lazy');
                    lazyObserver.unobserve(element);
                }
            });
        });

        lazyElements.forEach(element => {
            lazyObserver.observe(element);
        });

        this.observers.set('lazy', lazyObserver);
    }

    prefetchResources() {
        // Prefetch critical resources
        const criticalResources = [
            // Add URLs of critical resources here
        ];

        criticalResources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // Utility Methods
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Enhanced Event System
    on(event, callback) {
        document.addEventListener(event, callback);
        return this;
    }

    off(event, callback) {
        document.removeEventListener(event, callback);
        return this;
    }

    emit(event, data = {}) {
        const customEvent = new CustomEvent(event, { 
            detail: { ...data, timestamp: Date.now() } 
        });
        document.dispatchEvent(customEvent);
        return this;
    }

    // Component Management
    registerComponent(name, component) {
        this.components.set(name, component);
        return this;
    }

    getComponent(name) {
        return this.components.get(name);
    }

    // Cleanup
    destroy() {
        // Clean up observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // Clean up components
        this.components.clear();

        // Remove event listeners
        // (In a real implementation, you'd track and remove all listeners)
        
        this.emit('easycss:destroyed');
    }

    // Public API Methods
    showModal(modalId) {
        return this.openModal(modalId);
    }

    hideModal(modal) {
        return this.closeModal(modal);
    }

    showDropdown(dropdown) {
        return this.openDropdown(dropdown);
    }

    hideDropdown(dropdown) {
        return this.closeDropdown(dropdown);
    }

    notify(config) {
        return this.showToast(config);
    }

    setDirection(direction) {
        document.documentElement.dir = direction;
        this.direction = direction;
        this.emit('easycss:direction-changed', { direction });
        return this;
    }

    getTheme() {
        return this.theme;
    }

    getDirection() {
        return this.direction;
    }

    // Version and info
    static get version() {
        return '2.0.0';
    }

    static get info() {
        return {
            name: 'EasyCSS Enhanced',
            version: this.version,
            author: 'EasyCSS Team',
            description: 'A comprehensive utility-first CSS framework with enhanced features',
            features: [
                'Utility-first approach',
                'Interactive JavaScript components',
                'RTL language support',
                'Advanced dark mode',
                'Beautiful animations',
                'Accessibility-first design',
                'Performance optimized',
                'Modern CSS features'
            ]
        };
    }
}

// Initialize EasyCSS Enhanced when the script loads
const easyCSSEnhanced = new EasyCSSEnhanced();

// Make EasyCSS globally available
window.EasyCSSEnhanced = EasyCSSEnhanced;
window.easyCSSEnhanced = easyCSSEnhanced;

// Export utilities for convenience
window.showToast = (config) => easyCSSEnhanced.showToast(config);
window.showModal = (modalId) => easyCSSEnhanced.openModal(modalId);
window.hideModal = (modal) => easyCSSEnhanced.closeModal(modal);
window.toggleTheme = () => easyCSSEnhanced.toggleTheme();
window.setTheme = (theme) => easyCSSEnhanced.setTheme(theme);
window.setDirection = (direction) => easyCSSEnhanced.setDirection(direction);

// Console welcome message
console.log(`
🎨 EasyCSS Enhanced v${EasyCSSEnhanced.version} loaded successfully!

API:
- easyCSSEnhanced.showToast(config)
- easyCSSEnhanced.showModal(id)
- easyCSSEnhanced.toggleTheme()
- easyCSSEnhanced.setDirection('rtl'|'ltr')

Events:
- easycss:ready
- easycss:theme-changed
- easycss:modal-opened
- easycss:toast-shown

Happy coding! 🚀
`);
