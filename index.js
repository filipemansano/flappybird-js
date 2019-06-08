class Component {

    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

let debug = true;

//////////////// Configurações de jobabilidade ///////////////////
let level = 0; // nivel inicial do jogo
let levelMax = 4; // quantidade de niveis disponível (0 conta)
let speed = [40, 30, 20, 10, 5]; // velocidade do jogo
let boxGravity = [0.4, 0.6, 0.8, 1, 1.3]; // gravidade que puxa o player para cima ou para baixo
let barDistance = [200, 180, 160, 140, 120]; // distancia de uma coluna para outra
let minLeaf = [100, 90, 80, 70, 60]; // espaço maximo para a lacuna das barras
let barsToDarkMode = 6; // barras para atilet o dark mode
let barsToDificultScale = 2; // quantas barras deve consumir para aumentar o nivel
//////////////// Configurações de jobabilidade ///////////////////

let width = 600; // largura do canvas
let height = 270; // altura do canvas

let maxLeaf = 110; // espaço minimo para a lacuna das barras

let barColor = ["green", "red"]; // cores das barras no light e dark mode
let boxColor = ["red", "white"]; // cores do player no light e dark mode
let scoreColor = ["black", "white"]; // cores do player no light e dark mode

let minBarHeight = 10; // altura minina de uma coluna
let maxBarHeight = 150; // altura maxima de uma coluna
let barWidth = 20; // largura da coluna

let currentColorScheme = 0; // esquema de cor atual do jogo (0 = light mode, 1 = darkmode)
let barsComplete = 0; // quantas barras foram concluidas

let initialBoxX = 20;
let initialBoxY = 40;
let box = new Component(initialBoxX, initialBoxY, 30, 30); // player do jogo

let boxAction = "down";
let boxInterval = null;
let areaInterval = null;

let scoreFont = "30px Arial";
let score = 0;

let panelArea = document.getElementById("canvas-panel"); // elemento que contem o canvas do palco
let boxArea = document.getElementById("canvas-box"); // elemento que contem o canvas do player

let canvasArea = panelArea.getContext("2d"); // canvas do cenário de fundo
let canvasBox = boxArea.getContext("2d"); // canvas do player

let bars; // Array de barras
let bgSoundSource = null; // audiocontext da musica de fundo

let sounds = {
    "dead" : {
        url : "sounds/die.mp3"
    },
    "background" : {
        url : "sounds/background.mp3"
    },
    "coin" : {
        url : "sounds/coin.mp3"
    }
}

////////////// Controladores de audio ////////////////
let soundContext = new AudioContext();

function loadSound(name) {

    let sound = sounds[name];

    let url = sound.url;

    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        soundContext.decodeAudioData(request.response, function (newBuffer) {
            sound.buffer = newBuffer;
        });
    }

    request.send();
}

function playSound(name, options) {

    let sound = sounds[name];
    let soundVolume = sounds[name].volume || 1;

    let buffer = sound.buffer;
    if (buffer) {
        let source = soundContext.createBufferSource();
        source.buffer = buffer;

        let volume = soundContext.createGain();

        if (options) {
            if (options.volume) {
                volume.gain.value = soundVolume * options.volume;
            }
        } else {
            volume.gain.value = soundVolume;
        }

        volume.connect(soundContext.destination);
        source.connect(volume);
        source.start(0);

        return source;
    }
}

for(var sound in sounds) {
    loadSound(sound);
}
////////////// Controladores de audio ////////////////

// atribuindo a largura e altura definida aos canvass
panelArea.height = height;
panelArea.width = width;
boxArea.height = height;
boxArea.width = width;

/**
 * Calcula um numero aleatório entre um valor minimo e o maximo
 * @param min int valor minimo possivel
 * @param max int valor máximo possivel
 */
function calcRandomSpace(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Cria uma dupla de barras (do topo e do rodapé)
 * @param offsetWidth int distância X da esquerda para direita 
 */
function createBar(offsetWidth) {

    // calculando a lacuna para o "player" passar entre as barras
    let leafDistance = calcRandomSpace(minLeaf[level], maxLeaf);

    // alturar disponível para gerar as duas barras do topo e do rodapé (altura do palco - tamanho da lacuna)
    let diffHeight = height - leafDistance;

    /**
     * Se o tamanho que sobrar para o desenho da coluna for menor que o tamanho maximo permitido para a coluna
     * então o novo tamanho maximo será oque sobrou - 30px (para sobrar 30px no desenho da coluna de baixo)
     */
    let maxHeight = diffHeight < maxBarHeight ? (diffHeight - 30) : maxBarHeight

    let topHeight = calcRandomSpace(minBarHeight, maxHeight); // tamanho da coluna do topo
    let bottomHeight = height - (topHeight + leafDistance); // tamanho da colua do rodapé

    /**
     * Colocando as barras na fila
     * o X sera a distância de uma barra para outra *2 para da o espaço para o player
     * o Y do topo será 0 e do rodapé sera o tamanho do topo + o lacuna
     * o W é a largura definida nas variaveis
     * o H é o tamanho calculado aletóriamente
     */
    bars.push({
        top: new Component(width - offsetWidth, 0, barWidth, topHeight),
        bottom: new Component(width - offsetWidth, (topHeight + leafDistance), barWidth, bottomHeight),
        number: bars.length,
        freeSpace: {
            begin: topHeight + 1,
            end: (topHeight + leafDistance)
        }
    });

    if(debug){
        console.log("Barra criada");
    }
}

/**
 * Percorre a array de barras e desenha elas no palco baseado em suas coordenadas
 */
function drawArea() {

    // pegando a cor atual das barras
    let currentBarColor = barColor[currentColorScheme];
    let currentScoreFont = scoreColor[currentColorScheme];

    canvasArea.clearRect(0, 0, width, height);

    for (let i = 0; i < bars.length; i++) {

        let bar = bars[i];

        canvasArea.fillStyle = currentBarColor;
        canvasArea.fillRect(bar.top.x, bar.top.y, bar.top.w, bar.top.h);

        canvasArea.fillStyle = currentBarColor;
        canvasArea.fillRect(bar.bottom.x, bar.bottom.y, bar.bottom.w, bar.bottom.h);
    }

    let thousandPoint = parseInt(score / 1000);

    canvasArea.font = scoreFont;
    canvasArea.fillStyle = currentScoreFont;
    canvasArea.fillText("Score: " + ++score, (width - 150) - (thousandPoint * 12), 30);

    canvasArea.fillText("Nível: " + (level + 1), 10, 30);
}

/**
 * Desenha o player no palco baseado em suas coordenadas
 */
function drawBox() {

    let currentBoxColor = boxColor[currentColorScheme];

    canvasBox.clearRect(0, 0, width, height);

    canvasBox.fillStyle = currentBoxColor;
    canvasBox.fillRect(box.x, box.y, box.w, box.h);
}

/**
 * Movimento das barras para a esquerda
 * percorre todas barras da array e decrementa 1px da sua posição X
 */
function walk() {

    for (let i = 0; i < bars.length; i++) {

        --bars[i].top.x;
        --bars[i].bottom.x;

        /**
         * Se a posição X da barra atual do laço for o tamanho da barra negativa
         * significa que essa barra saiu totalmente do palco então ela deve ser
         * removida
         */
        if (bars[i].top.x < barWidth * (-1)) {

            ++barsComplete; // incrementa o contador de barras completadas
            playSound("coin", { volume: 10 });
            bars.splice(i, 1); // remove a barra

            if(debug){
                console.log("+1 ponto");
            }

            /**
             * Se a quantidade de barra completa for equivalente a quantidade
             * necessária para entra no dark mode troco o esquema de cor
             */
            if (barsComplete % barsToDarkMode == 0) {
                panelArea.classList.toggle("dark");
                currentColorScheme = currentColorScheme === 0 ? 1 : 0;

                if(debug){
                    console.log("Tema trocado");
                }
            }

            /**
             * Se a quantidade de barra completa for equivalente a quantidade
             * necessária para entra trocar o nivel, incremento o nivel
             */
            if (barsComplete % barsToDificultScale == 0) {

                if (level < levelMax) {

                    if(debug){
                        console.log("Level concluido");
                    }

                    ++level;

                    // Altero o intervalo de tempo da renderização da area
                    clearInterval(areaInterval);
                    areaInterval = setInterval(walk, speed[level]);
                }
            }
        }
    }

    // após mover todas barra verifica se tem espaço disponível para criação de uma nova
    if (checkFreeSpace()) {
        createBar(0);
    }

    // verifica a colisão do player com a barra
    colisionCheck();

    // re-desenha a area
    drawArea();
}

/**
 * Verifica a colisão do player com as barras
 */
function colisionCheck() {

    let boxColisionXBegin = box.x;
    let boxColisionXEnd = (box.x + box.w) - 1;
    let boxColisionYBegin = box.y;
    let boxColisionYEnd = (box.y + box.h) + 1;

    let firstBar = bars[0];

    // Se a posição X do player for maior ou igual a posição X da primeria barra
    if (boxColisionXEnd >= firstBar.top.x && boxColisionXBegin <= (firstBar.top.x + barWidth)) {

        if(debug){
            console.log("Risco de colisão no eixo Y!");
        }

        /**
         * Se o inicio da box for maior ou igual o inicio do espaço em branco
         * e o fim da box for menor ou igual o fim do espaço em braco significa que passou
         * caso contrario foi uma colisão
         */
        if (!(boxColisionYBegin >= firstBar.freeSpace.begin && boxColisionYEnd <= firstBar.freeSpace.end)) {
            stop();
        }
    }
}

/**
 * Encerra o jogo
 */
function stop() {

    if(debug){
        console.log("Bereréééu Morreu!");
        console.log(box);
        console.log(bars[0]);
    }

    clearInterval(areaInterval);
    clearInterval(boxInterval);

    bgSoundSource.stop();
    playSound("dead");
    document.getElementById('btnStart').style.display = 'block';
}

/**
 * Verifica se tem espaço disponivel no painel para criar mais uma barra
 */
function checkFreeSpace() {

    if (bars.length == 0) {
        return true;
    }

    // Ultima coluna
    let lastBar = bars[bars.length - 1];

    // Distancia que a coluna ocupa no canvas
    let widthX = barWidth + barDistance[level];

    return lastBar.top.x < width - widthX;
}

/**
 * Verifica a ação do player
 */
function verifyBoxAction() {

    if (boxAction == "down") {
        if (box.y < (height - box.w)) {
            box.y += boxGravity[level];
        }
    } else {
        if (box.y > 0) {
            box.y -= boxGravity[level];
        }
    }

    drawBox();
}

function upBox(){
    boxAction = "up";
}

function downBox(){
    boxAction = "down";
}

function start() {

    if(debug){
        console.log("Jogo iniciado");
    }

    // resetanto todas variaveis
    bars = [];
    level = 0;
    box.x = initialBoxX;
    box.y = initialBoxY;
    score = 0;
    barsComplete = 0;
    currentColorScheme = 0;
    panelArea.className = "";

    bgSoundSource = playSound("background", { volume: .5 });
    bgSoundSource.loop = true;
    document.getElementById('btnStart').style.display = 'none';

    // Distancia que a coluna ocupa no canvas
    let distanceX = barWidth + barDistance[level];

    // tamanho maximo de barras que cabe no palco
    let maxBar = Math.floor(width / distanceX);

    // criando as barras iniciais
    for (maxBar; maxBar >= 1; maxBar--) {
        createBar(distanceX * maxBar);
    }

    // mobile touch
    document.body.addEventListener("touchstart", upBox, false);

    // mobile touch end
    document.body.addEventListener("touchend", downBox, false);
    document.body.addEventListener("touchcancel", downBox, false);
    document.body.addEventListener("touchleave", downBox, false);

    // Pressionou barra de espaço
    document.body.onkeydown = function (e) {
        if (e.keyCode == 32) {
            upBox();
        }
    }

    // Soltou barra de espaço
    document.body.onkeyup = function (e) {
        if (e.keyCode == 32) {
            downBox();
        }
    }

    areaInterval = setInterval(walk, speed[level]);
    boxInterval = setInterval(verifyBoxAction, 10);
}