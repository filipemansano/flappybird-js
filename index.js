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
let speed = [20, 15, 10, 5, 3]; // velocidade do jogo
let boxGravity = [0.8, 0.9, 1, 1.15, 1.3]; // gravidade que puxa o player para cima ou para baixo
let barDistance = [190, 180, 200, 220, 240]; // distancia de uma coluna para outra
let minLeaf = [80, 75, 70, 60, 50]; // espaço maximo para a lacuna das barras
let barsToDarkMode = 10; // barras para atilet o dark mode
let barsToNextLevel = [1, 2, 5, 10]; // quantas barras deve consumir para aumentar o nivel
//////////////// Configurações de jobabilidade ///////////////////

let width = window.innerWidth - 20; // largura do canvas
let height = window.mobileAndTabletcheck ? window.innerHeight - 20 : 270; // altura do canvas

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
    "day" : {
        url : "sounds/background.mp3"
    },
    "night" : {
        url : "sounds/background_night.mp3"
    },
    "coin" : {
        url : "sounds/coin.mp3"
    }
}

/////////////// Mobile Check ///////////////////
window.mobileAndTabletcheck = function () {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
return check;
};
/////////////// Mobile Check ///////////////////

////////////// Controladores de audio ////////////////
let soundContext = new AudioContext();
let soundController = true;

function switchSound(){
    soundController = !soundController;

    if(soundController === false){
        document.getElementById('soundController').innerHTML = 'Off';
        
        if(bgSoundSource != null){
            bgSoundSource.stop();
        }

    }else{
        document.getElementById('soundController').innerHTML = 'On';
        playBackGroundMusic();
    }
}

function playBackGroundMusic(){
    bgSoundSource = playSound(currentColorScheme === 0 ? "day" : "night", { volume: .5 });
    bgSoundSource.loop = true;
}

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

    if(soundController === false){
        return false;
    }

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

                bgSoundSource.stop();

                if(currentColorScheme === 0){
                    bgSoundSource = playSound("night", { volume: .5 });
                    currentColorScheme = 1;
                }else{
                    bgSoundSource = playSound("day", { volume: .5 });
                    currentColorScheme = 0;
                }

                if(debug){
                    console.log("Tema trocado");
                }
            }

            /**
             * Se a quantidade de barra completa for igual a quantidade
             * necessária para entra trocar o nivel, incremento o nivel
             */
            if (level < levelMax && barsComplete == barsToNextLevel[level]) {

                // zerando o controlador de barras completa até o proximo nivel
                barsComplete = 0;
                ++level;

                if(debug){
                    console.log("Level antingido: "+level);
                }

                // Altero o intervalo de tempo da renderização da area
                clearInterval(areaInterval);
                areaInterval = setInterval(walk, speed[level]);
                
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
    let boxColisionYEnd = (box.y + box.h) - 1;

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
    document.getElementById('btnStart').style.display = 'inline-block';
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

    if(soundController){
        playBackGroundMusic();
    }

    document.getElementById('btnStart').style.display = 'none';

    // Distancia que a coluna ocupa no canvas
    let distanceX = barWidth + barDistance[level];

    // tamanho maximo de barras que cabe no palco
    let maxBar = Math.floor(width / distanceX);

    // criando as barras iniciais
    for (let i = (maxBar - 1); i >= 1; i--) {
        createBar(distanceX * i);
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