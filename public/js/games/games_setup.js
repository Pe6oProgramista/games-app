// const parseResponse = res => {
//     return res.headers.get('content-type').includes('application/json') ?
//         res.json() :
//         res.text();
// }

class Game {
    constructor(canvas, id) {
        this.id = id;

        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.stopped = true;
        this.paused = false;
        this.last_time_ms = null;
        this.highScore = null;
    }

    async getScore() {
        await fetch('/api/users/current/scores/' + this.id, {
            method: 'GET'
        })
        .then(parseResponse)
        .catch(err => console.error('Response format is not JSON', err.stack))
        .then(async (res) => {
            if(res.body.score !== undefined && typeof res.body.score === 'number') {
                this.highScore = res.body.score;
            } else if(res.body.noRecord) {
                await this.initScore();
            } else {
                return void (window.location.href = window.location.origin + '/not_found');   
            }
        })
    }

    async initScore() {
        // let data = {highScore = 0}
        await fetch('/api/users/current/scores/' + this.id, {
            method: 'POST'
            // body: JSON.stringify(data)
        })
        .then(parseResponse)
        .catch(err => console.error('Response format is not JSON', err.stack))
        .then(res => {
            if(typeof res.body.score === 'number') {
                this.highScore = res.body.score;
            } else {
                return void (window.location.href = window.location.origin + '/not_found');
            }
        })
    }

    async saveScore() {
        // console.log('hScore',  this.highScore)
        await fetch('/api/users/current/scores/' + this.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ highScore: this.highScore? this.highScore : 0 })
        })
        .then(parseResponse)
        .catch(err => console.error('Response format is not JSON', err.stack))
        .then(res => {
            console.log('hScore',  this.highScore)
            if(res.body.success) {
                console.log('Results saved!');
            } else {
                return void (window.location.href = window.location.origin + '/not_found');
            }
        })
    }
    
    clear () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    async start () {
        await this.getScore();

        this.stopped = false;
        this.paused = false;
        // this.ctx.canvas.addEventListener('blur', (event) => {
        //     this.pause();
        // });
        
        this.setup();
        window.requestAnimationFrame(this.loop.bind(this));
    }
    
    pause () {
        if(!this.paused) {
            this.paused = true;
            this.last_time_ms = null;
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    resume () {
        if(this.paused) {
            this.paused = false;
            this.ctx.restore();
            this.last_time_ms = null;
            window.requestAnimationFrame(this.loop.bind(this));
        }
    }

    stop () {
        this.stopped = true;
        this.clear();
    }

    loop (time_ms) {
        if(this.paused) return;
        
        this.update(time_ms); // before 'if' to handle stopped and paused if something depend on this
        if(this.stopped) return;

        window.requestAnimationFrame(this.loop.bind(this));
    }

    setup () {
        console.log('Implement setup function');
    }


    update (time_ms) {
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
    // console.log(playground)
    playground.addEventListener('click', (e) => { if(e.target === playground) endGame(game) })
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && !e.repeat) {
            if (game.paused) game.resume();
            else game.pause();
        }
    })
}

function endGame(game) {
    game.saveScore();
    game.stop();
    playground.style.display = 'none';
}

function onClickImg(event) {
    const img = event.target;
    
    const id = img.getAttribute('game_id');
    
    // TODO vlidate id
    if(!games[id]) {
        console.log('Missing game with this Id: ', id);
        return;
    }
    
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