/* -------------------------------------------------------------
   PulseAuth Interactive Logic File
   Handles: Form transitions, visibility, validation & submission toasts
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');
    const tabIndicator = document.getElementById('tab-slider-indicator');
    const formsWrapper = document.getElementById('forms-slider-wrapper');
    
    const loginForm = document.getElementById('login-form-element');
    const signupForm = document.getElementById('signup-form-element');
    
    const loginEmail = document.getElementById('login-email-field');
    const loginPassword = document.getElementById('login-password-field');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    
    const signupName = document.getElementById('signup-name-field');
    const signupEmail = document.getElementById('signup-email-field');
    const signupPassword = document.getElementById('signup-password-field');
    const signupTerms = document.getElementById('signup-terms-checkbox');
    const signupSubmitBtn = document.getElementById('signup-submit-btn');
    
    const strengthFill = document.getElementById('strength-fill');
    const strengthLabel = document.getElementById('strength-label');
    
    const toast = document.getElementById('toast-notification');
    const toastMsgText = document.getElementById('toast-msg-text');
    
    // --- 1. Form Switching Logic ---
    const switchToLogin = () => {
        tabLoginBtn.classList.add('active');
        tabSignupBtn.classList.remove('active');
        tabIndicator.style.transform = 'translateX(0)';
        formsWrapper.style.transform = 'translateX(0%)';
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    };

    const switchToSignup = () => {
        tabLoginBtn.classList.remove('active');
        tabSignupBtn.classList.add('active');
        tabIndicator.style.transform = 'translateX(100%)';
        formsWrapper.style.transform = 'translateX(-50%)';
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    };

    tabLoginBtn.addEventListener('click', switchToLogin);
    tabSignupBtn.addEventListener('click', switchToSignup);

    // --- 2. Password Visibility Toggle ---
    const setupPasswordToggle = (toggleBtnId, inputFieldId) => {
        const toggleBtn = document.getElementById(toggleBtnId);
        const inputField = document.getElementById(inputFieldId);
        
        if (!toggleBtn || !inputField) return;

        const eyeOpen = toggleBtn.querySelector('.eye-open');
        const eyeClosed = toggleBtn.querySelector('.eye-closed');

        toggleBtn.addEventListener('click', () => {
            const isPassword = inputField.type === 'password';
            inputField.type = isPassword ? 'text' : 'password';
            
            if (isPassword) {
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
            // Keep focus on input after toggling
            inputField.focus();
        });
    };

    setupPasswordToggle('login-password-toggle-btn', 'login-password-field');
    setupPasswordToggle('signup-password-toggle-btn', 'signup-password-field');

    // --- 3. Notification Toast System ---
    let toastTimeout;
    const showToast = (message, type = 'success') => {
        // Clear existing timeouts
        clearTimeout(toastTimeout);
        
        toast.className = 'toast'; // Reset classes
        toast.classList.add(type, 'show');
        toastMsgText.textContent = message;

        // Auto hide after 4 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    };

    // --- 4. Validation Helpers ---
    const setStatus = (inputField, status, errorMsg = '') => {
        const group = inputField.closest('.input-group');
        const errorLabel = group.querySelector('.error-msg');
        
        if (status === 'success') {
            group.classList.remove('error');
            group.classList.add('success');
            if (errorLabel) errorLabel.textContent = '';
        } else if (status === 'error') {
            group.classList.remove('success');
            group.classList.add('error');
            if (errorLabel) errorLabel.textContent = errorMsg;
        } else {
            group.classList.remove('success', 'error');
            if (errorLabel) errorLabel.textContent = '';
        }
    };

    const validateEmailFormat = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    // Real-Time Login Validations
    loginEmail.addEventListener('input', () => {
        const value = loginEmail.value.trim();
        if (value === '') {
            setStatus(loginEmail, 'clear');
        } else if (validateEmailFormat(value)) {
            setStatus(loginEmail, 'success');
        } else {
            setStatus(loginEmail, 'error', 'Please enter a valid email address.');
        }
    });

    loginPassword.addEventListener('input', () => {
        const value = loginPassword.value;
        if (value.length > 0) {
            setStatus(loginPassword, 'success');
        } else {
            setStatus(loginPassword, 'clear');
        }
    });

    // Real-Time Signup Validations
    signupName.addEventListener('input', () => {
        const value = signupName.value.trim();
        if (value === '') {
            setStatus(signupName, 'clear');
        } else if (value.length >= 2) {
            setStatus(signupName, 'success');
        } else {
            setStatus(signupName, 'error', 'Name must be at least 2 characters.');
        }
    });

    signupEmail.addEventListener('input', () => {
        const value = signupEmail.value.trim();
        if (value === '') {
            setStatus(signupEmail, 'clear');
        } else if (validateEmailFormat(value)) {
            setStatus(signupEmail, 'success');
        } else {
            setStatus(signupEmail, 'error', 'Please enter a valid email address.');
        }
    });

    // Password Strength Meter Check
    signupPassword.addEventListener('input', () => {
        const value = signupPassword.value;
        if (value === '') {
            setStatus(signupPassword, 'clear');
            strengthFill.style.width = '0%';
            strengthFill.style.backgroundColor = 'var(--text-muted)';
            strengthLabel.textContent = 'Password strength';
            return;
        }

        let score = 0;
        
        // 1. Length check
        if (value.length >= 8) score++;
        // 2. Contains numbers
        if (/\d/.test(value)) score++;
        // 3. Contains mixed case (upper & lower)
        if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
        // 4. Contains special characters
        if (/[^A-Za-z0-9]/.test(value)) score++;

        // Render strength meter UI
        let width = '25%';
        let color = 'var(--color-error)';
        let text = 'Weak (Needs length, numbers, cases, or symbols)';

        if (score === 2) {
            width = '50%';
            color = 'var(--color-warning)';
            text = 'Medium (Improve symbols or cases)';
        } else if (score === 3) {
            width = '75%';
            color = 'var(--gradient-start)';
            text = 'Strong password';
        } else if (score === 4) {
            width = '100%';
            color = 'var(--color-success)';
            text = 'Highly secure password';
        }

        strengthFill.style.width = width;
        strengthFill.style.backgroundColor = color;
        strengthLabel.textContent = `Password strength: ${text}`;

        // Feedback in input status border
        if (value.length >= 8) {
            setStatus(signupPassword, 'success');
        } else {
            setStatus(signupPassword, 'error', 'Password must be at least 8 characters.');
        }
    });

    // --- 5. Submission Operations ---
    
    // Switch state helper (loading/loaded)
    const toggleLoadingState = (btn, showLoading) => {
        const textSpan = btn.querySelector('.btn-text');
        const loaderSpan = btn.querySelector('.btn-loader');
        
        if (showLoading) {
            btn.disabled = true;
            textSpan.classList.add('hidden');
            loaderSpan.classList.remove('hidden');
        } else {
            btn.disabled = false;
            textSpan.classList.remove('hidden');
            loaderSpan.classList.add('hidden');
        }
    };

    // Handle Login Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        
        let isValid = true;

        if (!validateEmailFormat(email)) {
            setStatus(loginEmail, 'error', 'Invalid email address format.');
            isValid = false;
        }
        
        if (password.length === 0) {
            setStatus(loginPassword, 'error', 'Password is required.');
            isValid = false;
        }

        if (!isValid) {
            showToast('Please correct the validation errors first.', 'error');
            return;
        }

        // Simulate API call
        toggleLoadingState(loginSubmitBtn, true);
        
        setTimeout(() => {
            toggleLoadingState(loginSubmitBtn, false);
            showToast('Successfully authenticated. Welcome back!', 'success');
            // Clear passwords for security
            loginPassword.value = '';
            setStatus(loginPassword, 'clear');
        }, 2000);
    });

    // Handle Signup Form Submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = signupName.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        const termsAccepted = signupTerms.checked;

        let isValid = true;

        if (name.length < 2) {
            setStatus(signupName, 'error', 'Name must be at least 2 characters.');
            isValid = false;
        }

        if (!validateEmailFormat(email)) {
            setStatus(signupEmail, 'error', 'Invalid email address format.');
            isValid = false;
        }

        if (password.length < 8) {
            setStatus(signupPassword, 'error', 'Password must be at least 8 characters.');
            isValid = false;
        }

        if (!termsAccepted) {
            showToast('You must accept the terms of service.', 'error');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Simulate API call
        toggleLoadingState(signupSubmitBtn, true);

        setTimeout(() => {
            toggleLoadingState(signupSubmitBtn, false);
            showToast('Account registered successfully! Please log in.', 'success');
            
            // Clear inputs
            signupName.value = '';
            signupEmail.value = '';
            signupPassword.value = '';
            signupTerms.checked = false;
            
            // Clear strength indicator & states
            setStatus(signupName, 'clear');
            setStatus(signupEmail, 'clear');
            setStatus(signupPassword, 'clear');
            strengthFill.style.width = '0%';
            strengthLabel.textContent = 'Password strength';
            
            // Switch to Login Form
            setTimeout(() => {
                switchToLogin();
            }, 500);

        }, 2000);
    });
});
