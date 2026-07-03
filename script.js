// 1. إعدادات Supabase 
const supabaseUrl = 'https://ialjeaygybndnddlenuu.supabase.co';
const supabaseKey = 'sb_publishable_ob2LWsgNNtBlVNGQ-IOe6Q_0Ie3Ej3L';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let products = [];
let cart = [];
let currentCategory = "الكل";
const categories = ["الكل", "لاب توب", "موبايل", "سماعة", "ماوس", "كيبورد", "شاشة"];

// 2. سحب المنتجات
async function fetchProducts() {
    try {
        const { data, error } = await supabaseClient.from('products').select('*');
        if (error) throw error;
        
        if (data.length === 0) {
            document.getElementById('products-container').innerHTML = '<h3 style="grid-column: 1/-1; text-align: center;">لا توجد منتجات حالياً.</h3>';
            return;
        }
        products = data;
        displayProducts(products);
    } catch (error) {
        console.error("إيرور:", error.message);
        showToast("فشل في الاتصال بقاعدة البيانات!");
    }
}

// 3. عرض المنتجات

const productsContainer = document.getElementById('products-container');
function displayProducts(productsList) {
    productsContainer.innerHTML = '';
    productsList.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.onclick = () => openModal(product.id);
        
        card.innerHTML = `
            <div class="image-container"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
            <h3>${product.name}</h3>
            <span class="brand">${product.category} - ${product.brand}</span>
            <div class="price-action">
                <span class="price">$${product.price}</span>
                <button class="add-btn" onclick="event.stopPropagation(); addToCart(${product.id})">أضف للسلة</button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

function filterProducts() {
    // تم التصحيح هنا: غيرنا الـ ID لـ nav-search-bar عشان يطابق الـ HTML الجديد
    const searchInput = document.getElementById('nav-search-bar');
    const searchText = searchInput ? searchInput.value.toLowerCase() : "";
    
    const filtered = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchText) || product.brand.toLowerCase().includes(searchText);
        const matchCategory = currentCategory === "الكل" || product.category === currentCategory;
        return matchSearch && matchCategory;
    });
    
    // سكرول ناعم لقسم المنتجات لما تبحث أو تختار قسم
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    displayProducts(filtered);
}

// دوال الفتح والقفل المحدثة
function toggleCart() {
    document.getElementById('wishlist-sidebar').classList.remove('open'); // يقفل المفضلة لو مفتوحة
    document.getElementById('cart-sidebar').classList.toggle('open');
    updateOverlay();
}

function toggleWishlist() {
    document.getElementById('cart-sidebar').classList.remove('open'); // يقفل السلة لو مفتوحة
    document.getElementById('wishlist-sidebar').classList.toggle('open');
    updateOverlay();
}

// دالة جديدة بتتحكم في الخلفية السوداء
function updateOverlay() {
    const isCartOpen = document.getElementById('cart-sidebar').classList.contains('open');
    const isWishlistOpen = document.getElementById('wishlist-sidebar').classList.contains('open');
    
    if (isCartOpen || isWishlistOpen) {
        document.getElementById('cart-overlay').classList.add('open');
    } else {
        document.getElementById('cart-overlay').classList.remove('open');
    }
}

// دالة تقفل الاتنين مع بعض لو دوست على الخلفية السوداء
function closeSidebars() {
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('wishlist-sidebar').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    
    updateCartUI();
    showToast(`تم إضافة "${product.name}" للسلة بنجاح!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0, count = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}">
                <div style="flex-grow:1">
                    <h4 style="font-size:0.9rem">${item.name}</h4>
                    <p style="color:var(--primary-color); font-weight:bold">$${item.price} x ${item.quantity}</p>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">✖</button>
            </div>
        `;
    });
    document.getElementById('cart-count').innerText = count;
    document.getElementById('cart-total').innerText = total;
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="modal-flex">
            <img src="${product.image}" alt="${product.name}">
            <div class="modal-info">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <h3 style="font-size:2rem; color:var(--primary-color); margin-bottom:20px;">$${product.price}</h3>
                <button class="add-btn" style="width:100%; padding:15px;" onclick="addToCart(${product.id}); closeModal(true)">إضافة إلى السلة</button>
            </div>
        </div>
    `;
    document.getElementById('product-modal').classList.add('active');
}

function closeModal(event) {
    if(event === true || event.target.id === 'product-modal') {
        document.getElementById('product-modal').classList.remove('active');
    }
}

// دالة الدارك مود بعد التصحيح عشان تشتغل على كل المتصفحات
function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
    } else {
        body.setAttribute('data-theme', 'dark');
    }
}



// ----------------------------------------------------
// أكواد الأقسام الجديدة (Flash Sale, FAQ, Newsletter)
// ----------------------------------------------------

// أ. العداد التنازلي لعروض الفلاش
function startFlashSaleCountdown() {
    let hours = 12, minutes = 45, seconds = 30;
    setInterval(() => {
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 24; } // ريستارت وهمي لما يخلص
        
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }, 1000);
}

// ب. فتح وقفل الأسئلة الشائعة
function toggleFaq(element) {
    element.classList.toggle('active');
}

// ج. اشتراك النشرة البريدية
function subscribeNewsletter(event) {
    event.preventDefault(); // يمنع الصفحة إنها تعمل ريفرش
    showToast("🎉 شكراً لاشتراكك! ستصلك أحدث العروض قريباً.");
    event.target.reset(); // يفضي المربع بعد الاشتراك
}

// تشغيل الوظائف عند فتح الموقع
// تفعيل أيقونات Lucide
lucide.createIcons();
fetchProducts();
startFlashSaleCountdown();