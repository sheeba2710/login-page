/* -------------------------------------------------------------
   PulseAuth Checkout Script
   Manages session loading, dynamic cart listing, payment choice
   switching, validation, and simulated payment submission.
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Session & Auth Verification ---
    const userSession = localStorage.getItem('pulse_user');
    if (!userSession) {
        window.location.href = 'index.html';
        return;
    }

    const userData = JSON.parse(userSession);
    
    // Update User Info in Navbar
    const userAvatar = document.getElementById('user-avatar');
    const displayUserName = document.getElementById('display-user-name');
    
    if (userData.name) {
        displayUserName.textContent = userData.name;
        userAvatar.textContent = userData.name.charAt(0).toUpperCase();
    }

    // --- 2. Load Cart Data & Summary ---
    const cartDataRaw = localStorage.getItem('pulse_cart');
    let cart = [];
    if (cartDataRaw) {
        cart = JSON.parse(cartDataRaw);
    }

    // If cart is empty, redirect back to dashboard
    if (cart.length === 0) {
        alert("Your cart is empty. Redirecting to dashboard...");
        window.location.href = 'dashboard.html';
        return;
    }

    // DOM Elements for Summary
    const summaryItemsList = document.getElementById('summary-items-list');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryDiscount = document.getElementById('summary-discount');
    const summaryTotal = document.getElementById('summary-total');

    let subtotalVal = 0;
    let savingsVal = 0;
    let totalVal = 0;

    // Render Order Items
    summaryItemsList.innerHTML = "";
    cart.forEach(item => {
        const prod = item.product;
        const qty = item.quantity;
        const itemTotal = prod.finalPrice * qty;
        const itemOriginalTotal = prod.originalPrice * qty;
        
        subtotalVal += itemOriginalTotal;
        savingsVal += (itemOriginalTotal - itemTotal);
        totalVal += itemTotal;

        const row = document.createElement('div');
        row.className = 'summary-item-row';
        row.innerHTML = `
            <div class="summary-item-visual">
                <img src="${prod.image}" alt="${prod.name}" class="checkout-item-image">
            </div>
            <div class="summary-item-info">
                <div class="summary-item-name">${prod.name}</div>
                <div class="summary-item-qty">Qty: ${qty}</div>
            </div>
            <div class="summary-item-price">₹${itemTotal.toFixed(2)}</div>
        `;
        summaryItemsList.appendChild(row);
    });

    // Set prices
    summarySubtotal.textContent = `₹${subtotalVal.toFixed(2)}`;
    summaryDiscount.textContent = `-₹${savingsVal.toFixed(2)}`;
    summaryTotal.textContent = `₹${totalVal.toFixed(2)}`;

    // --- 3. Payment Method Switching ---
    const methodCards = document.querySelectorAll('.method-card');
    const detailsPanes = document.querySelectorAll('.details-pane');
    let selectedMethod = 'pod'; // Default

    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active status
            methodCards.forEach(c => c.classList.remove('active'));
            detailsPanes.forEach(p => p.classList.remove('active'));

            // Set current active
            card.classList.add('active');
            selectedMethod = card.dataset.method;

            // Show appropriate pane
            const targetPane = document.getElementById(`details-${selectedMethod}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // --- 4. Input & Validation (UPI) ---
    const upiInputField = document.getElementById('upi-id-field');
    const upiStatusIndicator = document.getElementById('upi-status-indicator');
    const upiErrorMsg = document.getElementById('upi-error-msg');
    const upiGroup = upiInputField.closest('.input-group');

    const validateUPI = (vpa) => {
        // Basic VPA validation: parts separated by @
        const re = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return re.test(vpa);
    };

    upiInputField.addEventListener('input', () => {
        const val = upiInputField.value.trim();
        if (val === '') {
            upiGroup.classList.remove('error', 'success');
            upiErrorMsg.textContent = '';
        } else if (validateUPI(val)) {
            upiGroup.classList.remove('error');
            upiGroup.classList.add('success');
            upiErrorMsg.textContent = '';
        } else {
            upiGroup.classList.remove('success');
            upiGroup.classList.add('error');
            upiErrorMsg.textContent = 'Enter a valid format: example@upi';
        }
    });

    // --- 5. Submit Transaction ---
    const completeBtn = document.getElementById('complete-payment-btn');
    const paymentLoader = document.getElementById('payment-loader');
    const successScreen = document.getElementById('success-screen');
    const successPaymentMethod = document.getElementById('success-payment-method');
    const successAmount = document.getElementById('success-amount');

    const toast = document.getElementById('toast-notification');
    const toastMsgText = document.getElementById('toast-msg-text');
    let toastTimeout;

    const showToast = (message, type = 'success') => {
        clearTimeout(toastTimeout);
        toast.className = 'toast';
        toast.classList.add(type, 'show');
        toastMsgText.textContent = message;
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    };

    completeBtn.addEventListener('click', () => {
        // Validation check
        if (selectedMethod === 'upi') {
            const val = upiInputField.value.trim();
            if (!validateUPI(val)) {
                showToast('Please enter a valid UPI ID before proceeding.', 'error');
                upiGroup.classList.add('error');
                upiErrorMsg.textContent = 'Valid UPI ID required (e.g. name@upi)';
                upiInputField.focus();
                return;
            }
        }

        // Show spinner loader state
        completeBtn.disabled = true;
        completeBtn.querySelector('.btn-text').classList.add('hidden');
        paymentLoader.classList.remove('hidden');

        // Simulate secure bank authentication
        setTimeout(() => {
            // Success
            completeBtn.disabled = false;
            completeBtn.querySelector('.btn-text').classList.remove('hidden');
            paymentLoader.classList.add('hidden');

            // Set success UI variables
            let methodLabel = "Pay on Delivery";
            if (selectedMethod === 'gpay') {
                methodLabel = "Google Pay (GPay)";
            } else if (selectedMethod === 'upi') {
                methodLabel = `UPI (${upiInputField.value.trim()})`;
            }

            successPaymentMethod.textContent = methodLabel;
            successAmount.textContent = `₹${totalVal.toFixed(2)}`;

            // Clear local cart
            localStorage.removeItem('pulse_cart');

            // Show Success screen overlay
            successScreen.classList.remove('hidden');

            // Set redirect timeout
            const redirectTimeout = setTimeout(redirectToDashboard, 5000);

            // Manual redirect button
            document.getElementById('success-back-btn').addEventListener('click', () => {
                clearTimeout(redirectTimeout);
                redirectToDashboard();
            });

        }, 2500);
    });

    const redirectToDashboard = () => {
        window.location.href = 'dashboard.html';
    };
});
