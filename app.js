function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    if (tabId === 'resumen') {
        calculateDailySummary();
    } else {
        loadData();
    }
}

function saveData(tipo, fecha, monto) {
    let data = JSON.parse(localStorage.getItem(tipo)) || [];
    
    // Convertir el monto a un número de punto flotante
    const montoNumerico = parseFloat(monto);

    data.push({ fecha, monto: montoNumerico });
    
    localStorage.setItem(tipo, JSON.stringify(data));
    console.log(`Guardado en localStorage: ${tipo}`);
}

function loadData() {
    ['ventas', 'gastos', 'delivery'].forEach(tipo => {
        const lista = document.getElementById(`lista-${tipo}`);
        lista.innerHTML = '';
        let data = JSON.parse(localStorage.getItem(tipo)) || [];

        data.forEach((item, index) => {
            const registroDiv = document.createElement('div');
            registroDiv.classList.add('registro');
            registroDiv.dataset.index = index;
            registroDiv.dataset.tipo = tipo;

            registroDiv.innerHTML = `
                <span class="fecha">${item.fecha}</span>
                <span class="monto">S/ ${item.monto.toFixed(2)}</span>
                <div class="acciones">
                    <button class="btn-eliminar" data-tipo="${tipo}" data-index="${index}">Eliminar</button>
                </div>
            `;
            lista.appendChild(registroDiv);
        });
    });
}

function deleteData(tipo, index) {
    let data = JSON.parse(localStorage.getItem(tipo));
    data.splice(index, 1);
    localStorage.setItem(tipo, JSON.stringify(data));
    loadData();
}

function calculateDailySummary() {
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    const delivery = JSON.parse(localStorage.getItem('delivery')) || [];

    const resumenDiario = {};

    ventas.forEach(item => {
        if (!resumenDiario[item.fecha]) {
            resumenDiario[item.fecha] = { ventas: 0, gastos: 0, delivery: 0, ganancia: 0 };
        }
        resumenDiario[item.fecha].ventas += item.monto;
    });

    gastos.forEach(item => {
        if (!resumenDiario[item.fecha]) {
            resumenDiario[item.fecha] = { ventas: 0, gastos: 0, delivery: 0, ganancia: 0 };
        }
        resumenDiario[item.fecha].gastos += item.monto;
    });

    delivery.forEach(item => {
        if (!resumenDiario[item.fecha]) {
            resumenDiario[item.fecha] = { ventas: 0, gastos: 0, delivery: 0, ganancia: 0 };
        }
        resumenDiario[item.fecha].delivery += item.monto;
    });

    for (const fecha in resumenDiario) {
        const dia = resumenDiario[fecha];
        dia.ganancia = dia.ventas - dia.gastos + dia.delivery;
    }

    const listaResumen = document.getElementById('lista-resumen');
    listaResumen.innerHTML = '';
    const fechasOrdenadas = Object.keys(resumenDiario).sort().reverse(); 

    fechasOrdenadas.forEach(fecha => {
        const dia = resumenDiario[fecha];
        const resumenDiv = document.createElement('div');
        resumenDiv.classList.add('resumen-dia');
        resumenDiv.innerHTML = `
            <div>
                <h3>Fecha: ${fecha}</h3>
                <p><strong>Ventas:</strong> S/ ${dia.ventas.toFixed(2)}</p>
                <p><strong>Gastos:</strong> S/ ${dia.gastos.toFixed(2)}</p>
                <p><strong>Delivery:</strong> S/ ${dia.delivery.toFixed(2)}</p>
                <p class="resumen-total"><strong>Ganancia Líquida:</strong> S/ ${dia.ganancia.toFixed(2)}</p>
            </div>
        `;
        listaResumen.appendChild(resumenDiv);
    });
}

document.getElementById('form-ventas').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha-venta').value;
    const monto = document.getElementById('monto-venta').value;
    saveData('ventas', fecha, monto);
    loadData();
    document.getElementById('form-ventas').reset();
});

document.getElementById('form-gastos').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha-gasto').value;
    const monto = document.getElementById('monto-gasto').value;
    saveData('gastos', fecha, monto);
    loadData();
    document.getElementById('form-gastos').reset();
});

document.getElementById('form-delivery').addEventListener('submit', (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha-delivery').value;
    const monto = document.getElementById('monto-delivery').value;
    saveData('delivery', fecha, monto);
    loadData();
    document.getElementById('form-delivery').reset();
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
        const tipo = e.target.dataset.tipo;
        const index = parseInt(e.target.dataset.index);
        if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            deleteData(tipo, index);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    showTab('ventas');
    loadData();
});