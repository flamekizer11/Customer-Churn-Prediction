// Form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Form validation
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Predicting...';
        submitButton.disabled = true;
    });
    
    // Real-time validation feedback
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Auto-calculate total charges based on tenure and monthly charges
    const tenureInput = document.querySelector('input[name="tenure"]');
    const monthlyChargesInput = document.querySelector('input[name="monthly_charges"]');
    const totalChargesInput = document.querySelector('input[name="total_charges"]');
    
    function autoCalculateTotalCharges() {
        const tenure = parseFloat(tenureInput.value) || 0;
        const monthlyCharges = parseFloat(monthlyChargesInput.value) || 0;
        
        if (tenure > 0 && monthlyCharges > 0) {
            const estimatedTotal = (tenure * monthlyCharges).toFixed(2);
            if (!totalChargesInput.value || totalChargesInput.value == 0) {
                totalChargesInput.value = estimatedTotal;
                totalChargesInput.style.backgroundColor = '#e3f2fd';
                setTimeout(() => {
                    totalChargesInput.style.backgroundColor = '';
                }, 1000);
            }
        }
    }
    
    tenureInput.addEventListener('input', autoCalculateTotalCharges);
    monthlyChargesInput.addEventListener('input', autoCalculateTotalCharges);
    
    // Form validation function
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Custom validation rules
        const monthlyCharges = parseFloat(monthlyChargesInput.value);
        const totalCharges = parseFloat(totalChargesInput.value);
        
        if (monthlyCharges > 0 && totalCharges > 0 && totalCharges < monthlyCharges) {
            showFieldError(totalChargesInput, 'Total charges should be greater than monthly charges');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Individual field validation
    function validateField(field) {
        clearFieldError(field);
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        if (field.type === 'number') {
            const value = parseFloat(field.value);
            const min = parseFloat(field.getAttribute('min')) || 0;
            const max = parseFloat(field.getAttribute('max')) || Infinity;
            
            if (isNaN(value) || value < min || value > max) {
                showFieldError(field, `Please enter a valid number between ${min} and ${max}`);
                return false;
            }
        }
        
        showFieldSuccess(field);
        return true;
    }
    
    // Show field error
    function showFieldError(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        let errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }
    
    // Show field success
    function showFieldSuccess(field) {
        if (field.value.trim()) {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
        }
    }
    
    // Clear field error
    function clearFieldError(field) {
        field.classList.remove('is-invalid', 'is-valid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Smart form suggestions
    const internetServiceSelect = document.querySelector('select[name="internet_service"]');
    const internetDependentFields = [
        'online_security', 'online_backup', 'device_protection', 
        'tech_support', 'streaming_tv', 'streaming_movies'
    ];
    
    internetServiceSelect.addEventListener('change', function() {
        const hasInternet = this.value !== 'No';
        
        internetDependentFields.forEach(fieldName => {
            const field = document.querySelector(`select[name="${fieldName}"]`);
            if (field) {
                if (!hasInternet) {
                    field.value = 'No internet service';
                    field.style.backgroundColor = '#fff3cd';
                } else {
                    if (field.value === 'No internet service') {
                        field.value = '';
                    }
                    field.style.backgroundColor = '';
                }
            }
        });
    });
    
    // Phone service dependency
    const phoneServiceSelect = document.querySelector('select[name="phone_service"]');
    const multipleLinesSelect = document.querySelector('select[name="multiple_lines"]');
    
    phoneServiceSelect.addEventListener('change', function() {
        if (this.value === 'No') {
            multipleLinesSelect.value = 'No phone service';
            multipleLinesSelect.style.backgroundColor = '#fff3cd';
        } else {
            if (multipleLinesSelect.value === 'No phone service') {
                multipleLinesSelect.value = '';
            }
            multipleLinesSelect.style.backgroundColor = '';
        }
    });
    
    // Add smooth scrolling to form sections
    const formSections = document.querySelectorAll('.row');
    formSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add tooltips for complex fields
    const tooltips = {
        'tenure': 'Number of months the customer has stayed with the company',
        'monthly_charges': 'The amount charged to the customer monthly',
        'total_charges': 'The total amount charged to the customer'
    };
    
    Object.keys(tooltips).forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.setAttribute('title', tooltips[fieldName]);
            field.setAttribute('data-bs-toggle', 'tooltip');
        }
    });
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});