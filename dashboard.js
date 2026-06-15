/* -------------------------------------------------------------
   PulseAuth Dashboard Logic File
   Handles: Session check, Product catalog filtering, Cart Drawer operations,
            and the interactive AI Chatbox local parser.
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Session & Auth Verification ---
    const userSession = localStorage.getItem('pulse_user');
    if (!userSession) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }

    const userData = JSON.parse(userSession);
    
    // Update DOM greetings
    const welcomeName = document.getElementById('welcome-name');
    const displayUserName = document.getElementById('display-user-name');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userData.name) {
        welcomeName.textContent = userData.name;
        displayUserName.textContent = userData.name;
        userAvatar.textContent = userData.name.charAt(0).toUpperCase();
    } else {
        welcomeName.textContent = 'Explorer';
        displayUserName.textContent = 'User';
        userAvatar.textContent = 'U';
    }

    // Logout handling
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('pulse_user');
        showToast('Logging out. Safely ending session...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });

    // --- 2. Product Catalog Database ---
    const PRODUCTS = [
        {
            id: 1,
            name: "Pulse SoundLink Headset",
            category: "audio",
            originalPrice: 14999.00,
            discount: 20, // 20%
            finalPrice: 11999.00,
            rating: 4.8,
            description: "High-fidelity noise-cancelling over-ear wireless headphones with studio-quality acoustics.",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>`
        },
        {
            id: 2,
            name: "Aura Smartwatch Pro",
            category: "wearables",
            originalPrice: 24999.00,
            discount: 15, // 15%
            finalPrice: 21249.00,
            rating: 4.7,
            description: "Advanced biometric tracker, premium sleep monitor, and secure MFA authentication token.",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"></circle><path d="M12 9v3l1.5 1.5"></path><path d="M16.51 7.51l1.49-1.49M16.51 16.49l1.49 1.49M7.49 7.51l-1.49-1.49M7.49 16.49l-1.49 1.49"></path></svg>`
        },
        {
            id: 3,
            name: "Quantum Drive SSD",
            category: "electronics",
            originalPrice: 9999.00,
            discount: 10, // 10%
            finalPrice: 8999.00,
            rating: 4.9,
            description: "Ultra-fast PCIe Gen4 NVMe M.2 solid-state drive with secure hardware-level encryption.",
            image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`
        },
        {
            id: 4,
            name: "Neon Mechanical Keyboard",
            category: "accessories",
            originalPrice: 12999.00,
            discount: 25, // 25%
            finalPrice: 9749.00,
            rating: 4.5,
            description: "RGB backlit mechanical keyboard with hot-swappable tactile linear key switches.",
            image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="10" y1="12" x2="10.01" y2="12"></line><line x1="14" y1="12" x2="14.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>`
        },
        {
            id: 5,
            name: "Pulse Buds Lite",
            category: "audio",
            originalPrice: 7999.00,
            discount: 30, // 30%
            finalPrice: 5599.00,
            rating: 4.3,
            description: "Ergonomic true-wireless earbuds with dual-microphone clarity and touch control.",
            image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path></svg>`
        },
        {
            id: 6,
            name: "CyberCharger GaN 100W",
            category: "electronics",
            originalPrice: 4999.00,
            discount: 15, // 15%
            finalPrice: 4249.00,
            rating: 4.6,
            description: "Gallium Nitride pocket-sized charger with triple ports and intelligent power distribution.",
            image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="22"></line><line x1="9" y1="18" x2="9" y2="22"></line><line x1="15" y1="18" x2="15" y2="22"></line></svg>`
        },
        {
            id: 7,
            name: "Nexus Smart Band",
            category: "wearables",
            originalPrice: 5999.00,
            discount: 0, // No discount
            finalPrice: 5999.00,
            rating: 4.2,
            description: "Sleek fitness bracelet with continuous heart monitoring and high-contrast OLED display.",
            image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"></path><line x1="6" y1="12" x2="18" y2="12"></line></svg>`
        },
        {
            id: 8,
            name: "Vector Mesh Router Wi-Fi 6",
            category: "electronics",
            originalPrice: 19999.00,
            discount: 20, // 20%
            finalPrice: 15999.00,
            rating: 4.7,
            description: "High-performance dual-band mesh node supporting seamless 1.8Gbps gigabit networking.",
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
            iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>`
        }
       {
    id: 9,
    name: "AeroSound Wireless Headphones",
    category: "electronics",
    originalPrice: 4999.00,
    discount: 25,
    finalPrice: 3749.00,
    rating: 4.6,
    description: "Premium over-ear headphones with active noise cancellation and 40-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12a8 8 0 0 1 16 0"></path><rect x="2" y="12" width="4" height="8"></rect><rect x="18" y="12" width="4" height="8"></rect></svg>`
},
{
    id: 10,
    name: "UltraFit Smart Watch",
    category: "electronics",
    originalPrice: 7999.00,
    discount: 15,
    finalPrice: 6799.00,
    rating: 4.5,
    description: "Fitness smartwatch with heart rate monitoring, GPS tracking and AMOLED display.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="16" rx="2"></rect></svg>`
},
{
    id: 11,
    name: "Pro Mechanical Keyboard",
    category: "electronics",
    originalPrice: 3499.00,
    discount: 10,
    finalPrice: 3149.00,
    rating: 4.8,
    description: "RGB mechanical keyboard featuring blue switches and customizable lighting effects.",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>`
},
{
    id: 12,
    name: "Gaming Mouse X9",
    category: "electronics",
    originalPrice: 2499.00,
    discount: 18,
    finalPrice: 2049.00,
    rating: 4.7,
    description: "Ergonomic gaming mouse with adjustable DPI and programmable buttons.",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6"></path><rect x="6" y="2" width="12" height="20" rx="6"></rect></svg>`
},
{
    id: 13,
    name: "Classic Leather Backpack",
    category: "fashion",
    originalPrice: 2999.00,
    discount: 20,
    finalPrice: 2399.00,
    rating: 4.4,
    description: "Stylish leather backpack with spacious compartments for work and travel.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 8a5 5 0 0 1 10 0"></path><rect x="5" y="8" width="14" height="12" rx="2"></rect></svg>`
},
{
    id: 14,
    name: "Modern Desk Lamp",
    category: "home",
    originalPrice: 1999.00,
    discount: 12,
    finalPrice: 1759.00,
    rating: 4.3,
    description: "LED desk lamp with adjustable brightness and eye-care lighting technology.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6"></path><path d="M8 20h8"></path></svg>`
},
{
    id: 15,
    name: "Premium Coffee Maker",
    category: "home",
    originalPrice: 6999.00,
    discount: 22,
    finalPrice: 5459.00,
    rating: 4.7,
    description: "Automatic coffee maker with programmable brewing and thermal carafe.",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="6" width="10" height="12"></rect></svg>`
},
{
    id: 16,
    name: "4K Ultra HD Monitor",
    category: "electronics",
    originalPrice: 24999.00,
    discount: 18,
    finalPrice: 20499.00,
    rating: 4.9,
    description: "27-inch 4K monitor with HDR support and ultra-thin bezels.",
    image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=600&auto=format&fit=crop&q=80",
    iconSvg: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="12"></rect></svg>`
}
    ];

    let currentCategory = "all";
    let searchQuery = "";
    let customFilterFunc = null;

    // Elements
    const productsGrid = document.getElementById('products-grid');
    const categoryTabs = document.getElementById('category-tabs');
    const filterMetaText = document.getElementById('filter-meta');
    const globalSearch = document.getElementById('global-search');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const emptyState = document.getElementById('empty-state');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // --- 3. Grid Rendering & Filtering ---
    const renderProducts = () => {
        // Filter elements
        let filtered = PRODUCTS.filter(prod => {
            // Category filter
            if (currentCategory !== "all" && prod.category !== currentCategory) {
                return false;
            }
            // Search text filter
            if (searchQuery !== "") {
                const term = searchQuery.toLowerCase();
                const matchName = prod.name.toLowerCase().includes(term);
                const matchDesc = prod.description.toLowerCase().includes(term);
                const matchCat = prod.category.toLowerCase().includes(term);
                if (!matchName && !matchDesc && !matchCat) return false;
            }
            // Custom AI filter
            if (customFilterFunc && !customFilterFunc(prod)) {
                return false;
            }
            return true;
        });

        // Clear grid
        productsGrid.innerHTML = "";

        // Display results or empty state
        if (filtered.length === 0) {
            productsGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            productsGrid.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            filtered.forEach(prod => {
                const card = document.createElement('article');
                card.className = 'product-card';
                card.id = `product-card-${prod.id}`;

                // Calculate stars
                let stars = "";
                const fullStars = Math.floor(prod.rating);
                for (let i = 0; i < 5; i++) {
                    if (i < fullStars) {
                        stars += "★";
                    } else {
                        stars += "☆";
                    }
                }

                // Pricing elements html
                const discountTag = prod.discount > 0 ? `<div class="discount-tag">-${prod.discount}% OFF</div>` : '';
                const originalPriceHtml = prod.discount > 0 ? `<span class="original-price">₹${prod.originalPrice.toFixed(2)}</span>` : '';

                card.innerHTML = `
                    ${discountTag}
                    <div class="product-category-tag">${prod.category}</div>
                    <div class="product-image-wrapper">
                        <img src="${prod.image}" alt="${prod.name}" class="product-image" loading="lazy">
                    </div>
                    <div class="product-details">
                        <h3 class="product-title">${prod.name}</h3>
                        <p class="product-desc">${prod.description}</p>
                        <div class="product-rating">
                            <span class="rating-stars">${stars}</span>
                            <span class="rating-value">${prod.rating.toFixed(1)}</span>
                        </div>
                        <div class="product-price-row">
                            <div class="price-box">
                                ${originalPriceHtml}
                                <span class="final-price">₹${prod.finalPrice.toFixed(2)}</span>
                            </div>
                            <button class="add-cart-btn" data-product-id="${prod.id}" title="Add to Cart" aria-label="Add ${prod.name} to Cart">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;

                // Add to grid
                productsGrid.appendChild(card);
            });
        }

        // Update meta text
        let countText = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
        if (currentCategory !== "all") {
            countText += ` in ${currentCategory.toUpperCase()}`;
        }
        if (searchQuery !== "") {
            countText += ` matching "${searchQuery}"`;
        }
        if (customFilterFunc) {
            countText += ` (AI filters applied)`;
        }
        filterMetaText.textContent = countText;
    };

    // Category button events
    categoryTabs.addEventListener('click', (e) => {
        const target = e.target.closest('.category-btn');
        if (!target) return;

        // Reset AI custom filters when clicking manually
        customFilterFunc = null;

        // Toggle active visual class
        categoryTabs.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        // Set state
        currentCategory = target.dataset.category;
        renderProducts();
    });

    // Search input typing
    globalSearch.addEventListener('input', () => {
        searchQuery = globalSearch.value.trim();
        // Reset AI custom filters on manual search
        customFilterFunc = null;

        if (searchQuery.length > 0) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        renderProducts();
    });

    // Clear search button
    clearSearchBtn.addEventListener('click', () => {
        globalSearch.value = "";
        searchQuery = "";
        clearSearchBtn.classList.add('hidden');
        renderProducts();
        globalSearch.focus();
    });

    // Reset filters button
    const resetAllFilters = () => {
        currentCategory = "all";
        searchQuery = "";
        customFilterFunc = null;
        globalSearch.value = "";
        clearSearchBtn.classList.add('hidden');
        
        categoryTabs.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        categoryTabs.querySelector('[data-category="all"]').classList.add('active');
        
        renderProducts();
    };

    resetFiltersBtn.addEventListener('click', resetAllFilters);

    // Initial render
    renderProducts();

    // --- 4. Shopping Cart State & Management ---
    let cart = [];
    const savedCart = localStorage.getItem('pulse_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }

    // Cart Drawer Elements
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBody = document.getElementById('cart-body');
    const cartBadge = document.getElementById('cart-badge');
    
    const cartGrandTotal = document.getElementById('cart-grand-total');
    const cartSavingsTotal = document.getElementById('cart-savings-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Cart visibility triggers
    const openCart = () => {
        cartDrawer.classList.add('open');
        cartDrawerOverlay.classList.add('open');
    };

    const closeCart = () => {
        cartDrawer.classList.remove('open');
        cartDrawerOverlay.classList.remove('open');
    };

    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartDrawerOverlay.addEventListener('click', closeCart);

    // Update cart view
    const updateCartUI = () => {
        // Persist cart to local storage
        localStorage.setItem('pulse_cart', JSON.stringify(cart));

        // Calculate items amount
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;

        // Clear contents
        cartBody.innerHTML = "";

        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty-message">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Your shopping cart is currently empty.</p>
                </div>
            `;
            cartGrandTotal.textContent = "₹0.00";
            cartSavingsTotal.textContent = "₹0.00";
            checkoutBtn.disabled = true;
            return;
        }

        // Enable checkout
        checkoutBtn.disabled = false;

        let grandTotalVal = 0;
        let savingsTotalVal = 0;

        cart.forEach(item => {
            const prod = item.product;
            const itemTotal = prod.finalPrice * item.quantity;
            const itemOriginalTotal = prod.originalPrice * item.quantity;
            const itemSavings = itemOriginalTotal - itemTotal;

            grandTotalVal += itemTotal;
            savingsTotalVal += itemSavings;

            const cartRow = document.createElement('div');
            cartRow.className = 'cart-item';
            
            const originalPriceHtml = prod.discount > 0 ? `<span class="cart-item-orig-price">₹${(prod.originalPrice * item.quantity).toFixed(2)}</span>` : '';

            cartRow.innerHTML = `
                <div class="cart-item-visual">
                    <img src="${prod.image}" alt="${prod.name}" class="cart-item-image">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${prod.name}</div>
                    <div class="cart-item-pricing">
                        ${originalPriceHtml}
                        <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-selector">
                            <button class="qty-btn dec-btn" data-product-id="${prod.id}">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn inc-btn" data-product-id="${prod.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-product-id="${prod.id}" title="Remove Item" aria-label="Remove ${prod.name}">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            cartBody.appendChild(cartRow);
        });

        cartGrandTotal.textContent = `₹${grandTotalVal.toFixed(2)}`;
        cartSavingsTotal.textContent = `₹${savingsTotalVal.toFixed(2)}`;
    };

    // Card Add Button Actions (Event Delegation)
    productsGrid.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.add-cart-btn');
        if (!targetBtn) return;

        const id = parseInt(targetBtn.dataset.productId);
        const prod = PRODUCTS.find(p => p.id === id);
        
        if (prod) {
            addToCart(prod);
        }
    });

    const addToCart = (product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ product, quantity: 1 });
        }
        updateCartUI();
        showToast(`Added ${product.name} to cart.`, 'success');
        openCart();
    };

    // Cart Body Quantity Modification (Event Delegation)
    cartBody.addEventListener('click', (e) => {
        const target = e.target;
        
        // Remove item button
        const removeBtn = target.closest('.remove-item-btn');
        if (removeBtn) {
            const id = parseInt(removeBtn.dataset.productId);
            cart = cart.filter(item => item.product.id !== id);
            updateCartUI();
            showToast('Item removed from cart.', 'success');
            return;
        }

        // Quantity selector clicks
        const qtyBtn = target.closest('.qty-btn');
        if (qtyBtn) {
            const id = parseInt(qtyBtn.dataset.productId);
            const isInc = qtyBtn.classList.contains('inc-btn');
            
            const item = cart.find(item => item.product.id === id);
            if (item) {
                if (isInc) {
                    item.quantity += 1;
                } else {
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        // Remove item
                        cart = cart.filter(i => i.product.id !== id);
                    }
                }
                updateCartUI();
            }
        }
    });

    // Checkout handler
    checkoutBtn.addEventListener('click', () => {
        checkoutBtn.disabled = true;
        showToast('Redirecting to secure checkout...', 'success');
        
        localStorage.setItem('pulse_cart', JSON.stringify(cart));
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1000);
    });

    // --- 5. Toast Notification System ---
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

    // --- 6. AI Search Chatbox Engine ---
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const aiChatWindow = document.getElementById('ai-chat-window');
    
    const chatMessages = document.getElementById('chat-messages');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSuggestions = document.querySelector('.chat-suggestions');

    // Toggle Chat window view
    aiToggleBtn.addEventListener('click', () => {
        aiChatWindow.classList.toggle('hidden');
        if (!aiChatWindow.classList.contains('hidden')) {
            aiChatWindow.classList.remove('scale-out');
            chatInputField.focus();
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    closeChatBtn.addEventListener('click', () => {
        aiChatWindow.classList.add('scale-out');
        setTimeout(() => {
            aiChatWindow.classList.add('hidden');
        }, 300);
    });

    // Add suggestions clicks
    chatSuggestions.addEventListener('click', (e) => {
        const suggestBtn = e.target.closest('.suggest-btn');
        if (!suggestBtn) return;
        
        const query = suggestBtn.dataset.query;
        handleUserChatMessage(query);
    });

    // Handle Form Submit
    chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInputField.value.trim();
        if (text === "") return;
        
        handleUserChatMessage(text);
        chatInputField.value = "";
    });

    const handleUserChatMessage = (text) => {
        // Render user message bubble
        appendChatBubble(text, 'user');

        // Scroll messages
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Render AI typing bubble
        const typingBubble = appendTypingIndicator();
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Process query and respond after simulated delay (typing effect)
        setTimeout(() => {
            // Remove typing bubble
            typingBubble.remove();
            
            // Execute NLP logic
            const response = processNLPQuery(text);
            
            // Render AI response bubble
            appendChatBubble(response, 'ai');
            
            // Scroll messages
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1200);
    };

    const appendChatBubble = (messageText, sender = 'ai') => {
        const wrapper = document.createElement('div');
        wrapper.className = `chat-msg ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = messageText;
        
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
        return wrapper;
    };

    const appendTypingIndicator = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-msg ai';
        
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble typing-bubble';
        
        bubble.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
        return wrapper;
    };

    // --- 7. NLP query rules parser ---
    const processNLPQuery = (query) => {
        const q = query.toLowerCase().trim();

        // Remove highlights
        clearAIHighlights();

        // 1. GREETINGS
        if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('who are you') || q === 'help') {
            return `Hello! I can help you find products, search prices, or filter categories. Try: "items under ₹100" or "show sales".`;
        }

        // 2. RESET
        if (q === 'reset' || q === 'clear' || q.includes('reset search') || q.includes('show all') || q.includes('show everything')) {
            resetAllFilters();
            return "Cleared all filters and showing all products.";
        }

        // 3. SHOW DISCOUNTS
        if (q.includes('discount') || q.includes('sale') || q.includes('deal') || q.includes('promo')) {
            customFilterFunc = (prod) => prod.discount > 0;
            renderProducts();
            
            // Highlight all discounted cards
            const discountedItems = PRODUCTS.filter(p => p.discount > 0);
            if (discountedItems.length > 0) {
                discountedItems.forEach(item => triggerCardHighlight(item.id));
                return `Showing ${discountedItems.length} items on sale (highlighted).`;
            }
            return "No items are currently on sale.";
        }

        // 4. PRICE BOUNDS (e.g. "under ₹100", "less than 60")
        const priceRegex = /(?:under|less than|below|cheap|<=|<|\$|₹|rs\.?)\s*(\d+)/i;
        const priceMatch = q.match(priceRegex);
        
        if (priceMatch && priceMatch[1]) {
            const maxPrice = parseFloat(priceMatch[1]);
            customFilterFunc = (prod) => prod.finalPrice <= maxPrice;
            renderProducts();

            const items = PRODUCTS.filter(p => p.finalPrice <= maxPrice);
            if (items.length > 0) {
                items.forEach(item => triggerCardHighlight(item.id));
                return `Showing ${items.length} items under ₹${maxPrice.toFixed(2)}.`;
            } else {
                return `No products found under ₹${maxPrice.toFixed(2)}.`;
            }
        }

        // General 'cheap' without a number
        if (q.includes('cheap') || q.includes('affordable') || q.includes('inexpensive')) {
            // Find items under ₹6000
            customFilterFunc = (prod) => prod.finalPrice < 6000.00;
            renderProducts();

            const cheapItems = PRODUCTS.filter(p => p.finalPrice < 6000.00);
            cheapItems.forEach(item => triggerCardHighlight(item.id));
            return `Showing ${cheapItems.length} budget items under ₹6000.00.`;
        }

        // 5. SPECIFIC PRODUCT HIGHLIGHT OR CATEGORY FILTERING
        // Let's check for specific keywords
        let categoryFilterTarget = null;
        let productHighlightTarget = null;

        if (q.includes('audio') || q.includes('headphone') || q.includes('earbud') || q.includes('bud') || q.includes('sound')) {
            if (q.includes('headphone') || q.includes('soundlink') || q.includes('headset')) {
                productHighlightTarget = 1; // Pulse SoundLink Headset
            } else if (q.includes('buds') || q.includes('earbud')) {
                productHighlightTarget = 5; // Pulse Buds Lite
            } else {
                categoryFilterTarget = "audio";
            }
        } else if (q.includes('wearable') || q.includes('watch') || q.includes('tracker') || q.includes('band') || q.includes('fitness')) {
            if (q.includes('watch') || q.includes('aura') || q.includes('smartwatch')) {
                productHighlightTarget = 2; // Aura Smartwatch Pro
            } else if (q.includes('band') || q.includes('nexus') || q.includes('bracelet')) {
                productHighlightTarget = 7; // Nexus Smart Band
            } else {
                categoryFilterTarget = "wearables";
            }
        } else if (q.includes('electronic') || q.includes('router') || q.includes('mesh') || q.includes('ssd') || q.includes('drive') || q.includes('charger') || q.includes('gan')) {
            if (q.includes('ssd') || q.includes('quantum') || q.includes('drive')) {
                productHighlightTarget = 3; // Quantum Drive SSD
            } else if (q.includes('charger') || q.includes('cyber') || q.includes('charge')) {
                productHighlightTarget = 6; // CyberCharger GaN 100W
            } else if (q.includes('router') || q.includes('mesh') || q.includes('wifi') || q.includes('vector')) {
                productHighlightTarget = 8; // Vector Mesh Router Wi-Fi 6
            } else {
                categoryFilterTarget = "electronics";
            }
        } else if (q.includes('accessory') || q.includes('accessories') || q.includes('keyboard') || q.includes('neon') || q.includes('board')) {
            if (q.includes('keyboard') || q.includes('neon')) {
                productHighlightTarget = 4; // Neon Mechanical Keyboard
            } else {
                categoryFilterTarget = "accessories";
            }
        }

        // Apply visual category filter
        if (categoryFilterTarget) {
            currentCategory = categoryFilterTarget;
            // Select active pill in layout
            categoryTabs.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            categoryTabs.querySelector(`[data-category="${categoryFilterTarget}"]`).classList.add('active');
            renderProducts();
            
            // Highlight items inside this category
            const catItems = PRODUCTS.filter(p => p.category === categoryFilterTarget);
            catItems.forEach(item => triggerCardHighlight(item.id));
            return `Showing ${catItems.length} items in ${categoryFilterTarget.toUpperCase()}.`;
        }

        // Apply visual product highlight
        if (productHighlightTarget) {
            // Find target product
            const targetProd = PRODUCTS.find(p => p.id === productHighlightTarget);
            
            // Set category pill to all or matching category so it is rendered
            currentCategory = "all";
            categoryTabs.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            categoryTabs.querySelector('[data-category="all"]').classList.add('active');
            renderProducts();

            // Highlight and scroll
            setTimeout(() => {
                triggerCardHighlight(productHighlightTarget, true);
            }, 100);

            return `Found and highlighted: ${targetProd.name}.`;
        }

        // 6. DEFAULT GENERAL SEARCH
        // Search by keyword match in product fields
        const keywordMatches = PRODUCTS.filter(p => {
            return p.name.toLowerCase().includes(q) || 
                   p.description.toLowerCase().includes(q) || 
                   p.category.toLowerCase().includes(q);
        });

        if (keywordMatches.length > 0) {
            customFilterFunc = (prod) => {
                return prod.name.toLowerCase().includes(q) || 
                       prod.description.toLowerCase().includes(q) || 
                       prod.category.toLowerCase().includes(q);
            };
            renderProducts();
            keywordMatches.forEach(item => triggerCardHighlight(item.id));
            return `Showing ${keywordMatches.length} items matching your search.`;
        }

        // No matches found
        return `No products found matching "${query}". Try searching for categories or sales.`;
    };

    // Helper functions for AI styling highlights
    const triggerCardHighlight = (productId, scrollIntoView = false) => {
        const card = document.getElementById(`product-card-${productId}`);
        if (!card) return;

        // Add class
        card.classList.add('ai-highlight');

        if (scrollIntoView) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Auto remove class after 6 seconds
        setTimeout(() => {
            card.classList.remove('ai-highlight');
        }, 6000);
    };

    const clearAIHighlights = () => {
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('ai-highlight');
        });
    };

    // Render cart items if any existed on load
    updateCartUI();
});
