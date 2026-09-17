
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
const formProduto = document.getElementById("produto-form");

formProduto.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    if (parseFloat(precoInput) <= 0 || parseInt(quantidadeInput) <= 0) {
        alert("O preço e a quantidade devem ser maiores que zero.");
        return;
    }

    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
    listaDeProdutos.push(novoProduto);

    renderizarTabela();
    formProduto.reset();
});

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2).replace(".", ",")}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2).replace(".", ",")}</td>
            <td><button class="btn-remover" onclick="removerProduto(${index})">Remover</button></td>
        `;

        tabelaBody.appendChild(linha);
    });

    atualizarTotal();
}

function removerProduto(index) {
    listaDeProdutos.splice(index, 1);
    renderizarTabela();
}

function atualizarTotal() {
    let total = 0;

    listaDeProdutos.forEach((produto) => {
        total += produto.calcularSubtotal();
    });

    document.getElementById("total-estoque").textContent =
        `Total em estoque: R$${total.toFixed(2).replace(".", ",")}`;
}

document.getElementById("limpar-tabela").addEventListener("click", function() {
    listaDeProdutos.length = 0;
    renderizarTabela();
});

