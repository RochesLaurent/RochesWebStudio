/**
 * RochesWebStudio - JavaScript Interactions
 * Gestion de la navigation, animations, formulaire et tooltips
 */

// =================================
// Utilitaires
// =================================

/**
 * Debounce function pour optimiser les performances
 */
function debounce(func, wait) {
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

/**
 * Throttle function pour limiter la fréquence d'exécution
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// =================================
// Navigation Mobile
// =================================

class MobileNavigation {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.navToggle || !this.navMenu) return;
        
        // Toggle du menu mobile
        this.navToggle.addEventListener('click', () => this.toggleMenu());
        
        // Fermer le menu lors du clic sur un lien
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Fermer le menu avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Fermer le menu lors du clic à l'extérieur
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.nav-container')) {
                this.closeMenu();
            }
        });
        
        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth >= 768 && this.isOpen) {
                this.closeMenu();
            }
        }, 250));
    }
    
    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }
    
    openMenu() {
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        
        // Prévenir le scroll du body
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        
        // Restaurer le scroll du body
        document.body.style.overflow = '';
    }
}

// =================================
// Smooth Scroll pour les ancres
// =================================

class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Gérer tous les liens d'ancres
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Ignorer les liens vides
                if (href === '#' || href === '#!') {
                    e.preventDefault();
                    return;
                }
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    this.scrollToElement(target);
                }
            });
        });
    }
    
    scrollToElement(element) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// =================================
// Animations au scroll (Intersection Observer)
// =================================

class ScrollAnimations {
    constructor() {
        this.elementsToAnimate = document.querySelectorAll('.fade-in, .portfolio-item, .service-item, .pricing-card');
        this.init();
    }
    
    init() {
        // Ajouter la classe fade-in aux éléments qui n'en ont pas
        document.querySelectorAll('.portfolio-item, .service-item, .pricing-card').forEach((el, index) => {
            if (!el.classList.contains('fade-in')) {
                el.classList.add('fade-in');
                // Ajouter un délai pour un effet en cascade
                if (index < 4) {
                    el.classList.add(`fade-in-delay-${index + 1}`);
                }
            }
        });
        
        // Créer l'observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionnel : arrêter d'observer l'élément une fois animé
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observer tous les éléments
        this.elementsToAnimate.forEach(el => {
            this.observer.observe(el);
        });
    }
}

// =================================
// Tooltip Interactif
// =================================

class Tooltip {
    constructor() {
        this.tooltip = document.getElementById('maintenance-tooltip');
        this.triggers = document.querySelectorAll('[data-tooltip]');
        this.isVisible = false;
        this.currentTrigger = null;
        
        this.init();
    }
    
    init() {
        if (!this.tooltip) return;
        
        this.triggers.forEach(trigger => {
            // Événements pour desktop (hover)
            trigger.addEventListener('mouseenter', (e) => this.showTooltip(e.target));
            trigger.addEventListener('mouseleave', () => this.hideTooltip());
            
            // Événements pour mobile/tablette (click)
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.isVisible && this.currentTrigger === trigger) {
                    this.hideTooltip();
                } else {
                    this.showTooltip(trigger);
                }
            });
            
            // Accessibilité clavier
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showTooltip(trigger);
                }
            });
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideTooltip();
            }
        });
        
        // Fermer en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (this.isVisible && !e.target.closest('.tooltip') && !e.target.closest('[data-tooltip]')) {
                this.hideTooltip();
            }
        });
        
        // Repositionner lors du scroll/resize
        window.addEventListener('scroll', throttle(() => {
            if (this.isVisible) {
                this.positionTooltip();
            }
        }, 100));
        
        window.addEventListener('resize', debounce(() => {
            if (this.isVisible) {
                this.positionTooltip();
            }
        }, 250));
    }
    
    showTooltip(trigger) {
        this.currentTrigger = trigger;
        this.tooltip.classList.add('show');
        this.tooltip.setAttribute('aria-hidden', 'false');
        this.isVisible = true;
        
        // Positionner le tooltip
        this.positionTooltip();
        
        // Focus management pour l'accessibilité
        this.tooltip.focus();
    }
    
    hideTooltip() {
        this.tooltip.classList.remove('show');
        this.tooltip.setAttribute('aria-hidden', 'true');
        this.isVisible = false;
        this.currentTrigger = null;
        
        // Restaurer le focus
        if (this.currentTrigger) {
            this.currentTrigger.focus();
        }
    }
    
    positionTooltip() {
        if (!this.currentTrigger) return;
        
        const triggerRect = this.currentTrigger.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        let top = triggerRect.top - tooltipRect.height - 10;
        
        // Ajustements pour éviter les débordements
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > windowWidth - 10) {
            left = windowWidth - tooltipRect.width - 10;
        }
        
        // Si pas assez de place en haut, afficher en bas
        if (top < 10) {
            top = triggerRect.bottom + 10;
        }
        
        // Si toujours pas de place, centrer verticalement
        if (top + tooltipRect.height > windowHeight - 10) {
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        }
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }
}

// =================================
// Validation et soumission du formulaire
// =================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            projectType: document.getElementById('project-type'),
            budget: document.getElementById('budget'),
            message: document.getElementById('message')
        };
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // Validation en temps réel
        Object.values(this.fields).forEach(field => {
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', debounce(() => this.validateField(field), 300));
            }
        });
        
        // Soumission du formulaire
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Règles de validation
        switch (fieldName) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le nom est obligatoire.';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Le nom doit contenir au moins 2 caractères.';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'L\'email est obligatoire.';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Veuillez saisir un email valide.';
                }
                break;
                
            case 'message':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Le message est obligatoire.';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Le message doit contenir au moins 10 caractères.';
                }
                break;
        }
        
        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }
    
    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        
        if (message) {
            field.classList.add('error');
            field.classList.remove('success');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        } else {
            field.classList.remove('error');
            field.classList.add('success');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }
    }
    
    validateForm() {
        const requiredFields = [this.fields.name, this.fields.email, this.fields.message];
        let isFormValid = true;
        
        requiredFields.forEach(field => {
            if (field && !this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Valider le formulaire
        if (!this.validateForm()) {
            // Faire défiler vers la première erreur
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Afficher l'état de chargement
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        submitButton.textContent = 'Envoi en cours...';
        
        try {
            // Collecter les données du formulaire
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Ici, vous pouvez implémenter l'envoi vers votre backend
            // Pour l'instant, on simule un envoi
            await this.submitToBackend(data);
            
            // Succès
            this.showSuccessMessage();
            this.form.reset();
            
            // Nettoyer les classes de validation
            Object.values(this.fields).forEach(field => {
                if (field) {
                    field.classList.remove('error', 'success');
                    const errorElement = document.getElementById(`${field.name}-error`);
                    if (errorElement) {
                        errorElement.classList.remove('show');
                    }
                }
            });
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            this.showErrorMessage('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
        } finally {
            // Restaurer le bouton
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
    
    async submitToBackend(data) {
        // Simulation d'un appel API
        // Remplacez cette fonction par votre logique d'envoi
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simuler un succès (vous pouvez simuler une erreur en changeant true par false)
                if (true) {
                    console.log('Données du formulaire:', data);
                    resolve({ success: true });
                } else {
                    reject(new Error('Erreur simulée'));
                }
            }, 2000);
        });
    }
    
    showSuccessMessage() {
        // Créer et afficher un message de succès
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div style="
                background: var(--color-success);
                color: white;
                padding: var(--space-4);
                border-radius: var(--border-radius);
                margin-bottom: var(--space-6);
                text-align: center;
                font-weight: var(--font-weight-medium);
            ">
                ✓ Votre message a été envoyé avec succès ! Je vous répondrai sous 24h.
            </div>
        `;
        
        this.form.insertBefore(message.firstElementChild, this.form.firstChild);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            const successMsg = this.form.querySelector('.success-message');
            if (successMsg) {
                successMsg.remove();
            }
        }, 5000);
        
        // Scroll vers le message
        message.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    showErrorMessage(text) {
        // Créer et afficher un message d'erreur
        const message = document.createElement('div');
        message.className = 'error-message';
        message.innerHTML = `
            <div style="
                background: var(--color-error);
                color: white;
                padding: var(--space-4);
                border-radius: var(--border-radius);
                margin-bottom: var(--space-6);
                text-align: center;
                font-weight: var(--font-weight-medium);
            ">
                ⚠ ${text}
            </div>
        `;
        
        this.form.insertBefore(message.firstElementChild, this.form.firstChild);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            const errorMsg = this.form.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }, 5000);
    }
}

// =================================
// Header fixe avec effet de scroll
// =================================

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateHeader();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });
    }
    
    updateHeader() {
        const currentScrollY = window.scrollY;
        
        // Ajouter/supprimer une classe pour les styles au scroll
        if (currentScrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        
        this.lastScrollY = currentScrollY;
    }
}

// =================================
// Initialisation au chargement du DOM
// =================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser tous les modules
    new MobileNavigation();
    new SmoothScroll();
    new ScrollAnimations();
    new Tooltip();
    new ContactForm();
    new HeaderScroll();
    
    // Message de debug (à supprimer en production)
    console.log('🚀 RochesWebStudio - Site initialisé avec succès');
});

// =================================
// Gestion des erreurs globales
// =================================

window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
    // En production, vous pourriez envoyer ces erreurs à un service de monitoring
});

// =================================
// Performance monitoring (optionnel)
// =================================

// Mesurer les performances de chargement
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            console.log(`⚡ Page chargée en ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }
    }
});