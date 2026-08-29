// URL do servidor Back-end no Render
const API_URL = "https://SEU-SERVIDOR-BACKEND.onrender.com";
const PRECO_COTA = 2.99;
let quantidadeSelecionada = 1;

// Elementos da DOM
const qtdManual = document.getElementById('qtdManual');
const valorTotalEl = document.getElementById('valorTotal');
const dockTotalEl = document.getElementById('dockTotal');
const summaryQtdEl = document.getElementById('summaryQtd');
const tiles = document.querySelectorAll('.cota-tile');
const cpfInput = document.getElementById('cpfInput');

// Atualizar valor total
function atualizarTotal(qtd) {
    quantidadeSelecionada = parseInt(qtd) || 1;
    if (quantidadeSelecionada < 1) quantidadeSelecionada = 1;
    
    qtdManual.value = quantidadeSelecionada;
    summaryQtdEl.textContent = `${quantidadeSelecionada} cota${quantidadeSelecionada > 1 ? 's' : ''}`;
    
    const total = (quantidadeSelecionada * PRECO_COTA).toFixed(2).replace('.', ',');
    valorTotalEl.textContent = `R$ ${total}`;
    dockTotalEl.textContent = `R$ ${total}`;
}

// Botões rápidos de cota
tiles.forEach(tile => {
    tile.addEventListener('click', () => {
        tiles.forEach(t => t.classList.remove('active'));
        tile.classList.add('active');
        const qtd = tile.getAttribute('data-qtd');
        atualizarTotal(qtd);
    });
});

// Incremento e decremento (+ e -)
document.getElementById('btnMinus').addEventListener('click', () => {
    tiles.forEach(t => t.classList.remove('active'));
    atualizarTotal(quantidadeSelecionada - 1);
});

document.getElementById('btnPlus').addEventListener('click', () => {
    tiles.forEach(t => t.classList.remove('active'));
    atualizarTotal(quantidadeSelecionada + 1);
});

qtdManual.addEventListener('input', (e) => {
    tiles.forEach(t => t.classList.remove('active'));
    atualizarTotal(e.target.value);
});

// Rolagem suave ao clicar na barra inferior no celular
document.getElementById('btnDockPagar').addEventListener('click', () => {
    document.getElementById('secaoCheckout').scrollIntoView({ behavior: 'smooth' });
});

// Máscara de CPF para iPhone
cpfInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
});

// Menu Drawer
const openMenu = document.getElementById('openMenu');
const closeMenu = document.getElementById('closeMenu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

openMenu.addEventListener('click', toggleSidebar);
closeMenu.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

// Accordion
const btnRegulamento = document.getElementById('btnRegulamento');
const panelRegulamento = document.getElementById('panelRegulamento');

btnRegulamento.addEventListener('click', () => {
    panelRegulamento.classList.toggle('show');
});

// Modais
const modalPix = document.getElementById('modalPix');
const modalBilhetes = document.getElementById('modalBilhetes');
const modalInfo = document.getElementById('modalInfo');

document.getElementById('closePix').onclick = () => modalPix.classList.remove('active');
document.getElementById('closeBilhetes').onclick = () => modalBilhetes.classList.remove('active');
document.getElementById('closeInfo').onclick = () => modalInfo.classList.remove('active');

document.getElementById('menuMeusBilhetes').onclick = (e) => {
    e.preventDefault(); toggleSidebar(); modalBilhetes.classList.add('active');
};

document.getElementById('menuTermos').onclick = (e) => {
    e.preventDefault(); toggleSidebar();
    document.getElementById('titleInfo').textContent = "Termos de Uso";
    document.getElementById('bodyInfo').innerHTML = "<p style='color:#94a3b8; font-size:0.88rem; line-height:1.5;'>Sorteio transparente. Os bilhetes reservados não pagos dentro de 15 minutos são automaticamente reabertos no sistema.</p>";
    modalInfo.classList.add('active');
};

document.getElementById('menuSuporte').onclick = (e) => {
    e.preventDefault(); toggleSidebar();
    document.getElementById('titleInfo').textContent = "Suporte WhatsApp";
    document.getElementById('bodyInfo').innerHTML = "<p style='color:#94a3b8; font-size:0.88rem; line-height:1.5;'>Precisa de ajuda? Entre em contato diretamente pelo WhatsApp do organizador.</p>";
    modalInfo.classList.add('active');
};

// Checkout Form Submission
document.getElementById('formCheckout').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cpf = cpfInput.value;
    if (cpf.length < 14) {
        alert("Por favor, digite um CPF válido.");
        return;
    }

    const valorTotal = (quantidadeSelecionada * PRECO_COTA).toFixed(2);
    const cotas = Array.from({length: quantidadeSelecionada}, () => Math.floor(100000 + Math.random() * 900000));

    try {
        const response = await fetch(`${API_URL}/api/criar-pix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf, quantidade: quantidadeSelecionada, valorTotal, cotasSelecionadas: cotas })
        });

        const data = await response.json();

        if (data.sucesso) {
            document.getElementById('inputPixCode').value = data.qrCode;
            if(data.qrCodeBase64) {
                const img = document.getElementById('imgQrCode');
                img.src = `data:image/png;base64,${data.qrCodeBase64}`;
                img.style.display = 'block';
            }
            modalPix.classList.add('active');
        } else {
            alert(data.erro || "Erro ao gerar chave PIX.");
        }
    } catch (err) {
        alert("Modo de teste: O servidor Back-end precisa estar no ar para gerar o PIX real.");
    }
});

// Copiar PIX
document.getElementById('btnCopiarPix').addEventListener('click', () => {
    const copyText = document.getElementById('inputPixCode');
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Código PIX copiado com sucesso!");
});

// Buscar Bilhetes
document.getElementById('btnBuscarBilhetes').addEventListener('click', async () => {
    const cpf = document.getElementById('cpfConsulta').value;
    const resDiv = document.getElementById('resultadoBilhetes');
    resDiv.innerHTML = "<p style='color:#94a3b8;'>Buscando bilhetes...</p>";

    try {
        const response = await fetch(`${API_URL}/api/bilhetes/${cpf}`);
        const data = await response.json();

        if (data.length === 0) {
            resDiv.innerHTML = "<p style='color:#94a3b8; margin-top:10px;'>Nenhum bilhete encontrado.</p>";
            return;
        }

        resDiv.innerHTML = data.map(b => `
            <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:12px; margin-top:10px; text-align:left;">
                <p style="color:#60a5fa; font-weight:700;">Status: ${b.status}</p>
                <p style="font-size:0.85rem; color:#f8fafc; margin-top:4px;">Cotas: ${JSON.parse(b.cotas).join(', ')}</p>
                <p style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Total: R$ ${b.valor_total}</p>
            </div>
        `).join('');
    } catch (err) {
        resDiv.innerHTML = "<p style='color:#ef4444; margin-top:10px;'>Erro ao buscar bilhetes.</p>";
    }
});
