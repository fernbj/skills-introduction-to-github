// Variables globales
let cart = [];
let currentUser = null;
const marcas = {
    colcafe: { name: "ColCafé", products: [] },
    cafeandino: { name: "Café Andino", products: [] },
    monteverde: { name: "Monte Verde", products: [] }
};

// Funciones de Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos iniciales
    cargarProductosIniciales();
    
    // Eventos para la navegación
    setupNavigation();
    
    // Eventos para el carrito
    setupCartEvents();
    
    // Eventos para la sección de vendedores
    setupSellerEvents();
    
    // Eventos para el formulario de contacto
    setupContactForm();
});

// Cargar productos iniciales
function cargarProductosIniciales() {
    marcas.colcafe.products = [
        { id: 'colcafe1', name: 'ColCafé Gourmet', price: 25000, description: 'Café en grano, cultivado en las alturas de Antioquia. Aroma intenso y sabor balanceado.', image: 'colcafe1.jpg' },
        { id: 'colcafe2', name: 'ColCafé Orgánico', price: 30000, description: 'Café biológico certificado, cultivado sin químicos. Cuerpo ligero y notas de chocolate.', image: 'colcafe2.jpg' }
    ];
    
    marcas.cafeandino.products = [
        { id: 'andino1', name: 'Andino Especial', price: 28000, description: 'Café proveniente de la región del Huila. Acidez media y cuerpo completo.', image: 'andino1.jpg' },
        { id: 'andino2', name: 'Andino Reserve', price: 35000, description: 'Selección premium de granos especiales. Notas de cítricos y miel.', image: 'andino2.jpg' }
    ];
    
    marcas.monteverde.products = [
        { id: 'monteverde1', name: 'Tueste Medio', price: 26000, description: 'Café cultivado en el Eje Cafetero. Equilibrio perfecto entre acidez y cuerpo.', image: 'monteverde1.jpg' },
        { id: 'monteverde2', name: 'Monte Verde Gourmet', price: 32000, description: 'Mezcla de granos especiales con notas de frutas rojas y vainilla.', image: 'monteverde2.jpg' }
    ];
    
    actualizarProductosEnDOM();
}

// Configurar eventos de navegación
function setupNavigation() {
    // Manejar clic en enlaces de navegación
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            // Mostrar la sección correspondiente
            const targetSection = this.getAttribute('href').substring(1);
            document.querySelectorAll('section').forEach(section => {
                if (section.id === targetSection) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Si se intenta acceder a la sección de vendedores sin autenticación, mostrar login
            if (targetSection === 'vendedores' && !currentUser) {
                document.getElementById('vendedores').style.display = 'block';
                document.getElementById('seller-dashboard').classList.add('hidden');
                document.getElementById('login-form').classList.remove('hidden');
            }
        });
    });
    
    // Mostrar la sección inicio por defecto
    document.querySelectorAll('section').forEach(section => {
        if (section.id === 'inicio') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Mostrar sección correspondiente al hacer scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === section.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Configurar eventos del carrito
function setupCartEvents() {
    // Agregar producto al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const product = findProductById(productId);
            
            if (product) {
                addToCart(product);
                actualizarCarrito();
                mostrarNotificacion(`Producto "${product.name}" agregado al carrito`);
            }
        });
    });
    
    // Manejar cambios en la cantidad de productos en el carrito
    document.getElementById('cart-items').addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const productId = e.target.getAttribute('data-product');
            const newQuantity = parseInt(e.target.value);
            
            if (newQuantity > 0) {
                updateCartItemQuantity(productId, newQuantity);
            } else {
                removeItemFromCart(productId);
            }
            
            actualizarCarrito();
        }
    });
    
    // Manejar eliminación de productos del carrito
    document.getElementById('cart-items').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            const productId = e.target.getAttribute('data-product');
            removeItemFromCart(productId);
            actualizarCarrito();
            mostrarNotificacion(`Producto removido del carrito`);
        }
    });
    
    // Manejar clic en botón de checkout
    document.getElementById('checkout-btn').addEventListener('click', function() {
        if (cart.length > 0) {
            alert('¡Gracias por su compra! Pronto recibirá un correo con los detalles de su pedido.');
            cart = [];
            actualizarCarrito();
            mostrarNotificacion('¡Compra realizada con éxito!');
        }
    });
}

// Configurar eventos para la sección de vendedores
function setupSellerEvents() {
    // Manejar formulario de login
    document.getElementById('seller-login').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Autenticación básica (en una aplicación real se usaría una base de datos)
        if (username === 'admin' && password === 'admin123') {
            currentUser = username;
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('seller-dashboard').classList.remove('hidden');
            document.getElementById('seller-name').textContent = username;
            actualizarProductosEnGestion();
            mostrarNotificacion('Inicio de sesión exitoso');
        } else {
            mostrarNotificacion('Usuario o contraseña incorrectos', 'error');
        }
    });
    
    // Manejar clic en botón de añadir producto
    document.getElementById('add-product-btn').addEventListener('click', function() {
        document.getElementById('add-product-form').classList.remove('hidden');
        document.querySelector('.dashboard-actions').style.marginBottom = '2rem';
    });
    
    // Manejar clic en botón cancelar añadir producto
    document.getElementById('cancel-add-product').addEventListener('click', function() {
        document.getElementById('add-product-form').classList.add('hidden');
        document.getElementById('add-product-form').reset();
        document.querySelector('.dashboard-actions').style.marginBottom = '1.5rem';
    });
    
    // Manejar envío del formulario de añadir producto
    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productName = document.getElementById('new-product-name').value;
        const productPrice = parseInt(document.getElementById('new-product-price').value);
        const productDesc = document.getElementById('new-product-desc').value;
        const productImg = document.getElementById('new-product-img').value;
        const selectedMarca = document.getElementById('marca-select').value;
        
        // Generar ID único
        const productId = selectedMarca + Date.now();
        
        // Crear nuevo producto
        const newProduct = {
            id: productId,
            name: productName,
            price: productPrice,
            description: productDesc,
            image: productImg
        };
        
        // Agregar producto a la marca correspondiente
        marcas[selectedMarca].products.push(newProduct);
        
        // Actualizar DOM
        actualizarProductosEnDOM();
        actualizarProductosEnGestion();
        
        // Restablecer formulario y mostrar notificación
        document.getElementById('add-product-form').reset();
        document.getElementById('add-product-form').classList.add('hidden');
        document.querySelector('.dashboard-actions').style.marginBottom = '1.5rem';
        mostrarNotificacion('Producto agregado correctamente');
    });
}

// Configurar formulario de contacto
function setupContactForm() {
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const mensaje = document.getElementById('mensaje').value;
        
        // En una aplicación real, aquí se enviaría el formulario a un servidor
        alert(`¡Gracias por contactarnos, ${nombre}! Recibiremos tu mensaje y te responderemos pronto.`);
        
        // Restablecer formulario
        this.reset();
        mostrarNotificacion('Mensaje enviado con éxito');
    });
}

// Funciones auxiliares

// Encontrar producto por ID
function findProductById(productId) {
    for (const marca in marcas) {
        const product = marcas[marca].products.find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Agregar producto al carrito
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Habilitar el botón de checkout si hay productos en el carrito
    if (cart.length > 0) {
        document.getElementById('checkout-btn').disabled = false;
    }
}

// Actualizar la cantidad de un producto en el carrito
function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
    }
}

// Remover producto del carrito
function removeItemFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Deshabilitar el botón de checkout si el carrito está vacío
    if (cart.length === 0) {
        document.getElementById('checkout-btn').disabled = true;
    }
}

// Actualizar el carrito en el DOM
function actualizarCarrito() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        cartTotalElement.innerHTML = '<p>Total: $0</p>';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                    <div class="cart-item-description">${item.description}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" data-product="${item.id}" data-action="decrease">-</button>
                        <input type="number" class="quantity-input" data-product="${item.id}" value="${item.quantity}" min="1">
                        <button class="quantity-btn" data-product="${item.id}" data-action="increase">+</button>
                    </div>
                    <button class="remove-item" data-product="${item.id}">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.innerHTML = `<p>Total: $${total.toLocaleString()}</p>`;
    
    // Añadir eventos a los botones de cantidad y eliminar (solo para los nuevos elementos)
    document.querySelectorAll('.quantity-btn[data-action="decrease"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const item = cart.find(item => item.id === productId);
            if (item && item.quantity > 1) {
                updateCartItemQuantity(productId, item.quantity - 1);
                actualizarCarrito();
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn[data-action="increase"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity + 1);
                actualizarCarrito();
            }
        });
    });
    
    // Añadir eventos a los nuevos botones de eliminar
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            removeItemFromCart(productId);
            actualizarCarrito();
            mostrarNotificacion('Producto eliminado del carrito');
        });
    });
}

// Actualizar productos en el DOM (sección de marcas)
function actualizarProductosEnDOM() {
    for (const marca in marcas) {
        const marcaElement = document.getElementById(marca);
        const productosElement = marcaElement.querySelector('.productos');
        
        if (marcas[marca].products.length > 0) {
            let productosHTML = '';
            
            marcas[marca].products.forEach(product => {
                productosHTML += `
                    <div class="producto">
                        <img src="${product.image}" alt="${product.name}">
                        <h4>${product.name}</h4>
                        <p class="precio">$${product.price.toLocaleString()}</p>
                        <p class="descripcion">${product.description}</p>
                        <button class="add-to-cart" data-product="${product.id}">Añadir al Carrito</button>
                    </div>
                `;
            });
            
            productosElement.innerHTML = productosHTML;
        } else {
            productosElement.innerHTML = '<p>No hay productos disponibles para esta marca.</p>';
        }
    }
    
    // Volver a añadir eventos a los botones de agregar al carrito (necesario después de actualizar el DOM)
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const product = findProductById(productId);
            
            if (product) {
                addToCart(product);
                actualizarCarrito();
                mostrarNotificacion(`Producto "${product.name}" agregado al carrito`);
            }
        });
    });
}

// Actualizar productos en gestión (sección de vendedores)
function actualizarProductosEnGestion() {
    const selectedMarca = document.getElementById('marca-select').value;
    const productosList = document.getElementById('products-list');
    
    if (marcas[selectedMarca].products.length > 0) {
        let productosHTML = '';
        
        marcas[selectedMarca].products.forEach(product => {
            productosHTML += `
                <div class="product-item">
                    <div class="product-item-info">
                        <div class="product-item-name">${product.name}</div>
                        <div class="product-item-price">$${product.price.toLocaleString()}</div>
                        <div class="product-item-description">${product.description}</div>
                    </div>
                    <div class="product-item-actions">
                        <button class="edit-product-btn" data-product="${product.id}">Editar</button>
                        <button class="delete-product-btn" data-product="${product.id}">Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        productosList.innerHTML = productosHTML;
    } else {
        productosList.innerHTML = '<p>No hay productos para esta marca.</p>';
    }
    
    // Añadir eventos a los nuevos botones de editar y eliminar
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const product = findProductById(productId);
            
            // Preencher el formulario con los datos del producto
            document.getElementById('new-product-name').value = product.name;
            document.getElementById('new-product-price').value = product.price;
            document.getElementById('new-product-desc').value = product.description;
            document.getElementById('new-product-img').value = product.image;
            
            // Mostrar el formulario
            document.getElementById('add-product-form').classList.remove('hidden');
            document.querySelector('.dashboard-actions').style.marginBottom = '2rem';
            
            // Guardar el ID del producto para edición
            document.getElementById('add-product-form').setAttribute('data-edit-id', productId);
            
            mostrarNotificacion('Edite el producto y guarde los cambios');
        });
    });
    
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const product = findProductById(productId);
            
            if (confirm(`¿Está seguro de que desea eliminar el producto "${product.name}"?`)) {
                // Eliminar el producto de la marca correspondiente
                marcas[document.getElementById('marca-select').value].products = 
                    marcas[document.getElementById('marca-select').value].products.filter(p => p.id !== productId);
                
                // Actualizar DOM
                actualizarProductosEnDOM();
                actualizarProductosEnGestion();
                
                mostrarNotificacion('Producto eliminado correctamente');
            }
        });
    });
}

// Mostrar notificación
function mostrarNotificacion(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Si ya existe una notificación, removerla
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Añadir la nueva notificación
    document.body.appendChild(notification);
    
    // Remover la notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Estilos para notificaciones (puedes agregarlos al final de styles.css)
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 5px;
    color: white;
    z-index: 1000;
    transition: opacity 0.3s;
}

.notification.success {
    background-color: var(--success-color);
}

.notification.error {
    background-color: var(--danger-color);
}

.notification.fade-out {
    opacity: 0;
}
`;
document.head.appendChild(style);