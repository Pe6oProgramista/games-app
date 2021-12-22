class Game {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.stopped = true;
        this.lastUpdate = Date.now();
    }

    saveResults() {
        // TODO
        console.log('Results saved!');
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    start() {
        this.stopped = false;
        this.setup();
        window.requestAnimationFrame(this.loop.bind(this));
    }
    
    pause() {
        if(!this.stopped) {
            this.stopped = true;
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    resume() {
        if(this.stopped) {
            this.stopped = false;
            this.ctx.restore();
            this.loop();
        }
    }

    stop() {
        this.stopped = true;
        this.clear();
    }

    loop(time_ms) {
        if(this.stopped) return;
        this.update(time_ms);
        window.requestAnimationFrame(this.loop.bind(this));
    }

    setup() {
        console.log('Implement setup function');
    }


    update(time_ms) {
        console.log('Implement update function');
    }
}



var games = [];
const playground = document.getElementById('playground');
const gameCanvas = document.getElementById('game-canvas');
var lastGameId;
var game;

setupPlayground();

function setupPlayground() {
    [].forEach.apply(document.getElementsByClassName('game-img'), [img => {
        img.addEventListener('click', onClickImg);
    }])
    
    playground.addEventListener('click', (e) => { if(e.target === playground) endGame(game) })
}

function endGame(game) {
    game.saveResults();
    game.stop();
    playground.style.display = 'none';
}

function onClickImg(event) {
    const img = event.target;
    
    const id = img.getAttribute('game_id');
    
    // TODO vlidate id
    
    lastGameId = id;
    
    // dynamicallyLoadScript('/static/js/games/game.1.js')
    if(!gameCanvas) {
        console.log('Missing canvas element');
        return;
    }
    game = games[id](gameCanvas);
    game.start();
    
    playground.style.display = 'flex';
}


function dynamicallyLoadScript(url) {
    var script = document.createElement("script");  // create a script DOM node
    script.src = url;  // set its src to the provided URL

    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}