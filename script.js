// Variáveis globais
let configuracaoTabela = [];
let configuracaoAtual = 0;
let modalResultadosAberto = false;
let modalRegrasAberto = false;

// Banco de dados de conectivos
const bancoConectivos = {
    'Adição': ['Ademais', 'Outrossim', 'E assim'],
    'Conclusão': ['Portanto', 'Por isso', 'Dessa forma'],
    'Explicação': ['Logo', 'Então', 'Seguindo o raciocínio'],
    'Conformidade': ['Conforme', 'É esse respeito'],
    'Contraste/Oposição': ['Entretanto', 'Todavia'],
    'Causa e consequência': ['A partir disso', 'Sob essa perspectiva']
};

// Configurações de tabela para variedade
const configuracoesPossiveis = [
    [
        { conectivo: { valor: 'Ademais', respostas: [] }, tipo: { valor: '', respostas: ['Adição'] } },
        { conectivo: { valor: '', respostas: ['Portanto', 'Por isso', 'Dessa forma'] }, tipo: { valor: 'Conclusão', respostas: [] } },
        { conectivo: { valor: 'Logo', respostas: [] }, tipo: { valor: 'Explicação', respostas: [] } },
        { conectivo: { valor: '', respostas: ['Ademais', 'Outrossim', 'E assim'] }, tipo: { valor: 'Adição', respostas: [] } },
        { conectivo: { valor: 'Portanto', respostas: [] }, tipo: { valor: '', respostas: ['Conclusão'] } },
        { conectivo: { valor: 'Entretanto', respostas: [] }, tipo: { valor: 'Oposição', respostas: [] } },
        { conectivo: { valor: 'Conforme', respostas: [] }, tipo: { valor: '', respostas: ['Conformidade'] } }
    ],
    [
        { conectivo: { valor: 'Então', respostas: [] }, tipo: { valor: '', respostas: ['Explicação'] } },
        { conectivo: { valor: '', respostas: ['Ademais', 'Outrossim', 'E assim'] }, tipo: { valor: 'Adição', respostas: [] } },
        { conectivo: { valor: 'Todavia', respostas: [] }, tipo: { valor: 'Contraste/Oposição', respostas: [] } },
        { conectivo: { valor: '', respostas: ['Conforme', 'É esse respeito'] }, tipo: { valor: 'Conformidade', respostas: [] } },
        { conectivo: { valor: 'Sob essa perspectiva', respostas: [] }, tipo: { valor: '', respostas: ['Causa e consequência'] } },
        { conectivo: { valor: '', respostas: ['Portanto', 'Por isso', 'Dessa forma'] }, tipo: { valor: 'Conclusão', respostas: [] } },
        { conectivo: { valor: 'Seguindo o raciocínio', respostas: [] }, tipo: { valor: 'Explicação', respostas: [] } }
    ],
    [
        { conectivo: { valor: '', respostas: ['A partir disso', 'Sob essa perspectiva'] }, tipo: { valor: 'Causa e consequência', respostas: [] } },
        { conectivo: { valor: 'Outrossim', respostas: [] }, tipo: { valor: '', respostas: ['Adição'] } },
        { conectivo: { valor: '', respostas: ['Entretanto', 'Todavia'] }, tipo: { valor: 'Contraste/Oposição', respostas: [] } },
        { conectivo: { valor: 'Por isso', respostas: [] }, tipo: { valor: 'Conclusão', respostas: [] } },
        { conectivo: { valor: 'É esse respeito', respostas: [] }, tipo: { valor: '', respostas: ['Conformidade'] } },
        { conectivo: { valor: '', respostas: ['Logo', 'Então', 'Seguindo o raciocínio'] }, tipo: { valor: 'Explicação', respostas: [] } },
        { conectivo: { valor: 'E assim', respostas: [] }, tipo: { valor: '', respostas: ['Adição'] } }
    ]
];

// Função para validar frase localmente (fallback)
function validarFraseLocal(frase, conectivo) {
    if (!frase || frase.length < 10) return { pontuacao: 0, feedback: ['Frase muito curta'] };
    if (frase.split(' ').length < 3) return { pontuacao: 0, feedback: ['Frase deve ter pelo menos 3 palavras'] };
    if (!/^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/.test(frase)) return { pontuacao: 0, feedback: ['Deve começar com maiúscula'] };
    if (!/[.!?]$/.test(frase)) return { pontuacao: 0, feedback: ['Deve terminar com pontuação'] };
    if (!frase.toLowerCase().includes(conectivo.toLowerCase())) return { pontuacao: 0, feedback: ['Deve conter o conectivo'] };
    
    return { pontuacao: 1, feedback: ['Frase válida'] };
}

// Função para validar frase via API
async function validarFrase(frase, conectivo) {
    try {
        const response = await fetch('/api/validar-frase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                frase: frase,
                conectivo: conectivo
            })
        });

        if (!response.ok) {
            throw new Error('Erro na API');
        }

        const resultado = await response.json();
        return resultado;
    } catch (error) {
        console.log('Usando validação local como fallback');
        return validarFraseLocal(frase, conectivo);
    }
}

// Função para obter valor do conectivo (desktop ou mobile)
function obterValorConectivo(index) {
    // Tentar primeiro o campo desktop
    const inputDesktop = document.getElementById(`conectivo-${index}`);
    if (inputDesktop) {
        return inputDesktop.value.trim();
    }
    
    // Se não encontrar, tentar o campo mobile
    const inputMobile = document.getElementById(`mobile-conectivo-${index}`);
    if (inputMobile) {
        return inputMobile.value.trim();
    }
    
    return '';
}

// Função para obter valor do tipo (desktop ou mobile)
function obterValorTipo(index) {
    // Tentar primeiro o campo desktop
    const inputDesktop = document.getElementById(`tipo-${index}`);
    if (inputDesktop) {
        return inputDesktop.value.trim();
    }
    
    // Se não encontrar, tentar o campo mobile
    const inputMobile = document.getElementById(`mobile-tipo-${index}`);
    if (inputMobile) {
        return inputMobile.value.trim();
    }
    
    return '';
}

// Função para obter valor da frase (desktop ou mobile)
function obterValorFrase(index) {
    // Tentar primeiro o campo desktop
    const inputDesktop = document.getElementById(`frase-${index}`);
    if (inputDesktop) {
        return inputDesktop.value.trim();
    }
    
    // Se não encontrar, tentar o campo mobile
    const inputMobile = document.getElementById(`mobile-frase-${index}`);
    if (inputMobile) {
        return inputMobile.value.trim();
    }
    
    return '';
}

// Função para aplicar feedback visual (desktop ou mobile)
function aplicarFeedback(index, tipo, correto) {
    const classe = correto ? 'correct' : 'incorrect';
    
    // Aplicar no campo desktop se existir
    const inputDesktop = document.getElementById(`${tipo}-${index}`);
    if (inputDesktop) {
        inputDesktop.classList.remove('correct', 'incorrect');
        inputDesktop.classList.add(classe);
    }
    
    // Aplicar no campo mobile se existir
    const inputMobile = document.getElementById(`mobile-${tipo}-${index}`);
    if (inputMobile) {
        inputMobile.classList.remove('correct', 'incorrect');
        inputMobile.classList.add(classe);
    }
}

// Função para obter o conectivo da linha (preenchido ou digitado)
function obterConectivoLinha(index) {
    const linha = configuracaoTabela[index];
    if (linha.conectivo.valor !== '') {
        return linha.conectivo.valor;
    } else {
        return obterValorConectivo(index);
    }
}

// Função para criar a tabela
function criarTabela() {
    const isMobile = window.innerWidth <= 768;
    const tableContainer = document.getElementById('conectivos-table');
    const mobileCardsContainer = document.getElementById('mobile-cards-container');

    if (isMobile) {
        tableContainer.style.display = 'none';
        mobileCardsContainer.style.display = 'block';
        criarLayoutMobile();
    } else {
        tableContainer.style.display = 'table';
        mobileCardsContainer.style.display = 'none';
        criarTabelaDesktop();
    }
}

// Adicionar listener para redimensionamento da janela
window.addEventListener('resize', criarTabela);

// Função para criar tabela desktop
function criarTabelaDesktop() {
    const tbody = document.querySelector('#conectivos-table tbody');
    tbody.innerHTML = '';

    configuracaoTabela.forEach((linha, index) => {
        const tr = document.createElement('tr');

        // Coluna Conectivo
        const tdConectivo = document.createElement('td');
        tdConectivo.setAttribute('data-label', 'Conectivo:');
        if (linha.conectivo.valor === '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-field';
            input.id = `conectivo-${index}`;
            input.placeholder = 'Digite o conectivo...';
            input.autocomplete = 'off';
            input.autocorrect = 'off';
            input.autocapitalize = 'off';
            input.spellcheck = false;
            
            // Prevenir comportamentos padrão que causam atualização
            input.addEventListener('keydown', function(e) {
                e.stopPropagation();
            });
            
            input.addEventListener('input', function(e) {
                e.stopPropagation();
            });
            
            tdConectivo.appendChild(input);
        } else {
            const span = document.createElement('span');
            span.className = 'filled-cell';
            span.textContent = linha.conectivo.valor;
            tdConectivo.appendChild(span);
        }
        tr.appendChild(tdConectivo);

        // Coluna Tipo
        const tdTipo = document.createElement('td');
        tdTipo.setAttribute('data-label', 'Tipo:');
        if (linha.tipo.valor === '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-field';
            input.id = `tipo-${index}`;
            input.placeholder = 'Digite o tipo...';
            input.autocomplete = 'off';
            input.autocorrect = 'off';
            input.autocapitalize = 'off';
            input.spellcheck = false;
            
            // Prevenir comportamentos padrão que causam atualização
            input.addEventListener('keydown', function(e) {
                e.stopPropagation();
            });
            
            input.addEventListener('input', function(e) {
                e.stopPropagation();
            });
            
            tdTipo.appendChild(input);
        } else {
            const span = document.createElement('span');
            span.className = 'filled-cell';
            span.textContent = linha.tipo.valor;
            tdTipo.appendChild(span);
        }
        tr.appendChild(tdTipo);

        // Coluna Frase (sempre vazia para o usuário preencher)
        const tdFrase = document.createElement('td');
        tdFrase.setAttribute('data-label', 'Frase:');
        const inputFrase = document.createElement('input');
        inputFrase.type = 'text';
        inputFrase.className = 'input-field';
        inputFrase.id = `frase-${index}`;
        inputFrase.placeholder = 'Crie uma frase usando o conectivo...';
        inputFrase.autocomplete = 'off';
        inputFrase.autocorrect = 'off';
        inputFrase.autocapitalize = 'off';
        inputFrase.spellcheck = false;
        
        // Prevenir comportamentos padrão que causam atualização
        inputFrase.addEventListener('keydown', function(e) {
            e.stopPropagation();
        });
        
        inputFrase.addEventListener('input', function(e) {
            e.stopPropagation();
        });
        
        tdFrase.appendChild(inputFrase);
        tr.appendChild(tdFrase);

        tbody.appendChild(tr);
    });

    // Limpar container mobile se existir
    const mobileContainer = document.querySelector('.mobile-cards-container');
    if (mobileContainer) {
        mobileContainer.innerHTML = '';
    }
}

// Função para criar layout mobile em cards
function criarLayoutMobile() {
    // Limpar tabela desktop
    const tbody = document.querySelector('#conectivos-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
    }
    
    // Obter container mobile
    const mobileContainer = document.getElementById('mobile-cards-container');
    if (!mobileContainer) {
        console.error('Container mobile não encontrado');
        return;
    }
    
    // Limpar container mobile
    mobileContainer.innerHTML = '';

    configuracaoTabela.forEach((linha, index) => {
        // Criar card mobile
        const card = document.createElement('div');
        card.className = 'mobile-card';
        
        // Número do card
        const cardNumber = document.createElement('div');
        cardNumber.className = 'card-number';
        cardNumber.textContent = index + 1;
        card.appendChild(cardNumber);

        // Seção Conectivo
        const conectivoSection = document.createElement('div');
        conectivoSection.className = 'card-section';
        
        const conectivoLabel = document.createElement('label');
        conectivoLabel.className = 'card-label';
        conectivoLabel.textContent = '🔗 Conectivo';
        conectivoSection.appendChild(conectivoLabel);

        if (linha.conectivo.valor === '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'mobile-input';
            input.id = `mobile-conectivo-${index}`;
            input.placeholder = 'Digite o conectivo...';
            input.autocomplete = 'off';
            input.autocorrect = 'off';
            input.autocapitalize = 'none';
            input.spellcheck = false;
            input.inputMode = 'text';
            
            // Solução mais radical - sem event listeners que possam interferir
            input.style.webkitUserSelect = 'text';
            input.style.userSelect = 'text';
            input.style.webkitTouchCallout = 'default';
            input.style.webkitTapHighlightColor = 'transparent';
            
            conectivoSection.appendChild(input);
        } else {
            const filled = document.createElement('div');
            filled.className = 'mobile-filled';
            filled.textContent = linha.conectivo.valor;
            conectivoSection.appendChild(filled);
        }
        card.appendChild(conectivoSection);

        // Seção Tipo
        const tipoSection = document.createElement('div');
        tipoSection.className = 'card-section';
        
        const tipoLabel = document.createElement('label');
        tipoLabel.className = 'card-label';
        tipoLabel.textContent = '📝 Tipo de Conectivo';
        tipoSection.appendChild(tipoLabel);

        if (linha.tipo.valor === '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'mobile-input';
            input.id = `mobile-tipo-${index}`;
            input.placeholder = 'Digite o tipo...';
            input.autocomplete = 'off';
            input.autocorrect = 'off';
            input.autocapitalize = 'none';
            input.spellcheck = false;
            input.inputMode = 'text';
            
            // Solução mais radical - sem event listeners que possam interferir
            input.style.webkitUserSelect = 'text';
            input.style.userSelect = 'text';
            input.style.webkitTouchCallout = 'default';
            input.style.webkitTapHighlightColor = 'transparent';
            
            tipoSection.appendChild(input);
        } else {
            const filled = document.createElement('div');
            filled.className = 'mobile-filled';
            filled.textContent = linha.tipo.valor;
            tipoSection.appendChild(filled);
        }
        card.appendChild(tipoSection);

        // Seção Frase
        const fraseSection = document.createElement('div');
        fraseSection.className = 'card-section';
        
        const fraseLabel = document.createElement('label');
        fraseLabel.className = 'card-label';
        fraseLabel.textContent = '✍️ Frase Criada';
        fraseSection.appendChild(fraseLabel);

        const inputFrase = document.createElement('input');
        inputFrase.type = 'text';
        inputFrase.className = 'mobile-input';
        inputFrase.id = `mobile-frase-${index}`;
        inputFrase.placeholder = 'Crie uma frase usando o conectivo...';
        inputFrase.autocomplete = 'off';
        inputFrase.autocorrect = 'off';
        inputFrase.autocapitalize = 'none';
        inputFrase.spellcheck = false;
        inputFrase.inputMode = 'text';
        
        // Solução mais radical - sem event listeners que possam interferir
        inputFrase.style.webkitUserSelect = 'text';
        inputFrase.style.userSelect = 'text';
        inputFrase.style.webkitTouchCallout = 'default';
        inputFrase.style.webkitTapHighlightColor = 'transparent';
        
        fraseSection.appendChild(inputFrase);
        card.appendChild(fraseSection);

        mobileContainer.appendChild(card);
    });
}

// Função para verificar as respostas
async function verificarRespostas() {
    console.log('Verificando respostas...');
    
    let pontuacaoTotal = 0;
    let pontuacaoMaxima = 0;

    // Limpar feedback anterior
    document.querySelectorAll('.input-field, .mobile-input').forEach(input => {
        input.classList.remove('correct', 'incorrect');
    });

    for (let i = 0; i < configuracaoTabela.length; i++) {
        const linha = configuracaoTabela[i];

        // Verificar conectivo
        if (linha.conectivo.valor === '') {
            pontuacaoMaxima++;
            const valorConectivo = obterValorConectivo(i);
            const conectivoCorreto = linha.conectivo.respostas.some(resposta => 
                resposta.toLowerCase() === valorConectivo.toLowerCase()
            );
            
            if (conectivoCorreto) {
                pontuacaoTotal++;
                aplicarFeedback(i, 'conectivo', true);
            } else {
                aplicarFeedback(i, 'conectivo', false);
            }
        }

        // Verificar tipo
        if (linha.tipo.valor === '') {
            pontuacaoMaxima++;
            const valorTipo = obterValorTipo(i);
            const tipoCorreto = linha.tipo.respostas.some(resposta => 
                resposta.toLowerCase() === valorTipo.toLowerCase()
            );
            
            if (tipoCorreto) {
                pontuacaoTotal++;
                aplicarFeedback(i, 'tipo', true);
            } else {
                aplicarFeedback(i, 'tipo', false);
            }
        }

        // Verificar frase
        pontuacaoMaxima++;
        const valorFrase = obterValorFrase(i);
        const conectivoLinha = obterConectivoLinha(i);
        
        if (valorFrase && conectivoLinha) {
            const resultadoFrase = await validarFrase(valorFrase, conectivoLinha);
            if (resultadoFrase.pontuacao > 0) {
                pontuacaoTotal++;
                aplicarFeedback(i, 'frase', true);
            } else {
                aplicarFeedback(i, 'frase', false);
            }
        } else {
            aplicarFeedback(i, 'frase', false);
        }
    }

    console.log(`Pontuação: ${pontuacaoTotal}/${pontuacaoMaxima}`);
    exibirModalResultados(pontuacaoTotal, pontuacaoMaxima);
}

// Função para exibir modal de resultados
function exibirModalResultados(pontuacao, pontuacaoMaxima) {
    console.log("Chamada exibirModalResultados. modalResultadosAberto: ", modalResultadosAberto);
    if (modalResultadosAberto) {
        console.log("Modal já está aberto, retornando.");
        return;
    }
    
    modalResultadosAberto = true;
    const modal = document.getElementById("modal-resultados-overlay");
    const pontuacaoElement = document.querySelector(".pontuacao-final");
    const performanceElement = document.querySelector(".performance");

    console.log("Elemento modal-resultados-overlay: ", modal);
    console.log("Elemento pontuacao-final: ", pontuacaoElement);
    console.log("Elemento performance: ", performanceElement);

    if (!modal || !pontuacaoElement || !performanceElement) {
        console.error("Um ou mais elementos do modal não foram encontrados!");
        return;
    }
    
    console.log("Adicionando classe 'show' ao modal-overlay.");
    modal.classList.add("show");
    document.body.classList.add("modal-active");
    
    // Atualizar pontuação
    pontuacaoElement.innerHTML = `Sua pontuação: <span>${pontuacao}/${pontuacaoMaxima}</span>`;
    
    // Calcular porcentagem e definir feedback
    const porcentagem = (pontuacao / pontuacaoMaxima) * 100;
    let feedbackTexto = '';
    let feedbackClasse = '';
    
    if (porcentagem >= 80) {
        feedbackTexto = '🎉 Excelente! Você domina os conectivos!';
        feedbackClasse = 'performance-excelente';
    } else if (porcentagem >= 60) {
        feedbackTexto = '👍 Bom trabalho! Continue praticando!';
        feedbackClasse = 'performance-bom';
    } else {
        feedbackTexto = '📚 Continue estudando! Você vai melhorar!';
        feedbackClasse = 'performance-regular';
    }
    
    performanceElement.textContent = feedbackTexto;
    performanceElement.className = `performance ${feedbackClasse}`;
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.classList.add('modal-active');
}

// Função para fechar modal de resultados
function fecharModalResultados() {
    modalResultadosAberto = false;
    const modal = document.getElementById('modal-resultados-overlay');
    modal.classList.remove('show');
    document.body.classList.remove('modal-active');
}

// Função para reiniciar jogo com nova tabela
function reiniciarJogoComNovaTabela() {
    fecharModalResultados();
    
    // Escolher próxima configuração
    configuracaoAtual = (configuracaoAtual + 1) % configuracoesPossiveis.length;
    configuracaoTabela = [...configuracoesPossiveis[configuracaoAtual]];
    
    // Recriar tabela
    criarTabela();
}

// Funções do modal de regras
function abrirModalRegras() {
    if (modalRegrasAberto) return;
    
    modalRegrasAberto = true;
    const modal = document.getElementById('modal-regras-overlay');
    modal.classList.add('show');
    document.body.classList.add('modal-active');
}

function fecharModalRegras() {
    modalRegrasAberto = false;
    const modal = document.getElementById('modal-regras-overlay');
    modal.classList.remove('show');
    document.body.classList.remove('modal-active');
}

// Função de inicialização
function inicializar() {
    // Configurar tabela inicial
    configuracaoTabela = [...configuracoesPossiveis[configuracaoAtual]];
    criarTabela();
    
    // Configurar eventos
    document.getElementById('verificar-btn').addEventListener('click', verificarRespostas);
    document.getElementById('tentar-novamente-btn').addEventListener('click', reiniciarJogoComNovaTabela);
    document.getElementById('regras-btn').addEventListener('click', abrirModalRegras);
    document.getElementById('fechar-regras-btn').addEventListener('click', fecharModalRegras);
    
    // Listener para redimensionamento da janela
    window.addEventListener('resize', function() {
        // Recriar layout quando a janela for redimensionada
        criarTabela();
    });
    
    // Prevenir comportamentos padrão que podem causar atualização da página
    document.addEventListener('keydown', function(e) {
        // Prevenir F5 e Ctrl+R
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
        }
    });
    
    // Prevenir submit de formulários (caso algum seja criado dinamicamente)
    document.addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Prevenir comportamentos padrão em inputs
    document.addEventListener('input', function(e) {
        if (e.target.matches('.input-field, .mobile-input')) {
            e.stopPropagation();
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('modal-resultados-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalResultados();
        }
    });
    
    document.getElementById('modal-regras-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalRegras();
        }
    });
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', inicializar);

