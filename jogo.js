const cartas = document.querySelectorAll('.carta');
const pontosJ1 = document.querySelector('.pontos-jogador1');
const pontosJ2 = document.querySelector('.pontos-jogador2');
const machadoImg = document.getElementById('machado');
const clarisseImg = document.getElementById('clarisse');

let primeiraCarta = null;
let segundaCarta = null;
let bloqueio = false;
let jogadorAtual = 1; // 1 = Machado, 2 = Clarisse
let pontos1 = 0;
let pontos2 = 0;

let totalPairs = Math.floor(cartas.length / 2);
let matchedPairs = 0;

let cronometroInterval = null;
let gameEnded = false;

atualizarTurnoVisual();

// --- Virar carta ---
function virarCarta() {
  if (bloqueio) return;
  if (this === primeiraCarta) return;
  if (gameEnded) return; // protege caso o jogo já tenha terminado

  this.classList.add('virada');

  if (!primeiraCarta) {
    primeiraCarta = this;
    return;
  }

  segundaCarta = this;
  checarCombinação();
}

// --- Checar combinação ---
function checarCombinação() {
  const combinou =
    primeiraCarta.querySelector('.frente').src ===
    segundaCarta.querySelector('.frente').src;

  if (combinou) {
    adicionarPontos(); // aqui incrementa pontos e matchedPairs
    resetarCartas(true);
  } else {
    bloqueio = true;
    setTimeout(() => {
      primeiraCarta.classList.remove('virada');
      segundaCarta.classList.remove('virada');
      mudarTurno();
      resetarCartas(false);
    }, 1000);
  }
}

// --- Adicionar pontos ---
function adicionarPontos() {
  if (jogadorAtual === 1) {
    pontos1 += 50;
    pontosJ1.textContent = `PTS ${pontos1.toString().padStart(3, '0')}`;
    pontosJ1.style.transform = "scale(1.1)";
    pontosJ1.style.opacity = "1";
    pontosJ1.style.transition = ".5s ease";
    pontosJ2.style.transition = ".5s ease";
    pontosJ2.style.transform = "scale(1)";
    pontosJ2.style.opacity = "0.65";
  } else {
    pontos2 += 50;
    pontosJ2.textContent = `PTS ${pontos2.toString().padStart(3, '0')}`;
    pontosJ2.style.transform = "scale(1.1)";
    pontosJ2.style.opacity = "1";
    pontosJ2.style.transition = ".5s ease";
    pontosJ1.style.transition = ".5s ease";
    pontosJ1.style.transform = "scale(1)";
    pontosJ1.style.opacity = "0.65";
  }

  // Contador de pares encontrados
  matchedPairs += 1;

  // Se encontrou todos os pares -> encerra o jogo
  if (matchedPairs >= totalPairs) {
    endGame('completo');
  }
}

// --- Mudar turno ---
function mudarTurno() {
  jogadorAtual = jogadorAtual === 1 ? 2 : 1;
  atualizarTurnoVisual();
}

// --- Atualizar transparência dos personagens ---
function atualizarTurnoVisual() {
  if (jogadorAtual === 1) {
    machadoImg.style.opacity = "1";
    machadoImg.style.transform = "scale(1.1)";
    clarisseImg.style.opacity = "0.4";
    clarisseImg.style.transform = "scale(1)";
    clarisseImg.style.transition = "transform 1.3s ease";
  } else {
    clarisseImg.style.opacity = "1";
    clarisseImg.style.transform = "scale(1.1)";
    machadoImg.style.opacity = "0.4";
    machadoImg.style.transform = "scale(1)";
    machadoImg.style.transition = "transform 1.3s ease";
  }
}

// --- Resetar cartas ---
function resetarCartas(combinou) {
  if (combinou) {
    primeiraCarta.removeEventListener('click', virarCarta);
    segundaCarta.removeEventListener('click', virarCarta);
    // opcional: desabilitar pointer events nas cartas encontradas
    primeiraCarta.style.pointerEvents = "none";
    segundaCarta.style.pointerEvents = "none";
  }
  [primeiraCarta, segundaCarta] = [null, null];
  bloqueio = false;
}

// --- Embaralhar cartas ---
(function embaralhar() {
  cartas.forEach(carta => {
    let posicaoAleatoria = Math.floor(Math.random() * cartas.length);
    carta.style.order = posicaoAleatoria;
  });
})();

cartas.forEach(carta => carta.addEventListener('click', virarCarta));

// ====================== CONTAGEM INICIAL ======================
const telaContagem = document.getElementById("tela-contagem");
const numeroContagem = document.getElementById("numero-contagem");

let contagem = 3;
if (numeroContagem) numeroContagem.textContent = contagem;

// Desativa cliques enquanto a contagem acontece
cartas.forEach(c => c.style.pointerEvents = "none");

const intervaloContagem = setInterval(() => {
  contagem--;
  if (numeroContagem) {
    if (contagem > 0) {
      numeroContagem.textContent = contagem;
    } else if (contagem === 0) {
      numeroContagem.textContent = "VALENDO!!!";
    } else {
      clearInterval(intervaloContagem);
      if (telaContagem) {
        telaContagem.style.opacity = "0";
        setTimeout(() => telaContagem.style.display = "none", 600);
      }

      // Libera as cartas e inicia o cronômetro
      cartas.forEach(c => c.style.pointerEvents = "auto");
      iniciarCronometro();
    }
  }
}, 1000);


// ====================== CRONÔMETRO COM BARRA DINÂMICA ======================

let tempoTotal = 180;
let tempoRestante = tempoTotal;

const tempoSpan = document.getElementById("tempo");
const barraTempo = document.getElementById("barra-tempo");

function iniciarCronometro() {
  // guarda o id para podermos limpar depois
  cronometroInterval = setInterval(() => {
    // se o jogo já terminou, garante que o intervalo será limpo
    if (gameEnded) {
      clearInterval(cronometroInterval);
      return;
    }

    if (tempoRestante <= 0) {
      clearInterval(cronometroInterval);
      tempoSpan.textContent = "00:00";
      barraTempo.style.width = "0%";
      endGame('tempo'); // fim por tempo
      return;
    }

    tempoRestante--;
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    if (tempoSpan) tempoSpan.textContent = `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

    const porcentagem = (tempoRestante / tempoTotal) * 100;
    if (barraTempo) barraTempo.style.width = `${porcentagem}%`;
  }, 1000);
}

// --- função que finaliza o jogo mostrando o pop-up (mesma UI do fim) ---
function endGame(reason) {
  if (gameEnded) return; // evita execução dupla
  gameEnded = true;

  // Para o cronômetro caso esteja rodando
  if (cronometroInterval) {
    clearInterval(cronometroInterval);
  }

  // Desabilita cliques em todas as cartas
  cartas.forEach(c => c.style.pointerEvents = "none");

  // Determina vencedor baseado na pontuação
  let vencedor = "";
  if (pontos1 > pontos2) {
    vencedor = "🏆 MACHADO DE ASSIS venceu!";
  } else if (pontos2 > pontos1) {
    vencedor = "🏆 CLARICE LISPECTOR venceu!";
  } else {
    vencedor = "🤝 Empate!";
  }

  // Exibe o mesmo pop-up do fim de jogo
  setTimeout(() => {
    const popup = document.getElementById("popup-fim");
    const mensagem = document.getElementById("mensagem-fim");
    const botao = document.getElementById("botao-reiniciar");

    if (mensagem) mensagem.innerHTML = `${vencedor}<br><br>Obrigado por jogar!`;
    if (popup) popup.style.display = "flex";

    if (botao) {
      // remove listeners anteriores para não duplicar
      botao.replaceWith(botao.cloneNode(true));
      const novoBotao = document.getElementById("botao-reiniciar");
      novoBotao.addEventListener("click", () => location.reload());
    }
  }, 500);
}
