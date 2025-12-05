// Product Data
const products = [
    {
        id: 1,
        name: "WA Auto Reply Bot",
        price: "$99",
        image: "assets/images/bot1.jpg",
        category: "bot",
        features: ["Auto Reply", "Keyword Trigger", "Multi-language", "24/7 Online"],
        description: "Advanced auto-reply bot with AI capabilities"
    },
    // Add more products...
];

// Cart System
let cart = [];
let cartCount = 0;

// DOM Elements
const productList = document.getElementById('product-list');
const cartIcon = document.getElementById('cart-icon');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Load Products
function loadProducts() {
    productList.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-card h-100 fade-in">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <span class="badge bg-primary">${product.category}</span>
                    <h5 class="card-title mt-2">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <ul class="features-list">
                        ${product.features.map(feat => `<li><i class="fas fa-check"></i> ${feat}</li>`).join('')}
                    </ul>
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="price mb-0">${product.price}</h4>
                        <button class="btn btn-success" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if(product) {
        cart.push(product);
        cartCount++;
        updateCartCount();
        
        // Show notification
        showNotification(`${product.name} added to cart!`);
    }
}

function updateCartCount() {
    if(cartIcon) {
        cartIcon.innerHTML = `<i class="fas fa-shopping-cart"></i> Cart (${cartCount})`;
    }
}

// Checkout System
function checkout() {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0);
    
    // Show checkout modal
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    modal.show();
}

// WhatsApp Integration
function sendOrderViaWhatsApp() {
    const phone = "6281234567890"; // Your WhatsApp number
    const items = cart.map(item => `- ${item.name}: ${item.price}`).join('%0A');
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0);
    
    const message = `Hello! I want to order:%0A%0A${items}%0A%0ATotal: $${total.toFixed(2)}%0A%0APlease contact me!`;
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Admin Functions
function adminLogin(username, password) {
    // Basic authentication (in production, use proper auth)
    if(username === "admin" && password === "admin123") {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = "/admin/dashboard.html";
        return true;
    }
    return false;
}

// Payment Integration (Example)
function processPayment(method) {
    switch(method) {
        case 'paypal':
            // PayPal integration
            break;
        case 'crypto':
            // Crypto payment
            break;
        case 'bank':
            // Bank transfer
            break;
    }
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export Data
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}