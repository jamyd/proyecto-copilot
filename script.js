// Gestión de usuario actual
let currentUser = localStorage.getItem('usuarioActual') || 'Administrador';

function setUser(user) {
    // Mensajes personalizados por usuario
    let title = '';
    let msg = '';
    if (user === 'Administrador') {
        title = 'Administrador';
        msg = 'Acceso total: puede agregar, buscar, editar, eliminar productos y eliminar duplicados.';
    } else if (user.startsWith('Caja')) {
        title = user;
        const aid = localStorage.getItem('aidCaja_' + user) || '';
        const email = localStorage.getItem('emailCaja_' + user) || '';
        msg = `Solo puede agregar y buscar productos. No puede editar, eliminar ni eliminar duplicados.<br><b>AID:</b> ${aid}<br><b>Correo:</b> ${email}`;
    } else if (user === 'Bodega') {
        title = 'Bodega';
        msg = 'Puede agregar, buscar y eliminar productos. No puede editar ni eliminar duplicados.';
    } else {
        title = user;
        msg = 'Solo puede agregar y buscar productos.';
    }
    showUserModal(title, msg);

    // Modal de usuario
    function showUserModal(title, msg) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMsg').innerHTML = msg;
        document.getElementById('userModal').style.display = 'block';
    }

    document.getElementById('closeModal').onclick = function() {
        document.getElementById('userModal').style.display = 'none';
    }

    window.onclick = function(event) {
        const modal = document.getElementById('userModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
    currentUser = user;
    localStorage.setItem('usuarioActual', user);
    document.getElementById('currentUser').textContent = `Usuario actual: ${user}`;

    // Permisos por usuario
    // Acciones
    const btnAgregar = document.querySelector('#productForm button[type="submit"]');
    const btnEditar = document.querySelector('#editForm button[type="submit"]');
    const btnBuscarEditar = document.querySelector('button[onclick="showEditForm()"]');
    const btnEliminar = document.querySelector('button[onclick="deleteProductById()"]');
    const btnEliminarDuplicados = document.querySelector('button[onclick="removeDuplicates()"]');
    // Mostrar/ocultar según usuario
    if (user === 'Administrador') {
        btnAgregar.disabled = false;
        btnEditar.disabled = false;
        btnBuscarEditar.disabled = false;
        btnEliminar.disabled = false;
        btnEliminarDuplicados.disabled = false;
        document.getElementById('msgAgregar').textContent = '';
        document.getElementById('msgAcciones').textContent = '';
        document.getElementById('msgInventario').textContent = '';
        document.getElementById('msgEditar').textContent = '';
    } else if (user.startsWith('Caja')) {
        btnAgregar.disabled = false;
        btnEditar.disabled = true;
        btnBuscarEditar.disabled = true;
        btnEliminar.disabled = true;
        btnEliminarDuplicados.disabled = true;
        document.getElementById('msgAgregar').textContent = '';
        document.getElementById('msgAcciones').textContent = 'Solo puedes agregar y buscar productos.';
        document.getElementById('msgInventario').textContent = '';
        document.getElementById('msgEditar').textContent = 'No tienes permiso para editar productos.';
    } else if (user === 'Bodega') {
        btnAgregar.disabled = false;
        btnEditar.disabled = true;
        btnBuscarEditar.disabled = true;
        btnEliminar.disabled = false;
        btnEliminarDuplicados.disabled = true;
        document.getElementById('msgAgregar').textContent = '';
        document.getElementById('msgAcciones').textContent = 'Puedes agregar, buscar y eliminar productos.';
        document.getElementById('msgInventario').textContent = '';
        document.getElementById('msgEditar').textContent = 'No tienes permiso para editar productos.';
    } else {
        btnAgregar.disabled = false;
        btnEditar.disabled = true;
        btnBuscarEditar.disabled = true;
        btnEliminar.disabled = true;
        btnEliminarDuplicados.disabled = true;
        document.getElementById('msgAgregar').textContent = '';
        document.getElementById('msgAcciones').textContent = 'Solo puedes agregar y buscar productos.';
        document.getElementById('msgInventario').textContent = '';
        document.getElementById('msgEditar').textContent = 'No tienes permiso para editar productos.';
    }
}

// Mostrar/ocultar campos de AID y correo para cajas
window.showCajaFields = function() {
    const user = document.getElementById('userSelect').value;
    const aidInput = document.getElementById('aidCaja');
    const emailInput = document.getElementById('emailCaja');
    if (user.startsWith('Caja')) {
        aidInput.style.display = '';
        emailInput.style.display = '';
        aidInput.required = true;
        emailInput.required = true;
    } else {
        aidInput.style.display = 'none';
        emailInput.style.display = 'none';
        aidInput.required = false;
        emailInput.required = false;
    }
}

document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('userSelect').value;
    let aid = '';
    let email = '';
    if (user.startsWith('Caja')) {
        aid = document.getElementById('aidCaja').value;
        email = document.getElementById('emailCaja').value;
        if (!/^\d{4}$/.test(aid)) {
            alert('El AID debe ser de 4 dígitos.');
            return;
        }
        if (!/^.+@gmail\.com$/.test(email)) {
            alert('El correo debe ser @gmail.com');
            return;
        }
        localStorage.setItem('aidCaja_' + user, aid);
        localStorage.setItem('emailCaja_' + user, email);
    }
    // Registrar ingreso en historial

    registrarHistorialIngreso(user);
    setUser(user);
});

// Registrar ingreso en historial y mostrarlo (global)
function registrarHistorialIngreso(user) {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString();
    const hora = ahora.toLocaleTimeString();
    let aid = '';
    let email = '';
    if (user.startsWith('Caja')) {
        aid = localStorage.getItem('aidCaja_' + user) || '';
        email = localStorage.getItem('emailCaja_' + user) || '';
    }
    let historial = JSON.parse(localStorage.getItem('historialUsuarios') || '[]');
    historial.push({ usuario: user, fecha, hora, aid, email });
    localStorage.setItem('historialUsuarios', JSON.stringify(historial));
    mostrarHistorialUsuarios();
}

function mostrarHistorialUsuarios() {
    let historial = JSON.parse(localStorage.getItem('historialUsuarios') || '[]');
    const div = document.getElementById('historialUsuarios');
    if (!div) return;
    if (historial.length === 0) {
        div.innerHTML = '<em>No hay ingresos registrados.</em>';
        return;
    }
    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<thead><tr><th>Usuario</th><th>Fecha</th><th>Hora ingreso</th><th>AID</th><th>Correo</th><th>Hora salida</th><th>Acción</th></tr></thead><tbody>';
    historial.forEach((item, idx) => {
        html += `<tr>
            <td>${item.usuario}</td>
            <td>${item.fecha}</td>
            <td>${item.hora}</td>
            <td>${item.aid || ''}</td>
            <td>${item.email || ''}</td>
            <td>${item.salida || ''}</td>
            <td>${item.salida ? '' : `<button onclick="registrarSalidaUsuario(${idx})">Salir</button>`}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    div.innerHTML = html;
}

window.registrarSalidaUsuario = function(idx) {
    let historial = JSON.parse(localStorage.getItem('historialUsuarios') || '[]');
    const ahora = new Date();
    const horaSalida = ahora.toLocaleTimeString();
    historial[idx].salida = horaSalida;
    localStorage.setItem('historialUsuarios', JSON.stringify(historial));
    mostrarHistorialUsuarios();
}

window.addEventListener('DOMContentLoaded', () => {
    setUser(currentUser);
    mostrarHistorialUsuarios();
});

// Actualización en tiempo real desde otras pestañas
window.addEventListener('storage', function(event) {
    if (event.key === 'historialUsuarios') {
        mostrarHistorialUsuarios();
    }
});

// Mostrar usuario al cargar
window.addEventListener('DOMContentLoaded', () => {
    setUser(currentUser);
});
// Mostrar formulario de edición con datos del producto
window.showEditForm = function() {
    const id = document.getElementById('editSearchId').value.trim();
    if (!id) {
        alert('Ingresa un ID para buscar.');
        return;
    }
    let found = null;
    bst.inOrderTraversal(product => {
        if (product.id === id) found = product;
    });
    if (found) {
        document.getElementById('editForm').style.display = 'flex';
        document.getElementById('editId').value = found.id;
        document.getElementById('editName').value = found.name;
        document.getElementById('editCategory').value = found.category;
        document.getElementById('editPrice').value = found.price;
        document.getElementById('editQuantity').value = found.quantity;
        document.getElementById('editUnit').value = found.unit;
    } else {
        alert('No se encontró producto con ese ID.');
        document.getElementById('editForm').style.display = 'none';
    }
}

// Guardar cambios del producto editado
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value.trim();
    const category = document.getElementById('editCategory').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const unit = document.getElementById('editUnit').value;
    if (name && category && !isNaN(price) && !isNaN(quantity) && unit) {
        // Buscar el producto original por ID y obtener su nombre
        let originalName = null;
        bst.inOrderTraversal(product => {
            if (product.id === id) originalName = product.name;
        });
        if (originalName) {
            // Eliminar el producto original
            bst.delete(originalName);
            // Insertar el producto editado con el mismo ID
            bst.insert({ id, name, category, price, quantity, unit });
            saveToStorage();
            renderInventory();
            document.getElementById('editForm').style.display = 'none';
            alert('Producto editado correctamente.');
        }
    }
});
// Eliminar productos duplicados

window.removeDuplicates = function() {
    const seen = {};
    const toDeleteNames = [];
    const products = [];
    // Recolectar todos los productos
    bst.inOrderTraversal(product => {
        products.push(product);
    });
    // Agrupar por clave y dejar solo uno
    products.forEach(product => {
        const key = `${product.name.toLowerCase()}|${product.category}|${product.unit}|${product.price}`;
        if (!seen[key]) {
            seen[key] = product;
        } else {
            toDeleteNames.push(product.name);
        }
    });
    // Eliminar todos los duplicados
    toDeleteNames.forEach(name => bst.delete(name));
    saveToStorage();
    renderInventory();
    if (toDeleteNames.length > 0) {
        alert(`Se eliminaron ${toDeleteNames.length} productos duplicados.`);
    } else {
        alert('No se encontraron productos duplicados.');
    }
}
// Estructura de datos: Árbol Binario de Búsqueda para productos
class ProductNode {
    constructor(product) {
        this.product = product;
        this.left = null;
        this.right = null;
    }
}

class ProductBST {
    constructor() {
        this.root = null;
    }

    insert(product) {
        if (this.count() >= 50) {
            alert('Solo se permiten hasta 50 productos.');
            return;
        }
        const newNode = new ProductNode(product);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        let current = this.root;
        while (true) {
            if (product.name.toLowerCase() < current.product.name.toLowerCase()) {
                if (!current.left) {
                    current.left = newNode;
                    return;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return;
                }
                current = current.right;
            }
        }
    }

    // Contar productos en el BST
    count() {
        let total = 0;
        this.inOrderTraversal(() => { total++; });
        return total;
    }
    search(name) {
        let current = this.root;
        name = name.toLowerCase();
        while (current) {
            if (name === current.product.name.toLowerCase()) {
                return current.product;
            } else if (name < current.product.name.toLowerCase()) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null;
    }

    delete(name) {
        this.root = this._deleteRec(this.root, name.toLowerCase());
    }

    _deleteRec(node, name) {
        if (!node) return null;
        if (name < node.product.name.toLowerCase()) {
            node.left = this._deleteRec(node.left, name);
        } else if (name > node.product.name.toLowerCase()) {
            node.right = this._deleteRec(node.right, name);
        } else {
            // Nodo encontrado
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            // Nodo con dos hijos
            let minNode = this._minValueNode(node.right);
            node.product = minNode.product;
            node.right = this._deleteRec(node.right, minNode.product.name.toLowerCase());
        }
        return node;
    }

    _minValueNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    inOrderTraversal(callback) {
        this._inOrder(this.root, callback);
    }

    _inOrder(node, callback) {
        if (node) {
            this._inOrder(node.left, callback);
            callback(node.product);
            this._inOrder(node.right, callback);
        }
    }
}

// Instancia global del BST
const bst = new ProductBST();

// Cargar productos desde localStorage al iniciar
function loadFromStorage() {
    const data = localStorage.getItem('productosBST');
    if (data) {
        try {
            const arr = JSON.parse(data);
            arr.forEach(product => bst.insert(product));
        } catch {}
    }
}

// Guardar productos en localStorage
function saveToStorage() {
    const productos = [];
    bst.inOrderTraversal(product => productos.push(product));
    localStorage.setItem('productosBST', JSON.stringify(productos));
}

loadFromStorage();
// Manejo de formulario
const form = document.getElementById('productForm');
function generateProductId() {
    const numbers = Math.floor(1000 + Math.random() * 9000).toString();
    const letters = Array.from({length: 3}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    return numbers + letters;
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const category = document.getElementById('category').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    if (name && category && !isNaN(price) && !isNaN(quantity) && unit) {
        const id = generateProductId();
        bst.insert({ id, name, category, price, quantity, unit });
        saveToStorage();
        form.reset();
        renderInventory();
    }
});

function renderInventory() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';
    const categoryCount = {};
    bst.inOrderTraversal(product => {
        // Contar por categoría
        if (product.category) {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        }
        // Renderizar fila
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id || 'N/A'}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>${product.quantity}</td>
            <td>${product.unit || ''}</td>
        `;
        tableBody.appendChild(row);
    });

    // Mostrar resumen por categoría
    const summaryDiv = document.getElementById('categorySummary');
    if (Object.keys(categoryCount).length === 0) {
        summaryDiv.textContent = 'No hay productos registrados.';
    } else {
        summaryDiv.innerHTML = '<strong>Total por categoría:</strong><br>' +
            Object.entries(categoryCount)
                .map(([cat, count]) => `${cat}: <b>${count}</b>`)
                .join(' | ');
    }
}


// Buscar por nombre
window.searchProductByName = function() {
    const name = document.getElementById('searchName').value.trim();
    if (name) {
        const product = bst.search(name);
        if (product) {
            alert(`Encontrado: ${product.name} | ${product.category} | $${product.price} | Cantidad: ${product.quantity} | Unidad: ${product.unit || ''} | ID: ${product.id}`);
        } else {
            alert('Producto no encontrado');
        }
    }
}

// Buscar por ID
window.searchProductById = function() {
    const id = document.getElementById('searchId').value.trim();
    if (id) {
        let found = null;
        bst.inOrderTraversal(product => {
            if (product.id === id) found = product;
        });
        if (found) {
            alert(`Encontrado: ${found.name} | ${found.category} | $${found.price} | Cantidad: ${found.quantity} | Unidad: ${found.unit || ''} | ID: ${found.id}`);
        } else {
            alert('Producto no encontrado');
        }
    }
}


// Eliminar por ID
window.deleteProductById = function() {
    const id = document.getElementById('deleteId').value.trim();
    if (id) {
        // Buscar el nombre del producto con ese ID
        let nameToDelete = null;
        bst.inOrderTraversal(product => {
            if (product.id === id) nameToDelete = product.name;
        });
        if (nameToDelete) {
            bst.delete(nameToDelete);
            saveToStorage();
            renderInventory();
            alert('Producto eliminado por ID');
        } else {
            alert('No se encontró producto con ese ID');
        }
    }
}
// Actualizar inventario al cargar la página
renderInventory();

window.addEventListener('storage', function(event) {
    if (event.key === 'historialUsuarios') {
        mostrarHistorialUsuarios();
    }
});
