document.addEventListener('DOMContentLoaded', () => {

    // fetching data APIs
    const products_api = 'https://fakestoreapi.com/products';
    const categories_api = 'https://fakestoreapi.com/products/categories';

    // variables
    let all_products = [];
    let my_cart = JSON.parse(localStorage.getItem('cart'));

    // checks if cart is null
    if (my_cart == null) {
        my_cart = [];
    }

    // getting elements from HTML
    const grid = document.getElementById('product-grid');
    const filters = document.getElementById('category-filters');
    const load_spinner = document.getElementById('loader');
    const cart_badge = document.getElementById('cart-count');

    // mobile menu stuff
    const menu_btn = document.getElementById('mobile-menu-btn');
    const mobile_menu = document.getElementById('mobile-menu');

    // modal elements
    const modal_box = document.getElementById('product-modal');
    const close_btn = document.getElementById('modal-close');
    const title_text = document.getElementById('modal-title');
    const img_elem = document.getElementById('modal-image');
    const desc_text = document.getElementById('modal-description');
    const price_text = document.getElementById('modal-price');
    const rate_box = document.getElementById('modal-rating');
    const modal_add_btn = document.getElementById('modal-add-to-cart');

    // call these functions when page loads
    updateCart();
    getCategories();
    getProducts();

    // click listener for mobile menu
    menu_btn.addEventListener('click', () => {
        // toggle hidden class
        if (mobile_menu.classList.contains('hidden')) {
            mobile_menu.classList.remove('hidden');
        } else {
            mobile_menu.classList.add('hidden');
        }
    });

    // close modal
    close_btn.addEventListener('click', () => {
        modal_box.classList.add('hidden');
    });

    // close clicking outside
    modal_box.addEventListener('click', (e) => {
        if (e.target === modal_box) {
            modal_box.classList.add('hidden');
        }
    });

    // function to get products
    async function getProducts() {
        console.log("fetching products...");

        // show loader
        load_spinner.classList.remove('hidden');
        grid.classList.add('hidden');

        try {
            const res = await fetch(products_api);
            const data = await res.json();
            all_products = data;
            console.log(all_products);

            showProducts(all_products);
        } catch (err) {
            console.log(err);
            grid.innerHTML = '<p style="text-align: center; color: red;">Error loading data</p>';
        }

        // hide loader
        load_spinner.classList.add('hidden');
        grid.classList.remove('hidden');
    }

    // function to get categories
    async function getCategories() {
        try {
            const res = await fetch(categories_api);
            const cat_data = await res.json();

            // show category buttons
            makeCategoryButtons(cat_data);
        } catch (err) {
            console.log(err);
        }
    }

    function makeCategoryButtons(cats) {
        // add All button first
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline active';
        btn.innerText = 'All';

        // click event
        btn.addEventListener('click', (event) => {
            filterData(event, 'all');
        });

        filters.appendChild(btn);

        // loop for other buttons
        for (let i = 0; i < cats.length; i++) {
            const catName = cats[i];
            const b = document.createElement('button');
            b.className = 'btn btn-outline';
            b.style.textTransform = 'capitalize';
            b.innerText = catName;

            b.addEventListener('click', (event) => {
                filterData(event, catName);
            });
            filters.appendChild(b);
        }
    }

    // display products on screen
    function showProducts(items) {
        grid.innerHTML = '';

        if (items.length == 0) {
            grid.innerHTML = '<p>No items found</p>';
            return;
        }

        // loop through products
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'product-card';

            // html template
            div.innerHTML = `
                <div class="product-image-container">
                    <img src="${item.image}" alt="${item.title}" class="product-image">
                </div>
                
                <div class="product-details">
                    <div class="flex justify-between items-center mb-4">
                        <span class="category-badge">${item.category}</span>
                        
                        <div class="flex items-center" style="font-size: 14px; color: gray;">
                             <span>★ ${item.rating.rate} (${item.rating.count})</span>
                        </div>
                    </div>
  
                    <h3 class="product-title" title="${item.title}">${item.title}</h3>
                    <p class="product-price">$${item.price}</p>
                    
                    <div style="margin-top: auto; display: flex; gap: 10px;">
                        <button class="details-btn btn btn-outline" style="flex: 1;">Details</button>
                        <button class="add-btn btn btn-primary" style="flex: 1;">Add</button>
                    </div>
                </div>
            `;

            // add listeners manually
            const d_btn = div.querySelector('.details-btn');
            d_btn.addEventListener('click', () => {
                showModal(item);
            });

            const a_btn = div.querySelector('.add-btn');
            a_btn.addEventListener('click', () => {
                addItem(item);
            });

            grid.appendChild(div);
        });
    }

    // filtering function
    async function filterData(e, category) {
        // change active class
        const buttons = document.querySelectorAll('#category-filters button');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
        }
        e.target.classList.add('active');

        // load again
        load_spinner.classList.remove('hidden');
        grid.innerHTML = '';

        let list = [];

        if (category == 'all') {
            list = all_products;
            // reload if empty
            if (list.length == 0) {
                const r = await fetch(products_api);
                list = await r.json();
            }
        } else {
            // handle spaces in url
            const safeCat = encodeURIComponent(category);
            const r = await fetch(products_api + '/category/' + safeCat);
            list = await r.json();
        }

        showProducts(list);
        load_spinner.classList.add('hidden');
    }

    function addItem(p) {
        console.log("adding to cart: " + p.title);
        my_cart.push(p);

        // save to local storage
        localStorage.setItem('cart', JSON.stringify(my_cart));
        updateCart();
    }

    function updateCart() {
        cart_badge.innerText = my_cart.length;
    }

    // modal function
    function showModal(product) {
        title_text.innerText = product.title;
        img_elem.src = product.image;
        desc_text.innerText = product.description;
        price_text.innerText = '$' + product.price;

        // simple stars
        rate_box.innerHTML = 'Rating: ' + product.rating.rate;

        // replace button to clear events
        const new_btn = modal_add_btn.cloneNode(true);
        new_btn.innerText = 'Add to Cart';

        new_btn.addEventListener('click', () => {
            addItem(product);
            modal_box.classList.add('hidden');
        });

        modal_add_btn.parentNode.replaceChild(new_btn, modal_add_btn);

        modal_box.classList.remove('hidden');
    }

});
