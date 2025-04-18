let itens = [];
let taxas = [];
let integral = [];
let novoTotalIntegral= 0;
let cartaoPix = 0;
let historico = JSON.parse(localStorage.getItem('historico')) || [];


function adicionarItem() {
    const valor = parseFloat(document.getElementById('valorItem').value);

    if (isNaN(valor) || valor <= 0 || !/^\d+(\.\d{1,2})?$/.test(valor.toString())) {
        exibirModal("Algo de errado não está certo");
        return;
    }

    itens.push(valor);
    document.getElementById('valorItem').value = '';
    atualizarLista('listaItens', itens);

    // Após adicionar o item, mover o foco para o próximo campo (Taxas de Tele)
    document.getElementById('valorTele').focus();
}

function adicionarTele() {
    const valor = parseFloat(document.getElementById('valorTele').value);

    if (isNaN(valor) || valor <= 0 || !/^\d+(\.\d{1,2})?$/.test(valor.toString())) {
        exibirModal("Algo de errado não está certo");
        return;
    }

    taxas.push(valor);
    document.getElementById('valorTele').value = '';
    atualizarLista('listaTele', taxas);

    // Após adicionar o item, mover o foco para o próximo campo (Taxas de Tele)
    document.getElementById('valorIntegral').focus();
}

function adicionarIntegral() {
    const valor = parseFloat(document.getElementById('valorIntegral').value);

    if (isNaN(valor) || valor <= 0 || !/^\d+(\.\d{1,2})?$/.test(valor.toString())) {
        exibirModal("Algo de errado não está certo");
        return;
    }

    integral.push(valor);
    document.getElementById('valorIntegral').value = '';
    atualizarLista('listaIntegral', integral);

    // Após adicionar o item, mover o foco para o próximo campo (Taxas de Tele)
    document.getElementById('valorItem').focus();

}

function subtrairDoIntegral() {
     const valor = parseFloat(document.getElementById('valorSubtracao').value);
     cartaoPix = valor;
    if (isNaN(valor) || valor <= 0 || !/^\d+(\.\d{1,2})?$/.test(valor.toString())) {
        exibirModal("Valor inválido para subtração.");
        return;
    }

    const totalIntegral = integral.reduce((a, b) => a + b, 0);
    if (valor > totalIntegral) {
        exibirModal("Valor a ser subtraído é maior que o total do integral.");
        return;
    }

    novoTotalIntegral = totalIntegral - valor;
    

    // Limpa o campo de entrada
    document.getElementById('valorSubtracao').value = '';
    mostrarResultado()
}

function atualizarLista(id, lista) {
    document.getElementById(id).innerHTML = lista.map(v => `R$ ${v.toFixed(2)}`).join(' + ');
}

function limpar() {
    // Limpa os arrays de itens, taxas e total
    itens = [];
    taxas = [];
    integral = [];
    total = [];

    // Limpa os campos de entrada
    document.getElementById('valorItem').value = '';
    document.getElementById('valorTele').value = '';
    document.getElementById('valorIntegral').value = '';

    // Limpa as listas exibidas
    document.getElementById('listaItens').innerHTML = '';
    document.getElementById('listaTele').innerHTML = '';
    document.getElementById('listaIntegral').innerHTML = '';

    // Limpa o resultado exibido
    document.getElementById('resultado').innerHTML = '';
}

function calcular() {
    // Apenas chama a função para exibir o resultado
    mostrarResultado();
}

function salvar() {
    const totalIntegral = integral.reduce((a, b) => a + b, 0);
    const totalItens = itens.reduce((a, b) => a + b, 0);
    const totalTele = taxas.reduce((a, b) => a + b, 0);
    const totalGeral = totalItens + totalTele;
    const diferenca = totalIntegral - totalGeral;
    const sucesso = Math.abs(diferenca) <= 0.01;
    const dataHora = new Date().toLocaleString();

    // Criar um novo registro no histórico
    historico.unshift({
        data: dataHora,
        itens: [...itens], // Salvar uma cópia das listas
        totalItens,
        taxas: [...taxas],
        totalTele,
        totalGeral,
        integral: [...integral],
        totalIntegral,
        novoTotalIntegral,
        cartaoPix,
        diferenca,
        sucesso
    });

    // Salvar o histórico no localStorage
    localStorage.setItem('historico', JSON.stringify(historico));

    // Atualizar a exibição do histórico
    mostrarHistorico();

    // Limpar os dados após salvar no histórico
    limpar();
}

function mostrarHistorico() {
    const container = document.getElementById('listaHistorico');
    container.innerHTML = '';

    historico.forEach((entry, index) => { // Adicione o parâmetro "index" aqui
        const div = document.createElement('div');
        div.className = 'historico-entry';
        div.style.border = '1px solid #ccc';
        div.style.borderRadius = '5px';
        div.style.marginBottom = '10px';
        div.style.padding = '10px';
        div.style.backgroundColor = entry.sucesso ? '#e6ffe6' : '#ffe6e6';

        div.innerHTML = `
            <p><strong>Data:</strong> ${entry.data}</p>
            <p><strong>Itens:</strong> R$ ${entry.totalItens.toFixed(2)} <br> ${entry.itens.map(v => `R$ ${v.toFixed(2)}`).join(', ')}</p>
            <p><strong>Taxas de Tele:</strong> R$ ${entry.totalTele.toFixed(2)} <br> ${entry.taxas.map(v => `R$ ${v.toFixed(2)}`).join(', ')}</p>
            <p><strong>Total da nota:</strong> R$ ${entry.totalIntegral.toFixed(2)} <br> ${entry.integral.map(v => `R$ ${v.toFixed(2)}`).join(', ')}</p>
            <p><strong>Total em dinheiro;</strong> R$ ${entry.novoTotalIntegral.toFixed(2)}</p>
            <p><strong>Diferença:</strong> R$ ${entry.diferenca.toFixed(2)} - <span style="color: ${entry.sucesso ? 'green' : 'red'};">${entry.sucesso ? 'OK' : 'Erro'}</span></p>
            <button class ="btExcluir" onclick="excluirHistorico(${index})">Excluir</button>
        `;

        container.appendChild(div);
    });

    if (historico.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Nenhum histórico disponível.';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#888';
        container.appendChild(emptyMessage);
    }
}

function excluirHistorico(index) {
    // Criar a modal de confirmação
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

    const mensagemElemento = document.createElement('p');
    mensagemElemento.textContent = 'Tem certeza que deseja excluir este registro?';

    const botaoConfirmar = document.createElement('button');
    botaoConfirmar.textContent = 'Confirmar';
    botaoConfirmar.style.marginRight = '10px';
    botaoConfirmar.style.backgroundColor = '#d9534f';
    botaoConfirmar.style.color = '#fff';
    botaoConfirmar.style.border = 'none';
    botaoConfirmar.style.padding = '10px 20px';
    botaoConfirmar.style.borderRadius = '5px';
    botaoConfirmar.style.cursor = 'pointer';

    const botaoCancelar = document.createElement('button');
    botaoCancelar.textContent = 'Cancelar';
    botaoCancelar.style.backgroundColor = '#5bc0de';
    botaoCancelar.style.color = '#fff';
    botaoCancelar.style.border = 'none';
    botaoCancelar.style.padding = '10px 20px';
    botaoCancelar.style.borderRadius = '5px';
    botaoCancelar.style.cursor = 'pointer';

    // Ação ao confirmar exclusão
    botaoConfirmar.onclick = () => {
        // Remove o item do array
        historico.splice(index, 1);

        // Atualiza o localStorage
        localStorage.setItem('historico', JSON.stringify(historico));

        // Atualiza a exibição do histórico
        mostrarHistorico();

        // Remove a modal
        document.body.removeChild(modal);
    };

    // Ação ao cancelar exclusão
    botaoCancelar.onclick = () => {
        // Remove a modal
        document.body.removeChild(modal);
    };

    modalContent.appendChild(mensagemElemento);
    modalContent.appendChild(botaoConfirmar);
    modalContent.appendChild(botaoCancelar);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function exibirModal(mensagem) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.textAlign = 'center';

    const mensagemElemento = document.createElement('p');
    mensagemElemento.textContent = mensagem;

    const botaoFechar = document.createElement('button');
    botaoFechar.textContent = 'Fechar';
    botaoFechar.style.marginTop = '10px';
    botaoFechar.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(mensagemElemento);
    modalContent.appendChild(botaoFechar);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    botaoFechar.focus(); // Foca no botão "Fechar" da modal
}

function mostrarResultado() {
    const totalIntegral = integral.reduce((a, b) => a + b, 0);
    const totalItens = itens.reduce((a, b) => a + b, 0);
    const totalTele = taxas.reduce((a, b) => a + b, 0);
    const totalGeral = totalItens + totalTele;
    const diferenca = totalIntegral - totalGeral;
    const sucesso = Math.abs(diferenca) <= 0.01;

    let resultado = `
    <p><strong>Valor Total dos Itens:</strong> R$ ${totalItens.toFixed(2)}</p>
    <p><strong>Valor Total das Taxas de Tele:</strong> R$ ${totalTele.toFixed(2)}</p>
    <p><strong>Valor Total da nota:</strong> R$ ${totalIntegral.toFixed(2)}</p>
    <p><strong>Total da nota em dinheiro:</strong> R$ ${novoTotalIntegral.toFixed(2)}</p>
    <p><strong>Total em cartão/pix:</strong> R$ ${cartaoPix.toFixed(2)}</p>
    <p><strong>Diferença (totalTele - totalNotas):</strong> R$ ${diferenca.toFixed(2)}</p>`;

    if (!sucesso) {
        resultado += `<p style="color:red;"><strong>Diferença detectada!</strong></p>`;
    } else {
        resultado += `<p style="color:green;"><strong>Valores conferem!</strong></p>`;
    }

    document.getElementById('resultado').innerHTML = resultado;
}

mostrarHistorico();