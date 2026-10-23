// Conteúdo da apostila: seleção de elementos, eventos e alteração do DOM.
const nome = document.querySelector('#nome');
const titulo = document.querySelector('#nome-no-campo');
const jogadores = document.querySelectorAll('.jogador');
const nomesNoCampo = document.querySelectorAll('.nome-jogador');
const quantidade = document.querySelector('#quantidade');
const situacao = document.querySelector('#situacao');

// O if evita executar este trecho nas páginas que não têm o formulário.
if (nome) {
  nome.addEventListener('input', function () {
    titulo.textContent = nome.value;
    if (nome.value == '') {
      titulo.textContent = 'Meu onze ideal';
    }
  });

  function atualizarCampo() {
    let total = 0;

    // O for percorre as onze listas de jogadores.
    for (let i = 0; i < jogadores.length; i++) {
      if (jogadores[i].value != '') {
        nomesNoCampo[i].textContent = jogadores[i].value;
        nomesNoCampo[i].classList.add('escalado');
        total = total + 1;
      } else {
        nomesNoCampo[i].textContent = 'Camisa disponível';
        nomesNoCampo[i].classList.remove('escalado');
      }
    }

    quantidade.textContent = total;
    situacao.textContent = 'Escolha um jogador em cada posição.';
    if (total == 11) {
      situacao.textContent = 'Time completo! Dê um nome e salve.';
    }
  }

  for (let i = 0; i < jogadores.length; i++) {
    jogadores[i].addEventListener('change', atualizarCampo);
  }

  // Também mostra a escalação quando abrimos a página de edição.
  atualizarCampo();
}


// Integração do projeto com a API Flask: GET para listar e POST para cadastrar.
const API_URL = 'http://localhost:5000/times';
const formularioTime = document.querySelector('#form-time');
const listaTimesApi = document.querySelector('#lista-times-api');
const mensagemApi = document.querySelector('#mensagem-api');
const botaoAtualizar = document.querySelector('#atualizar-times');

async function listarTimes() {
  if (!listaTimesApi || !mensagemApi) return;

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error('Não foi possível carregar os times.');
    const times = await resposta.json();

    listaTimesApi.replaceChildren();
    if (times.length === 0) {
      mensagemApi.textContent = 'Nenhum time cadastrado ainda. Monte sua primeira escalação!';
      return;
    }

    times.forEach((time) => {
      const cartao = document.createElement('article');
      cartao.className = 'cartao time-salvo';
      const titulo = document.createElement('h3');
      titulo.textContent = time.nome;
      const esquema = document.createElement('p');
      esquema.className = 'etiqueta';
      esquema.textContent = '4–3–3 / ONZE TITULAR';
      const jogadoresLista = document.createElement('ul');

      const posicoes = [
        ['PE', 'ponta_esquerda'], ['CA', 'centroavante'], ['PD', 'ponta_direita'],
        ['MEI', 'meia_esquerda'], ['VOL', 'volante'], ['MEI', 'meia_direita'],
        ['LE', 'lateral_esquerdo'], ['ZAG', 'zagueiro_esquerdo'],
        ['ZAG', 'zagueiro_direito'], ['LD', 'lateral_direito'], ['GOL', 'goleiro']
      ];

      posicoes.forEach(([sigla, campo]) => {
        const item = document.createElement('li');
        const posicao = document.createElement('span');
        posicao.textContent = sigla;
        item.append(posicao, document.createTextNode(time[campo]));
        jogadoresLista.appendChild(item);
      });

      cartao.append(esquema, titulo, jogadoresLista);
      listaTimesApi.appendChild(cartao);
    });

    mensagemApi.textContent = `${times.length} time(s) encontrado(s).`;
  } catch (erro) {
    mensagemApi.textContent = 'Não foi possível conectar à API. Confira se o Flask e o MySQL estão ligados.';
  }
}

if (formularioTime) {
  formularioTime.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const botaoEnviar = formularioTime.querySelector('button[type="submit"]');
    botaoEnviar.disabled = true;

    const dados = Object.fromEntries(new FormData(formularioTime).entries());
    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.erro || 'Erro ao cadastrar o time.');

      mensagemApi.textContent = 'Time cadastrado com sucesso!';
      formularioTime.reset();
      if (titulo) titulo.textContent = 'Meu onze ideal';
      jogadores.forEach((jogador) => jogador.dispatchEvent(new Event('change')));
      await listarTimes();
    } catch (erro) {
      mensagemApi.textContent = erro.message || 'Erro ao enviar os dados para a API.';
    } finally {
      botaoEnviar.disabled = false;
    }
  });
}

if (botaoAtualizar) botaoAtualizar.addEventListener('click', listarTimes);
listarTimes();
