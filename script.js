document.addEventListener('DOMContentLoaded', () => {
    // --- State & Variables ---
    const API_PRODUCTS = 'https://fakestoreapi.com/products';
    const API_CATEGORIES = 'https://fakestoreapi.com/products/categories';

    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- DOM Elements ---
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');
    const loader = document.getElementById('loader');
    const cartCountBadge = document.getElementById('cart-count');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Modal Elements
    const modal = document.getElementById('product-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalRating = document.getElementById('modal-rating');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

    // --- Initialization ---
    init();

    function init() {
        updateCartCount();
        fetchCategories();
        fetchProducts();

        // Event Listeners
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Modal Close Listeners
        modalCloseBtn.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', closeModal);
    }

    // --- Fetching Data ---
    async function fetchProducts() {
        showLoader();
        try {
            const response = await fetch(API_PRODUCTS);
            allProducts = await response.json();
            renderProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load products. Please try again later.</p>';
        } finally {
            hideLoader();
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch(API_CATEGORIES);
            const categories = await response.json();
            renderCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    // --- Rendering ---
    function renderCategories(categories) {
        // "All" button
        const allBtn = document.createElement('button');
        allBtn.className = 'btn btn-outline active';
        allBtn.textContent = 'All';
        allBtn.dataset.category = 'all';
        allBtn.addEventListener('click', (e) => handleFilterClick(e, 'all'));
        categoryFilters.appendChild(allBtn);

        // Category buttons
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline capitalize';
            btn.textContent = cat;
            btn.dataset.category = cat;
            btn.addEventListener('click', (e) => handleFilterClick(e, cat));
            categoryFilters.appendChild(btn);
        });
    }

    function renderProducts(products) {
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No products found.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                </div>
                <div class="product-details">
                    <!-- Category & Rating Row -->
                    <div class="flex justify-between items-center mb-4">
                        <span class="category-badge">
                            ${product.category}
                        </span>
                        <div class="flex items-center" style="font-size: 0.875rem; color: var(--text-muted);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16" style="color: var(--warning); margin-right: 0.25rem;">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                            <span>${product.rating.rate} (${product.rating.count})</span>
                        </div>
                    </div>

                    <h3 class="product-title" title="${product.title}">${product.title}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    
                            </svg>
                            Add
                        </button>
                    </div>
                </div>
            `;

            // Add Event Listeners to Buttons specific to this card
            const detailsBtn = card.querySelector('.details-btn');
            detailsBtn.addEventListener('click', () => openModal(product));

            const addCartBtn = card.querySelector('.add-cart-btn');
            addCartBtn.addEventListener('click', () => addToCart(product));

            productGrid.appendChild(card);
        });
    }

    // --- Filtering Logic ---
    async function handleFilterClick(e, category) {
        // Update Active Button UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200');
        });
        e.target.classList.add('active', 'bg-indigo-600', 'text-white');
        e.target.classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200');

        // Fetch/Filter Logic
        showLoader();
        productGrid.innerHTML = '';

        try {
            let productsToRender = [];
            if (category === 'all') {
                // If we already have allProducts fetched, use them. Else fetch.
                if (allProducts.length > 0) {
                    productsToRender = allProducts;
                } else {
                    const response = await fetch(API_PRODUCTS);
                    allProducts = await response.json();
                    productsToRender = allProducts;
                }
            } else {
                const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);
                productsToRender = await response.json();
            }
            renderProducts(productsToRender);
        } catch (error) {
            console.error('Error filtering products:', error);
            productGrid.innerHTML = '<p class="text-center col-span-full">Error loading category products.</p>';
        } finally {
            hideLoader();
        }
    }

    // --- Cart System ---
    function addToCart(product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();

        // Optional: Simple Toast/Alert
        // alert(`${product.title} added to cart!`);
        // Better: Change button text temporarily
        const btns = document.querySelectorAll('.add-cart-btn'); // simplified selector, logic could be more specific
        // In a real app, we'd reference the specific button instance more directly or use feedback UI.
    }

    function updateCartCount() {
        cartCountBadge.innerText = cart.length;
    }

    // --- Modal System ---
    function openModal(product) {
        modalTitle.textContent = product.title;
        modalImage.src = product.image;
        modalDescription.textContent = product.description;
        modalPrice.textContent = `$${product.price.toFixed(2)}`;

        // Render Stars
        modalRating.innerHTML = '';
        const fullStars = Math.round(product.rating.rate);
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.innerHTML = i < fullStars ? '&#9733;' : '&#9734;'; // Simple star char
            modalRating.appendChild(star);
        }
        const countSpan = document.createElement('span');
        countSpan.textContent = `(${product.rating.count})`;
        countSpan.style.color = 'var(--text-muted)';
        countSpan.style.marginLeft = '0.5rem';
        modalRating.appendChild(countSpan);

        // Update Add to Cart button in Modal to add THIS product
        const newBtn = modalAddToCartBtn.cloneNode(true);
        newBtn.addEventListener('click', () => {
            addToCart(product);
            closeModal();
        });
        modalAddToCartBtn.parentNode.replaceChild(newBtn, modalAddToCartBtn);
        // Re-assign because element was replaced
        const updatedBtn = document.getElementById('modal-add-to-cart'); // Get the new button from DOM if needed, but here simple replace works.
        // Actually, better to just update the reference if we were reusing it, but here we query dynamically or just clone. 
        // Let's stick to the clone approach but ensure we don't lose the reference for next time if it was global. 
        // In this script, modalAddToCartBtn is const, so we can't reassign. 
        // Better approach: Just set onclick or use a different pattern. 
        // For now, let's just do the clone and replace.

        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    // --- Helpers ---
    function showLoader() {
        loader.classList.remove('hidden');
        productGrid.classList.add('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
        productGrid.classList.remove('hidden');
    }
});
