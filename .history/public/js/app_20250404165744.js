class VisaApplication {
    constructor() {
        this.currentStep = 1;
        this.formData = new FormData();
        
        this.initEventListeners();
        this.updateStepIndicator();
    }

    initEventListeners() {
        // Next step buttons
        document.querySelectorAll('[data-next]').forEach(btn => {
            btn.addEventListener('click', e => this.validateAndProceed(e));
        });

        // Previous step buttons
        document.querySelectorAll('[data-prev]').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Form submission
        document.getElementById('final-submit').addEventListener('click', e => this.submitApplication(e));
    }

    validateAndProceed(e) {
        const currentStepValid = this.validateCurrentStep();
        if (currentStepValid) {
            this.collectStepData();
            this.nextStep();
        }
    }

    collectStepData() {
        const form = document.querySelector(`[data-step="${this.currentStep}"] form`);
        new FormData(form).forEach((value, key) => {
            this.formData.append(key, value);
        });
    }

    nextStep() {
        this.currentStep++;
        this.updateStepUI();
    }

    prevStep() {
        this.currentStep--;
        this.updateStepUI();
    }

    updateStepUI() {
        document.querySelectorAll('.step-content').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');
        this.updateStepIndicator();
    }

    updateStepIndicator() {
        document.querySelectorAll('.step-indicator .step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });
    }

    async submitApplication(e) {
        e.preventDefault();
        
        // Add final step data
        const form = document.querySelector('[data-step="3"] form');
        new FormData(form).forEach((value, key) => {
            this.formData.append(key, value);
        });

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                body: this.formData
            });

            if (response.ok) {
                window.location.href = '/success';
            } else {
                this.showError('Submission failed. Please try again.');
            }
        } catch (error) {
            this.showError('Network error. Please check your connection.');
        }
    }

    validateCurrentStep() {
        // Add validation logic for each step
        return true;
    }

    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        document.querySelector('.container').prepend(errorEl);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => new VisaApplication());