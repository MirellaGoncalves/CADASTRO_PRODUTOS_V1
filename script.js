class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

let produtoEmEdicao = null;
let acaoPendente = null;
let temporizadorMensagem = null;

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnAdicionar = document.querySelector(".btn-primary");
const btnCancelarEdicao = document.getElementById("cancelar-edicao");
const campoBusca = document.getElementById("campo-busca");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const mensagemErro = document.getElementById("mensagem-erro");
const mensagemStatus = document.getElementById("mensagem-status");

const modalOverlay = document.getElementById("modal-overlay");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensagem = document.getElementById("modal-mensagem");
const modalConfirmar = document.getElementById("modal-confirmar");
const modalCancelar = document.getElementById("modal-cancelar");
const modalFechar = document.getElementById("modal-fechar");
const btnConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");

// SALVAMENTO E CARREGAMENTO DOS DADOS

function salvarNoLocalStorage() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaDeProdutos));
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) {
        return;
    }

    try {
        const produtosObjetos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosObjetos)) {
            throw new Error("Dados inválidos");
        }

        produtosObjetos.forEach((prod) => {
            if (
                prod &&
                typeof prod.nome === "string" &&
                prod.nome.trim() !== "" &&
                Number.isFinite(Number(prod.preco)) &&
                Number(prod.preco) > 0 &&
                Number.isInteger(Number(prod.quantidade)) &&
                Number(prod.quantidade) > 0
            ) {
                listaDeProdutos.push(
                    new Produto(prod.nome.trim(), prod.preco, prod.quantidade)
                );
            }
        });
    } catch (erro) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);

        mostrarMensagemStatus(
            "Os dados salvos estavam inválidos e foram reiniciados.",
            "erro"
        );
    }
}

// MENSAGENS INLINE E TOAST

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;

    mensagemErro.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

function mostrarMensagemStatus(mensagem, tipo = "sucesso") {
    mensagemStatus.textContent = mensagem;
    mensagemStatus.className = "mensagem-status " + tipo;
    mensagemStatus.hidden = false;

    if (temporizadorMensagem) {
        clearTimeout(temporizadorMensagem);
    }

    temporizadorMensagem = setTimeout(() => {
        mensagemStatus.hidden = true;
    }, 3500);
}

// MODAL CUSTOMIZADO

function abrirModal(titulo, conteudo, textoConfirmar, funcaoConfirmar = null) {
    modalTitulo.textContent = titulo;
    modalMensagem.innerHTML = "";
    modalMensagem.appendChild(conteudo);

    acaoPendente = funcaoConfirmar;

    if (funcaoConfirmar) {
        modalConfirmar.textContent = textoConfirmar || "Confirmar";
        modalConfirmar.hidden = false;
        modalCancelar.textContent = "Cancelar";
    } else {
        modalConfirmar.hidden = true;
        modalCancelar.textContent = "Fechar";
    }

    modalOverlay.hidden = false;
    document.body.classList.add("modal-aberto");

    modalCancelar.focus();
}

function fecharModal() {
    modalOverlay.hidden = true;
    document.body.classList.remove("modal-aberto");
    acaoPendente = null;
}

modalCancelar.addEventListener("click", fecharModal);

modalFechar.addEventListener("click", fecharModal);

modalConfirmar.addEventListener("click", function () {
    const executarAcao = acaoPendente;

    fecharModal();

    if (executarAcao) {
        executarAcao();
    }
});

modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
        fecharModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modalOverlay.hidden) {
        fecharModal();
    }
});

// CADASTRO E EDIÇÃO DE PRODUTOS

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    limparErro();

    const nome = campoNome.value.trim();
    const preco = parseFloat(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    if (!nome) {
        mostrarErro("Por favor, informe um nome válido para o produto.");
        campoNome.focus();
        return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
        mostrarErro("Informe um preço válido maior que zero.");
        campoPreco.focus();
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        mostrarErro("A quantidade deve ser um número inteiro maior que zero.");
        campoQuantidade.focus();
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);

    if (produtoEmEdicao === null) {
        listaDeProdutos.push(novoProduto);

        mostrarMensagemStatus("Produto adicionado com sucesso!");

    } else {
        const indiceReal = listaDeProdutos.indexOf(produtoEmEdicao);

        if (indiceReal !== -1) {
            listaDeProdutos[indiceReal] = novoProduto;

            mostrarMensagemStatus("Produto atualizado com sucesso!");

        } else {
            listaDeProdutos.push(novoProduto);

            mostrarMensagemStatus(
                "Produto adicionado novamente ao estoque."
            );
        }
    }

    salvarNoLocalStorage();
    atualizarInterface();
    cancelarEdicao();
});

// PREPARAR EDIÇÃO

function prepararEdicao(index) {
    const produtosFiltrados = obterProdutosFiltrados();
    const produto = produtosFiltrados[index];

    if (!produto) {
        return;
    }

    produtoEmEdicao = produto;

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    limparErro();

    btnAdicionar.textContent = "Salvar Alterações";
    btnCancelarEdicao.hidden = false;

    campoNome.focus();

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// CANCELAR EDIÇÃO

function cancelarEdicao() {
    produtoEmEdicao = null;

    formProduto.reset();

    limparErro();

    btnAdicionar.textContent = "Adicionar Produto";
    btnCancelarEdicao.hidden = true;
}

btnCancelarEdicao.addEventListener("click", cancelarEdicao);

// REMOÇÃO DE UM PRODUTO COM MODAL

function solicitarRemocaoProduto(index) {
    const produtosFiltrados = obterProdutosFiltrados();
    const produtoParaRemover = produtosFiltrados[index];

    if (!produtoParaRemover) {
        return;
    }

    const mensagem = document.createElement("p");

    mensagem.textContent =
        'Tem certeza de que deseja remover o produto "' +
        produtoParaRemover.nome + '" do estoque?';

    abrirModal(
        "Confirmar remoção",
        mensagem,
        "Remover",
        function () {
            const indiceReal = listaDeProdutos.indexOf(produtoParaRemover);

            if (indiceReal === -1) {
                return;
            }

            if (produtoEmEdicao === produtoParaRemover) {
                cancelarEdicao();
            }

            listaDeProdutos.splice(indiceReal, 1);

            salvarNoLocalStorage();
            atualizarInterface();

            mostrarMensagemStatus("Produto removido com sucesso!");
        }
    );
}

// REMOÇÃO DE TODOS OS PRODUTOS COM MODAL

btnLimparTudo.addEventListener("click", function () {

    if (listaDeProdutos.length === 0) {
        mostrarMensagemStatus("A tabela já está vazia.", "aviso");
        return;
    }

    const mensagem = document.createElement("p");

    mensagem.textContent =
        "Tem certeza de que deseja remover todos os produtos do estoque? Essa ação não poderá ser desfeita.";

    abrirModal(
        "Limpar todo o estoque?",
        mensagem,
        "Sim, limpar tudo",
        function () {
            listaDeProdutos.length = 0;

            localStorage.removeItem(CHAVE_STORAGE);

            cancelarEdicao();
            atualizarInterface();

            mostrarMensagemStatus("Todos os produtos foram removidos.");
        }
    );
});

// CONCEITO BOOTSTRAP

btnConceitoBootstrap.addEventListener("click", function () {

    const conteudo = document.createElement("div");

    conteudo.className = "conteudo-bootstrap";

    conteudo.innerHTML = `
        <p><strong>O que é Bootstrap?</strong></p>

        <p>
            Bootstrap é uma biblioteca (framework) front-end que oferece
            componentes prontos de HTML, CSS e JavaScript para criar
            interfaces responsivas com mais rapidez.
        </p>

        <p><strong>Como poderia ser utilizado neste sistema?</strong></p>

        <ul>
            <li>Botões padronizados para adicionar, editar e remover produtos.</li>
            <li>Modais prontos para confirmar ações importantes.</li>
            <li>Alertas visuais para informar erros e operações concluídas.</li>
            <li>Classes de layout para adaptar a interface a celulares e computadores.</li>
        </ul>

        <p>
            <strong>Aplicação na V5:</strong> neste projeto, os modais e
            as mensagens foram construídos com HTML, CSS e JavaScript
            próprios, sem depender da biblioteca Bootstrap.
            O conceito demonstra como seus componentes poderiam
            acelerar esse desenvolvimento.
        </p>
    `;

    abrirModal("Conceito Bootstrap", conteudo, "Fechar");
});

// PESQUISA E FILTRO

function obterProdutosFiltrados() {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter((produto) =>
        produto.nome.toLowerCase().includes(termoBusca)
    );
}

// ATUALIZAÇÃO DO TOTAL E DA QUANTIDADE

function atualizarTotalEstoque() {
    const produtosVisiveis = obterProdutosFiltrados();

    const total = produtosVisiveis.reduce(
        (acc, produto) => acc + produto.calcularSubtotal(),
        0
    );

    totalEstoqueEl.textContent =
        "Total em estoque: " +
        total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    document.getElementById("quantidade-produtos").textContent =
        "Produtos encontrados: " + produtosVisiveis.length;
}

// RENDERIZAÇÃO DA TABELA

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    const produtosParaExibir = obterProdutosFiltrados();

    if (produtosParaExibir.length === 0) {

        const linhaMensagem = document.createElement("tr");
        const celMensagem = document.createElement("td");

        celMensagem.colSpan = 5;
        celMensagem.className = "mensagem-vazia";

        celMensagem.textContent = listaDeProdutos.length === 0
            ? "Nenhum produto cadastrado."
            : "Nenhum produto correspondente à pesquisa foi localizado.";

        linhaMensagem.appendChild(celMensagem);

        tabelaBody.appendChild(linhaMensagem);

        return;
    }

    produtosParaExibir.forEach((produto, index) => {

        const row = document.createElement("tr");

        const cellNome = document.createElement("td");
        cellNome.textContent = produto.nome;

        const cellPreco = document.createElement("td");

        cellPreco.textContent = produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const cellQtd = document.createElement("td");
        cellQtd.textContent = produto.quantidade;

        const cellSubtotal = document.createElement("td");

        cellSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        const cellAcoes = document.createElement("td");

        const btnEditar = document.createElement("button");

        btnEditar.textContent = "Editar";
        btnEditar.type = "button";
        btnEditar.className = "btn-editar";

        btnEditar.addEventListener("click", () => prepararEdicao(index));

        const btnRemover = document.createElement("button");

        btnRemover.textContent = "Remover";
        btnRemover.type = "button";
        btnRemover.className = "btn-remover";

        btnRemover.addEventListener("click", () =>
            solicitarRemocaoProduto(index)
        );

        cellAcoes.append(btnEditar, btnRemover);

        row.append(
            cellNome,
            cellPreco,
            cellQtd,
            cellSubtotal,
            cellAcoes
        );

        tabelaBody.appendChild(row);
    });
}

// ATUALIZAÇÃO DA INTERFACE

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

// ATUALIZAÇÃO DINÂMICA DA PESQUISA

campoBusca.addEventListener("input", atualizarInterface);

// LIMPA A MENSAGEM DE ERRO QUANDO O USUÁRIO CORRIGE OS CAMPOS

[campoNome, campoPreco, campoQuantidade].forEach((campo) => {
    campo.addEventListener("input", limparErro);
});

// INICIALIZAÇÃO

carregarDoLocalStorage();
atualizarInterface();