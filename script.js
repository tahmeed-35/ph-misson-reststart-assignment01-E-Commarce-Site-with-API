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
        allBtn.className = 'filter-btn active rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700 focus:outline-none';
        allBtn.textContent = 'All';
        allBtn.dataset.category = 'all';
        allBtn.addEventListener('click', (e) => handleFilterClick(e, 'all'));
        categoryFilters.appendChild(allBtn);

        // Category buttons
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600 focus:outline-none capitalize';
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
            card.className = 'product-card group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg flex flex-col h-full';

            card.innerHTML = `
                <div class="relative flex h-64 items-center justify-center overflow-hidden bg-white p-4">
                    <img src="${product.image}" alt="${product.title}" class="h-56 object-contain transition duration-300 group-hover:scale-105">
                    <span class="absolute top-3 left-3 rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 capitalize">${product.category}</span>
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <h3 class="truncate text-lg font-bold text-gray-900 mb-1" title="${product.title}">${product.title}</h3>
                    <div class="flex items-center mb-2">
                        <svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span class="ml-1 text-xs text-gray-500">(${product.rating.count})</span>
                    </div>
                    <p class="text-xl font-bold text-gray-900 mb-4">$${product.price.toFixed(2)}</p>
                    
                    <div class="mt-auto flex gap-2">
                        <button class="details-btn flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">Details</button>
                        <button class="add-cart-btn flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700">Add</button>
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

        // Update Add to Cart button in Modal to add THIS product
        // Remove old listeners to avoid duplicates (cloning node is a trick, or just overwrite onclick)
        const newBtn = modalAddToCartBtn.cloneNode(true);
        newBtn.addEventListener('click', () => {
            addToCart(product);
            closeModal();
        });
        modalAddToCartBtn.parentNode.replaceChild(newBtn, modalAddToCartBtn);

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
