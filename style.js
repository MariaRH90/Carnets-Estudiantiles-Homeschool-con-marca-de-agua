function formatearNombre(input) {
    // Guardamos la posición del cursor para que no salte al final
    let posicionCursor = input.selectionStart;
    
    let palabras = input.value.split(" ");
    
    for (let i = 0; i < palabras.length; i++) {
        if (palabras[i]) {
            // Usamos slice(1) que es el estándar actual
            palabras[i] = palabras[i][0].toUpperCase() + palabras[i].slice(1).toLowerCase();
        }
    }
    
    input.value = palabras.join(" ");
    
    // Devolvemos el cursor a su lugar original
    input.setSelectionRange(posicionCursor, posicionCursor);
}

function formatearCedula(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 0) {
        valor = valor.split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.').split('').reverse().join('').replace(/^[\.]/, '');
    }
    input.value = valor;
}

function validarNumeros(input) { input.value = input.value.replace(/\D/g, ''); }

function actualizar() {
    document.getElementById('preNombre').innerText = document.getElementById('inNombre').value || "---";
    document.getElementById('preCedula').innerText = document.getElementById('inCedula').value || "---";
    document.getElementById('preID').innerText = document.getElementById('inID').value || "---";
    document.getElementById('preSexo').innerText = document.getElementById('inSexo').value || "---";
    let f = document.getElementById('inFecha').value;
    if (f) {
        let d = f.split('-');
        document.getElementById('preFecha').innerText = `${d[2]}/${d[1]}/${d[0]}`;
    }
}

function leerFoto(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => document.getElementById('preFoto').src = e.target.result;
        r.readAsDataURL(input.files[0]);
    }
}

function abrirModalConfirmar() {
    const campos = ['inNombre', 'inCedula', 'inID', 'inFecha', 'inSexo'];
    if (campos.some(id => !document.getElementById(id).value.trim()) || !document.getElementById('inFoto').files[0]) {
        alert("⛔ Complete todos los campos."); return;
    }
    document.getElementById('modalConfirmar').style.display = 'flex';
}

function procesarAgregado(confirmado) {
    document.getElementById('modalConfirmar').style.display = 'none';
    if (confirmado) {
        const clon = document.getElementById('borrador').cloneNode(true);
        clon.id = "";
        const wrapper = document.createElement('div');
        wrapper.className = "carnet-wrapper";
        const btnX = document.createElement('button');
        btnX.innerHTML = "✕";
        btnX.className = "btn-eliminar-top";
        btnX.onclick = function () {
            wrapper.remove();
            if (document.querySelectorAll('.carnet-wrapper').length === 0)
                document.getElementById('controles').style.display = 'none';
        };
        wrapper.appendChild(btnX);
        wrapper.appendChild(clon);
        document.getElementById('contenedorCarnets').appendChild(wrapper);
        document.getElementById('controles').style.display = 'block';

        ['inNombre', 'inCedula', 'inID', 'inFecha', 'inSexo', 'inFoto'].forEach(id => document.getElementById(id).value = "");
        document.getElementById('preFoto').src = "";
        actualizar();
    }
}

function abrirModalDescarga() { document.getElementById('modalDescarga').style.display = 'flex'; }
function cerrarModalDescarga() { document.getElementById('modalDescarga').style.display = 'none'; }

async function ejecutarDescargaPDF() {
    cerrarModalDescarga();
    document.getElementById('areaEdicion').classList.add('ocultar');
    document.getElementById('btnGranDescarga').classList.add('ocultar');
    document.getElementById('headerFinal').style.display = 'block';
    document.getElementById('btnDescargarDeNuevo').classList.remove('ocultar');
    document.querySelectorAll('.btn-eliminar-top').forEach(b => b.classList.add('ocultar'));
    await soloDescargar();
}

async function soloDescargar() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'letter');
    const items = document.querySelectorAll('#contenedorCarnets .carnet-diseno');
    const pos = [{ x: 10, y: 15 }, { x: 110, y: 15 }, { x: 10, y: 120 }, { x: 110, y: 120 }];
    for (let i = 0; i < items.length; i++) {
        if (i > 0 && i % 4 === 0) pdf.addPage();
        const canvas = await html2canvas(items[i], { scale: 3, useCORS: true });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', pos[i % 4].x, pos[i % 4].y, 90, 58);
    }
    pdf.save("CARNETS_ESTUDIANTILES_OFICIALES.pdf");
}

function ajustarMarcaAgua() {
    const marcas = document.querySelectorAll('.marca_de_agua img');
    marcas.forEach(img => {
        const carnet = img.closest('.carnet-diseno');
        if (carnet) {
            // Ajusta el tamaño al 60% del ancho del carnet
            img.style.width = (carnet.offsetWidth * 0.6) + 'px';
        }
    });
}

// Llama a esta función después de agregar cada carnet
// y también en window.resize
window.addEventListener('resize', ajustarMarcaAgua);

// ===== CONTROL SIMPLE DE ACCESO =====

// Verificar al cargar
if (localStorage.getItem('carnet_completado') === 'true') {
    // Ocultar todo el formulario
    document.getElementById('areaEdicion').style.display = 'none';
    
    // Mostrar solo descarga
    document.getElementById('controles').style.display = 'block';
    document.getElementById('btnDescargarDeNuevo').classList.remove('ocultar');
    document.getElementById('headerFinal').style.display = 'block';
    
    // Mensaje
    alert('⚠️ Ya has generado tu carnet. Solo puedes descargar el PDF.');
}

// Modificar la función ejecutarDescargaPDF
async function ejecutarDescargaPDF() {
    cerrarModalDescarga();
    
    // Marcar como completado
    localStorage.setItem('carnet_completado', 'true');
    
    // Resto del código...
    document.getElementById('areaEdicion').classList.add('ocultar');
    document.getElementById('btnGranDescarga').classList.add('ocultar');
    document.getElementById('headerFinal').style.display = 'block';
    document.getElementById('btnDescargarDeNuevo').classList.remove('ocultar');
    
    await soloDescargar();
}