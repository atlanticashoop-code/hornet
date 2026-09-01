    <script>
        const PRECO = 2.99;
        let qtd = 2;

        const qtdInput = document.getElementById('qtdInput');
        const dockVal = document.getElementById('dockVal');
        const buttons = document.querySelectorAll('.btn-cota-rds');

        function update(val) {
            qtd = parseInt(val) || 1;
            if (qtd < 1) qtd = 1;
            qtdInput.value = qtd;
            const total = (qtd * PRECO).toFixed(2).replace('.', ',');
            dockVal.textContent = `R$ ${total}`;
        }

        buttons.forEach(b => {
            b.onclick = () => {
                buttons.forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                update(b.getAttribute('data-qtd'));
            };
        });

        document.getElementById('btnLess').onclick = () => { buttons.forEach(x => x.classList.remove('active')); update(qtd - 1); };
        document.getElementById('btnMore').onclick = () => { buttons.forEach(x => x.classList.remove('active')); update(qtd + 1); };
        qtdInput.oninput = (e) => { buttons.forEach(x => x.classList.remove('active')); update(e.target.value); };

        /* CARROSSEL */
        let currentSlide = 0;
        const track = document.getElementById('carouselTrack');
        const dots = document.querySelectorAll('.dot');

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 50}%)`;
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlide);
            });
        }

        document.getElementById('nextSlide').onclick = () => goToSlide(currentSlide === 0 ? 1 : 0);
        document.getElementById('prevSlide').onclick = () => goToSlide(currentSlide === 1 ? 0 : 1);
        dots.forEach((dot, idx) => dot.onclick = () => goToSlide(idx));

        /* GAVETA LATERAL */
        const drawerMenu = document.getElementById('drawerMenu');
        const drawerOverlay = document.getElementById('drawerOverlay');

        function openDrawer() {
            drawerMenu.classList.add('active');
            drawerOverlay.classList.add('active');
        }

        function closeDrawer() {
            drawerMenu.classList.remove('active');
            drawerOverlay.classList.remove('active');
        }

        document.getElementById('openDrawer').onclick = openDrawer;
        document.getElementById('closeDrawer').onclick = closeDrawer;
        drawerOverlay.onclick = closeDrawer;

        /* MODAIS */
        const modalConsulta = document.getElementById('modalConsulta');
        const modalRegulamento = document.getElementById('modalRegulamento');
        const modalTermos = document.getElementById('modalTermos');
        const modalPix = document.getElementById('modalPix');

        function openModal(modal) {
            closeDrawer();
            modal.classList.add('active');
        }

        document.getElementById('btnMeusNumeros').onclick = () => {
            const cpfSalvo = localStorage.getItem('ultimoCpfConsultado');
            if (cpfSalvo) {
                exibirMeusBilhetesPorCpf(cpfSalvo);
            } else {
                openModal(modalConsulta);
            }
        };

        document.getElementById('navMeusBilhetes').onclick = (e) => { 
            e.preventDefault(); 
            const cpfSalvo = localStorage.getItem('ultimoCpfConsultado');
            if (cpfSalvo) {
                exibirMeusBilhetesPorCpf(cpfSalvo);
            } else {
                openModal(modalConsulta);
            }
        };

        document.getElementById('closeConsulta').onclick = () => modalConsulta.classList.remove('active');
        document.getElementById('navRegulamento').onclick = (e) => { e.preventDefault(); openModal(modalRegulamento); };
        document.getElementById('footRegulamento').onclick = (e) => { e.preventDefault(); openModal(modalRegulamento); };
        document.getElementById('closeRegulamento').onclick = () => modalRegulamento.classList.remove('active');

        document.getElementById('navTermos').onclick = (e) => { e.preventDefault(); openModal(modalTermos); };
        document.getElementById('footTermos').onclick = (e) => { e.preventDefault(); openModal(modalTermos); };
        document.getElementById('closeTermos').onclick = () => modalTermos.classList.remove('active');

        document.getElementById('navInicio').onclick = (e) => {
            e.preventDefault();
            closeDrawer();
            fecharPaginaBilhetes();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        document.getElementById('closePix').onclick = () => modalPix.classList.remove('active');
        document.getElementById('btnCopiar').onclick = () => {
            const pixInput = document.getElementById('pixCode');
            pixInput.select();
            navigator.clipboard.writeText(pixInput.value);
            alert('Chave PIX copiada com sucesso!');
        };

        document.getElementById('btnVerMeusBilhetesModal').onclick = () => {
            modalPix.classList.remove('active');
            const cpfSalvo = localStorage.getItem('ultimoCpfConsultado');
            if (cpfSalvo) {
                exibirMeusBilhetesPorCpf(cpfSalvo);
            }
        };

        document.getElementById('btnDockPagar').onclick = () => {
            document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });
        };

        /* MÁSCARAS AUTOMÁTICAS */
        document.getElementById('phoneField').addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d)(\d{4})$/, "$1-$2");
            e.target.value = v;
        });

        function applyCpfMask(input) {
            input.addEventListener('input', function(e) {
                let v = e.target.value.replace(/\D/g, "");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                e.target.value = v;
            });
        }
        applyCpfMask(document.getElementById('cpfField'));
        applyCpfMask(document.getElementById('cpfSearch'));

        /* NAVEGAÇÃO / TELA DE BILHETES */
        function fecharPaginaBilhetes() {
            document.getElementById('pagina-meus-bilhetes').classList.add('hidden');
        }

        async function exibirMeusBilhetesPorCpf(cpfOriginal) {
            const containerBilhetes = document.getElementById('pagina-meus-bilhetes');
            const infoCpf = document.getElementById('resultado-cpf-info');
            const listaContainer = document.getElementById('lista-compras-container');

            const cpfApenasNumeros = String(cpfOriginal).replace(/\D/g, '');
            const cpfFormatado = cpfApenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

            infoCpf.innerHTML = 'Buscando bilhetes...';
            listaContainer.innerHTML = '';
            containerBilhetes.classList.remove('hidden');

            try {
                // Tenta POST enviando variações de parâmetros
                let response = await fetch('/api/meus-bilhetes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        cpf: cpfApenasNumeros, 
                        cpfFormatado: cpfFormatado,
                        documento: cpfApenasNumeros 
                    })
                });

                // Se POST falhar, faz fallback para GET /api/meus-bilhetes?cpf=...
                if (!response.ok && response.status === 405) {
                    response = await fetch(`/api/meus-bilhetes?cpf=${cpfApenasNumeros}`);
                }

                const data = await response.json();
                console.log("Resposta detalhada da API de bilhetes:", data);

                infoCpf.innerHTML = `Exibindo bilhetes para o CPF: <strong>${cpfFormatado}</strong>`;

                let listaCompras = [];
                if (Array.isArray(data)) {
                    listaCompras = data;
                } else if (data && typeof data === 'object') {
                    listaCompras = data.compras || data.bilhetes || data.dados || data.pedidos || data.tickets || data.cotas || [];
                }

                if (listaCompras.length > 0) {
                    let htmlCards = '';
                    listaCompras.forEach((compra, i) => {
                        const statusNormalizado = String(compra.status || 'pago').toLowerCase();
                        const isPago = ['pago', 'approved', 'paid', 'concluido', 'aprovado'].includes(statusNormalizado);
                        const statusClass = isPago ? 'pago' : 'pendente';
                        const statusTexto = isPago ? 'Pago' : 'Pendente';
                        
                        let cotas = compra.numeros || compra.cotas || compra.bilhetes || compra.numbers || [];
                        if (!Array.isArray(cotas)) {
                            cotas = typeof cotas === 'string' ? cotas.split(',') : [cotas];
                        }
                        
                        let cotasHtml = cotas.map(c => `<span class="cota-tag">${String(c).trim()}</span>`).join('');

                        htmlCards += `
                            <div class="card-compra">
                                <div class="card-compra-header">
                                    <span>Compra #${compra.id || compra.codigo || (i + 1)}</span>
                                    <span class="badge-status ${statusClass}">${statusTexto}</span>
                                </div>
                                <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:8px;">Quantidade: ${compra.qtd || cotas.length} cotas</p>
                                <div class="cotas-grid">
                                    ${cotasHtml}
                                </div>
                            </div>
                        `;
                    });
                    listaContainer.innerHTML = htmlCards;
                } else {
                    listaContainer.innerHTML = '<div class="card-compra"><p>Nenhum bilhete encontrado para este CPF.</p></div>';
                }
            } catch (err) {
                console.error("Erro na requisição dos bilhetes:", err);
                listaContainer.innerHTML = '<div class="card-compra"><p style="color:#ef4444;">Erro ao carregar bilhetes. Verifique o console para mais detalhes.</p></div>';
            }
        }

        /* BUSCA POR CPF VIA MODAL */
        const btnBuscar = document.getElementById('btnBuscarBilhetes');
        const cpfSearchInput = document.getElementById('cpfSearch');

        btnBuscar.onclick = async () => {
            const cpf = cpfSearchInput.value.replace(/\D/g, '');

            if (cpf.length !== 11) {
                alert('Por favor, digite um CPF válido com 11 dígitos.');
                return;
            }

            localStorage.setItem('ultimoCpfConsultado', cpf);
            modalConsulta.classList.remove('active');
            exibirMeusBilhetesPorCpf(cpf);
        };

        /* PROCESSA A COMPRA E GERA PIX VIA /api/pix */
        document.getElementById('rdsForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const telefone = document.getElementById('phoneField').value.replace(/\D/g, '');
            const cpf = document.getElementById('cpfField').value.replace(/\D/g, '');
            const totalValor = parseFloat((qtd * PRECO).toFixed(2));
            const btnSubmit = document.querySelector('.btn-comprar-green');
            
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
                    body: JSON.stringify({ 
                        telefone: telefone, 
                        whatsapp: telefone, 
                        phone: telefone,
                        cpf: cpf, 
                        valor: totalValor, 
                        valorTotal: totalValor,
                        amount: totalValor,
                        qtd: qtd,
                        quantidade: qtd
                    })
                });

                const data = await response.json();
                console.log("Resposta da API Pix:", data);

                if (response.ok && (data.sucesso || data.qr_code || data.pix_copia_cola || data.pix)) {
                    const pixCopiaECola = data.qr_code || data.pix_copia_cola || data.qrcode || data.pix;
                    const qrCodeImg = data.qr_code_base64 || data.qr_code_url || data.image_url || data.qr_code;

                    localStorage.setItem('ultimoCpfConsultado', cpf);

                    if (pixCopiaECola && typeof pixCopiaECola === 'string') {
                        document.getElementById('pixCode').value = pixCopiaECola;
                        
                        const qrImgElem = document.getElementById('qrCodeImg');
                        if (qrCodeImg && typeof qrCodeImg === 'string') {
                            qrImgElem.src = qrCodeImg.startsWith('data:') || qrCodeImg.startsWith('http') ? qrCodeImg : `data:image/png;base64,${qrCodeImg}`;
                            qrImgElem.style.display = 'block';
                        } else {
                            qrImgElem.style.display = 'none';
                        }
                        modalPix.classList.add('active');
                    } else {
                        alert('Pix gerado com sucesso! Seus bilhetes foram cadastrados.');
                        exibirMeusBilhetesPorCpf(cpf);
                    }
                } else {
                    alert('Erro ao gerar Pix: ' + (data.message || data.erro || 'Verifique as informações prestadas.'));
                }
            } catch (error) {
                alert('Erro ao conectar com o servidor.');
                console.error(error);
            } finally {
                btnSubmit.innerText = 'PAGAR COM PIX AGORA 🍀';
                btnSubmit.disabled = false;
            }
        };
    </script>
