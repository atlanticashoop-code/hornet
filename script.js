// Arquivo: script.js

document.addEventListener('DOMContentLoaded', () => {
    const PRECO = 2.99;
    let qtd = 10;

    const qtdInput = document.getElementById('qtdInput');
    const dockVal = document.getElementById('dockVal');
    const buttons = document.querySelectorAll('.btn-cota-rds');

    // Atualiza o valor total com base nas cotas selecionadas
    function update(val) {
        qtd = parseInt(val) || 1;
        if (qtd < 1) qtd = 1;
        if (qtdInput) qtdInput.value = qtd;
        const total = (qtd * PRECO).toFixed(2).replace('.', ',');
        if (dockVal) dockVal.textContent = `R$ ${total}`;
    }

    // Clique nos botões de cota rápida (+5, +10, +50, +100)
    buttons.forEach(b => {
        b.onclick = () => {
            buttons.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            update(b.getAttribute('data-qtd'));
        };
    });

    // Controles do Incremento/Decremento (+ e -)
    const btnLess = document.getElementById('btnLess');
    const btnMore = document.getElementById('btnMore');
    if (btnLess) btnLess.onclick = () => { buttons.forEach(x => x.classList.remove('active')); update(qtd - 1); };
    if (btnMore) btnMore.onclick = () => { buttons.forEach(x => x.classList.remove('active')); update(qtd + 1); };
    if (qtdInput) qtdInput.oninput = (e) => { buttons.forEach(x => x.classList.remove('active')); update(e.target.value); };

    /* CARROSSEL DE FOTOS */
    let currentSlide = 0;
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        currentSlide = index;
        if (track) track.style.transform = `translateX(-${currentSlide * 50}%)`;
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });
    }

    const nextBtn = document.getElementById('nextSlide');
    const prevBtn = document.getElementById('prevSlide');
    if (nextBtn) nextBtn.onclick = () => goToSlide(currentSlide === 0 ? 1 : 0);
    if (prevBtn) prevBtn.onclick = () => goToSlide(currentSlide === 1 ? 0 : 1);
    dots.forEach((dot, idx) => dot.onclick = () => goToSlide(idx));

    /* GAVETA LATERAL / MENU */
    const drawerMenu = document.getElementById('drawerMenu');
    const drawerOverlay = document.getElementById('drawerOverlay');

    function openDrawer() {
        if (drawerMenu && drawerOverlay) {
            drawerMenu.classList.add('active');
            drawerOverlay.classList.add('active');
        }
    }

    function closeDrawer() {
        if (drawerMenu && drawerOverlay) {
            drawerMenu.classList.remove('active');
            drawerOverlay.classList.remove('active');
        }
    }

    const openDrawerBtn = document.getElementById('openDrawer');
    const closeDrawerBtn = document.getElementById('closeDrawer');
    if (openDrawerBtn) openDrawerBtn.onclick = openDrawer;
    if (closeDrawerBtn) closeDrawerBtn.onclick = closeDrawer;
    if (drawerOverlay) drawerOverlay.onclick = closeDrawer;

    /* MODAIS */
    const modalConsulta = document.getElementById('modalConsulta');
    const modalRegulamento = document.getElementById('modalRegulamento');
    const modalTermos = document.getElementById('modalTermos');
    const modalPix = document.getElementById('modalPix');

    function openModal(modal) {
        closeDrawer();
        if (modal) modal.classList.add('active');
    }

    const btnMeusNumeros = document.getElementById('btnMeusNumeros');
    const navMeusBilhetes = document.getElementById('navMeusBilhetes');
    const closeConsulta = document.getElementById('closeConsulta');
    if (btnMeusNumeros) btnMeusNumeros.onclick = () => openModal(modalConsulta);
    if (navMeusBilhetes) navMeusBilhetes.onclick = (e) => { e.preventDefault(); openModal(modalConsulta); };
    if (closeConsulta) closeConsulta.onclick = () => modalConsulta.classList.remove('active');

    const navRegulamento = document.getElementById('navRegulamento');
    const footRegulamento = document.getElementById('footRegulamento');
    const closeRegulamento = document.getElementById('closeRegulamento');
    if (navRegulamento) navRegulamento.onclick = (e) => { e.preventDefault(); openModal(modalRegulamento); };
    if (footRegulamento) footRegulamento.onclick = (e) => { e.preventDefault(); openModal(modalRegulamento); };
    if (closeRegulamento) closeRegulamento.onclick = () => modalRegulamento.classList.remove('active');

    const navTermos = document.getElementById('navTermos');
    const footTermos = document.getElementById('footTermos');
    const closeTermos = document.getElementById('closeTermos');
    if (navTermos) navTermos.onclick = (e) => { e.preventDefault(); openModal(modalTermos); };
    if (footTermos) footTermos.onclick = (e) => { e.preventDefault(); openModal(modalTermos); };
    if (closeTermos) closeTermos.onclick = () => modalTermos.classList.remove('active');

    const navInicio = document.getElementById('navInicio');
    if (navInicio) {
        navInicio.onclick = (e) => {
            e.preventDefault();
            closeDrawer();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    /* COPIAR CÓDIGO PIX COPIA E COLA */
    const closePix = document.getElementById('closePix');
    const btnCopiar = document.getElementById('btnCopiar');
    if (closePix) closePix.onclick = () => modalPix.classList.remove('active');
    if (btnCopiar) {
        btnCopiar.onclick = () => {
            const pixInput = document.getElementById('pixCode');
            if (pixInput) {
                pixInput.select();
                navigator.clipboard.writeText(pixInput.value);
                alert('Código Pix Copia e Cola copiado com sucesso!');
            }
        };
    }

    // Botão Flutuante de Pagamento na Barra Inferior
    const btnDockPagar = document.getElementById('btnDockPagar');
    if (btnDockPagar) {
        btnDockPagar.onclick = () => {
            const checkoutSection = document.getElementById('checkoutSection');
            if (checkoutSection) checkoutSection.scrollIntoView({ behavior: 'smooth' });
        };
    }

    /* MÁSCARA AUTOMÁTICA DE CELULAR */
    const phoneField = document.getElementById('phoneField');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d)(\d{4})$/, "$1-$2");
            e.target.value = v;
        });
    }

    /* MÁSCARA AUTOMÁTICA DE CPF */
    const cpfField = document.getElementById('cpfField');
    if (cpfField) {
        cpfField.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });
    }

    /* SUBMISSÃO DO FORMULÁRIO / PIX COPIA E COLA */
    const rdsForm = document.getElementById('rdsForm');
    if (rdsForm) {
        rdsForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const cpf = document.getElementById('cpfField') ? document.getElementById('cpfField').value.replace(/\D/g, '') : '';
            const telefone = document.getElementById('phoneField') ? document.getElementById('phoneField').value.replace(/\D/g, '') : '';
            const totalValor = parseFloat((qtd * PRECO).toFixed(2));
            const btnSubmit = rdsForm.querySelector('.btn-comprar-green');
            
            if (telefone.length < 10) {
                alert('Por favor, informe um número de celular válido com DDD.');
                return;
            }

            if (cpf.length !== 11) {
                alert('Por favor, informe um CPF válido.');
                return;
            }

            btnSubmit.innerText = 'GERANDO PIX...';
            btnSubmit.disabled = true;

            try {
                const response = await fetch('/api/pix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf, telefone, valor: totalValor, qtd })
                });

                const data = await response.json();

                if (response.ok && data.qr_code) {
                    const pixInput = document.getElementById('pixCode');
                    if (pixInput) pixInput.value = data.qr_code;
                    
                    if (modalPix) modalPix.classList.add('active');

                    navigator.clipboard.writeText(data.qr_code).then(() => {
                        alert('Código Pix Copia e Cola gerado e copiado automaticamente!');
                    }).catch(() => {
                        alert('Código Pix Copia e Cola gerado! Clique no botão para copiar.');
                    });

                } else {
                    alert('Erro Mercado Pago: ' + (data.message || 'Verifique os dados informados.'));
                    console.error('Detalhes do erro:', data);
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor de pagamento.');
                console.error(error);
            } finally {
                btnSubmit.innerText = 'PAGAR COM PIX AGORA 🍀';
                btnSubmit.disabled = false;
            }
        };
    }

    /* BUSCAR MEUS BILHETES E ABRIR NOVA PÁGINA */
    const btnBuscarBilhetes = document.getElementById('btnBuscarBilhetes');
    if (btnBuscarBilhetes) {
        btnBuscarBilhetes.onclick = async () => {
            const inputCpf = document.getElementById('inputCpfBusca');
            const cpf = inputCpf ? inputCpf.value.replace(/\D/g, '') : '';

            if (!cpf || cpf.length !== 11) {
                alert('Por favor, informe um CPF válido com 11 dígitos.');
                return;
            }

            btnBuscarBilhetes.innerText = 'BUSCANDO...';
            btnBuscarBilhetes.disabled = true;

            try {
                const response = await fetch('/api/meus-bilhetes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cpf })
                });

                const data = await response.json();

                if (!response.ok || !data.sucesso) {
                    alert(data.message || 'Erro ao consultar bilhetes.');
                    return;
                }

                if (!data.compras || data.compras.length === 0) {
                    alert('Nenhum bilhete encontrado para este CPF.');
                    return;
                }

                // Fecha o modal de consulta
                if (modalConsulta) modalConsulta.classList.remove('active');

                // Renderiza e abre a nova tela full-screen de bilhetes
                exibirPaginaBilhetes(cpf, data.compras);

            } catch (err) {
                console.error('Erro ao consultar bilhetes:', err);
                alert('Erro ao conectar ao servidor de consulta.');
            } finally {
                btnBuscarBilhetes.innerText = 'CONSULTAR';
                btnBuscarBilhetes.disabled = false;
            }
        };
    }
});

/* FUNÇÃO PARA EXIBIR A PÁGINA COM OS BILHETES */
function exibirPaginaBilhetes(cpfFormatado, compras) {
    const container = document.getElementById('pagina-meus-bilhetes');
    const infoCpf = document.getElementById('resultado-cpf-info');
    const listaContainer = document.getElementById('lista-compras-container');

    if (!container || !listaContainer) return;

    const cpfMascara = cpfFormatado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    if (infoCpf) {
        infoCpf.innerHTML = `Bilhetes encontrados para o CPF: <strong>${cpfMascara}</strong>`;
    }

    listaContainer.innerHTML = '';

    compras.forEach((compra, index) => {
        const card = document.createElement('div');
        card.className = 'card-compra';

        const statusClass = compra.status === 'pago' ? 'pago' : 'pendente';
        const statusText = compra.status === 'pago' ? 'Pago / Confirmado' : 'Aguardando Pagamento';

        const cotasHtml = Array.isArray(compra.numeros)
            ? compra.numeros.map(n => `<span class="cota-tag">${n}</span>`).join('')
            : '<span>Nenhum número gerado</span>';

        card.innerHTML = `
            <div class="card-compra-header">
                <span>Compra #${compras.length - index} (${compra.qtd} Cotas)</span>
                <span class="badge-status ${statusClass}">${statusText}</span>
            </div>
            <div><strong>Valor:</strong> R$ ${Number(compra.valor || 0).toFixed(2)}</div>
            <div style="margin-top: 10px;">
                <strong>Seus Números:</strong>
                <div class="cotas-grid">${cotasHtml}</div>
            </div>
        `;

        listaContainer.appendChild(card);
    });

    // Exibe a tela de bilhetes
    container.classList.remove('hidden');
}

/* FUNÇÃO PARA FECHAR A PÁGINA DE BILHETES */
function fecharPaginaBilhetes() {
    const container = document.getElementById('pagina-meus-bilhetes');
    if (container) {
        container.classList.add('hidden');
    }
}
