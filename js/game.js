// Variáveis globais
let score = 0;
let timeLeft = 60;
let gameActive = false;
let timer;
let treasureCount = 0;
let foundTreasures = 0;

// Elementos do DOM
const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const messageBox = document.getElementById('messageBox');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgainButton');

// Imagens para os tesouros
const treasureImages = [
    'treasure-chest.png',
    'gold-coins.png',
    'diamond.png',
    'ruby.png',
    'crown.png',
    'jewel.png'
];

// Sons do jogo
const sounds = {
    treasure: new Audio('sounds/treasure.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    gameOver: new Audio('sounds/game-over.mp3'),
    win: new Audio('sounds/win.mp3'),
    click: new Audio('sounds/click.mp3')
};

// Inicializar sons com volume baixo para evitar problemas em dispositivos móveis
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
    // Pré-carregar sons (isso ajuda em dispositivos móveis)
    sound.load();
});

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    startGame();
});

// Função para iniciar o jogo
function startGame() {
    // Reproduzir som de clique
    playSound('click');
    
    // Resetar variáveis
    score = 0;
    timeLeft = 60;
    gameActive = true;
    foundTreasures = 0;
    
    // Atualizar UI
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    startButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
    messageBox.innerHTML = '<p>Encontre os tesouros escondidos! Toque nos quadrados azuis.</p>';
    
    // Limpar tabuleiro e criar novo
    gameBoard.innerHTML = '';
    createGameBoard();
    
    // Iniciar temporizador
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

// Função para criar o tabuleiro do jogo
function createGameBoard() {
    // Determinar número de itens com base no tamanho da tela
    const isMobile = window.innerWidth < 768;
    const gridSize = isMobile ? 9 : 12; // 3x3 para mobile, 3x4 para desktop
    
    // Determinar número de tesouros (aproximadamente 1/3 dos itens)
    treasureCount = Math.floor(gridSize / 3);
    
    // Criar array com posições dos tesouros
    const treasurePositions = [];
    while (treasurePositions.length < treasureCount) {
        const position = Math.floor(Math.random() * gridSize);
        if (!treasurePositions.includes(position)) {
            treasurePositions.push(position);
        }
    }
    
    // Criar itens do tabuleiro
    for (let i = 0; i < gridSize; i++) {
        const item = document.createElement('div');
        item.className = 'item';
        
        // Verificar se este item é um tesouro
        const isTreasure = treasurePositions.includes(i);
        if (isTreasure) {
            item.classList.add('treasure');
            
            // Adicionar imagem aleatória de tesouro
            const img = document.createElement('img');
            const randomImage = treasureImages[Math.floor(Math.random() * treasureImages.length)];
            img.src = `images/${randomImage}`;
            img.alt = 'Tesouro';
            item.appendChild(img);
        } else {
            item.classList.add('empty');
            
            // Adicionar X para itens vazios
            const img = document.createElement('img');
            img.src = 'images/x-mark.png';
            img.alt = 'Vazio';
            item.appendChild(img);
        }
        
        // Adicionar evento de clique
        item.addEventListener('click', () => handleItemClick(item, isTreasure));
        
        // Adicionar ao tabuleiro
        gameBoard.appendChild(item);
    }
}

// Função para lidar com clique nos itens
function handleItemClick(item, isTreasure) {
    // Verificar se o jogo está ativo e se o item já foi revelado
    if (!gameActive || item.classList.contains('revealed')) {
        return;
    }
    
    // Revelar o item
    item.classList.add('revealed');
    
    if (isTreasure) {
        // Encontrou um tesouro
        playSound('treasure');
        item.classList.add('pulse');
        score += 10;
        scoreElement.textContent = score;
        foundTreasures++;
        
        // Verificar se todos os tesouros foram encontrados
        if (foundTreasures >= treasureCount) {
            // Bônus por encontrar todos os tesouros
            const timeBonus = timeLeft * 2;
            score += timeBonus;
            endGame(true);
        }
    } else {
        // Encontrou um item vazio
        playSound('wrong');
        item.classList.add('shake');
        score = Math.max(0, score - 5); // Não deixar pontuação ficar negativa
        scoreElement.textContent = score;
    }
}

// Função para atualizar o temporizador
function updateTimer() {
    if (!gameActive) return;
    
    timeLeft--;
    timerElement.textContent = timeLeft;
    
    // Verificar se o tempo acabou
    if (timeLeft <= 0) {
        endGame(false);
    }
    
    // Avisos de tempo
    if (timeLeft === 30) {
        messageBox.innerHTML = '<p>Metade do tempo já passou!</p>';
    } else if (timeLeft === 10) {
        messageBox.innerHTML = '<p>Apenas 10 segundos restantes!</p>';
    }
}

// Função para finalizar o jogo
function endGame(isWin) {
    gameActive = false;
    clearInterval(timer);
    
    // Revelar todos os tesouros não encontrados
    document.querySelectorAll('.item.treasure:not(.revealed)').forEach(item => {
        item.classList.add('revealed');
    });
    
    // Atualizar pontuação final
    finalScoreElement.textContent = score;
    
    // Mostrar tela de fim de jogo
    gameOverScreen.classList.add('active');
    
    // Reproduzir som apropriado
    playSound(isWin ? 'win' : 'gameOver');
    
    // Atualizar mensagem com base no resultado
    const gameOverTitle = gameOverScreen.querySelector('h2');
    if (isWin) {
        gameOverTitle.textContent = 'Parabéns!';
        gameOverScreen.querySelector('p').innerHTML = 
            `Você encontrou todos os tesouros!<br>Sua pontuação final: <span id="finalScore">${score}</span>`;
    } else {
        gameOverTitle.textContent = 'Tempo Esgotado!';
    }
}

// Função para reproduzir sons
function playSound(soundName) {
    // Verificar se o som existe
    if (!sounds[soundName]) return;
    
    // Reiniciar o som antes de reproduzir (para poder tocar várias vezes)
    const sound = sounds[soundName];
    sound.currentTime = 0;
    
    // Tentar reproduzir o som (pode falhar em alguns dispositivos móveis)
    const playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Erro ao reproduzir som:', error);
        });
    }
}

// Função para lidar com orientação do dispositivo
window.addEventListener('resize', () => {
    if (gameActive) return; // Não recriar durante o jogo
    
    // Recriar tabuleiro se o jogo não estiver ativo
    gameBoard.innerHTML = '';
    if (startButton.style.display === 'none') {
        createGameBoard();
    }
});

// Mensagem inicial
messageBox.innerHTML = '<p>Toque em "Iniciar Jogo" para começar a caçada ao tesouro!</p>';
