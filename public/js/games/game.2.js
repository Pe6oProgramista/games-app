function game2(canvas) {
    const random = function(min, max) {
        return Math.random() * (max - min) + min;
    }

    class Vector {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    }

    class Ball {
        constructor({ x, y, vx, vy, r, color, collideColor }) {
            this.pos = new Vector(x, y);
            this.vel = new Vector(vx, vy);
            this.r = r;
            this.color = color || 'orange';
            this.collideColor = collideColor || 'red';
        }

        draw (ctx, options = {time_delta_ms: 0, collide: false}) {
            // ctx.save();
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI); // check color with diff angle
            ctx.closePath();
            ctx.fillStyle = options.collide ? this.collideColor : this.color; // check without changig color
            ctx.fill();
            // ctx.restore();
            
            let newPos = new Vector(
                this.pos.x + this.vel.x * options.time_delta_ms,
                this.pos.y + this.vel.y * options.time_delta_ms);
                
            if (newPos.x > ctx.canvas.width || newPos.x < 0) {
                this.vel.x = -this.vel.x;
                return;
            }            
            if (newPos.y > ctx.canvas.height || newPos.y < 0) {
                this.vel.y = -this.vel.y;
                return;
            }
            this.pos = {...newPos}
        }
            
        mouseOver (mousePos) {
            return (mousePos.x - this.pos.x) ** 2 + (mousePos.y - this.pos.y) ** 2 <= this.r ** 2
        }
    }
        
    class Mouse {
        constructor(canvas) {
            this.pos = new Vector();
            this.canvas = canvas;
        }

        posHandler = (event) => { // arrow function auto bind it
            this.pos = Mouse.getPosAt(this.canvas, event);
        }
        
        static getPosAt(canvas, e) {
            const rect = canvas.getBoundingClientRect(); // or canvas.offsetLeft , canvas.offsetTop
            
            return new Vector(
                e.clientX - rect.left,
                e.clientY - rect.top);
        }
    }

    
    
    const MAX_BALL_R = 60;
    const MIN_BALL_R = 15;
    const INITIAL_VEL = 0.4;
    const FONT_COLOR = 'green';
    const FONT = '25px Arial'; // Comic Sans MS
    
    

    console.log('Hello from game 1');
    let game = new Game(canvas, 2);
    
    
    const PressSpaceToRestartHandler = (function(event) {
        if (event.code === 'Space' && this.isOver) {
            this.restart();
            this.isOver = false;
        }
    }).bind(game)

    game.setCollided = function(timeout = 1000) {
        this.collide = true;
        clearTimeout(this.collideTimer);
        this.collideTimer = setTimeout(_ => this.collide = false, timeout);
    }
        
    game.randomBall = function() {
        const r = random(MIN_BALL_R, MAX_BALL_R);
        const x = random(r, this.width - r);
        const y = (  (x + r < this.mouse.pos.x || x - r > this.mouse.pos.x)  &&  random(r, this.height - r)  )  ||  // x is outside mouse box
        (  Math.random() < 0.5  &&  random(r, this.mouse.pos.y - r)  ||  random(this.mouse.pos.y + r, this.height - r)  )
        
        return new Ball({
            x, y, r,
            vx: random(-INITIAL_VEL, INITIAL_VEL),
            vy: random(-INITIAL_VEL, INITIAL_VEL),
        })
    }
    
    game.newBallEach = function(ms = 5000) {
        return setInterval(() => this.balls.push(this.randomBall()), ms)
    }
    
    game.clearIntervals = function() {
        this.intervals.forEach(clearInterval);
    }
    
    game.gameOver = function() {
        this.isOver = true;
        this.balls = [];
        if (this.score > this.highScore)
            this.highScore = this.score;
        
        // this.ctx.save();
        // this.globalAlpha = 0.5; // for images
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.font = FONT;
        this.ctx.fillStyle = FONT_COLOR;
        this.ctx.fillText('Game Over. Press space to restart.', this.width/2 - 200, this.height/2);
    }

    game.isMouseCollide = function() {
        if (this.collide) return;
        if (this.mouse.pos.y > this.height || this.mouse.pos.y < 0 || this.mouse.pos.x > this.width || this.mouse.pos.x < 0) {
            this.gameOver();
        }

        if (this.balls.some(b => b.mouseOver(this.mouse.pos))) {
            if (--this.lives == 0)
                this.gameOver();
            this.setCollided();
        }
    }

    game.restart = function() {
        this.lives = 3;
        this.score = 0;

        this.balls = [];
        for (let i = 0; i < 10; i++) {
            this.balls[i] = this.randomBall();
        }
        this.setCollided();
    }

    game.setup = function() {
        this.timeouts = [];
        this.intervals = [];

        this.balls = [];
        this.mouse = new Mouse(this.ctx.canvas);
        this.isOver = false;
        this.collide = false;
        this.collideTimer;

        // this.mouse2 = new Mouse(this.ctx.canvas);

        window.addEventListener('mousemove', this.mouse.posHandler);
        // window.addEventListener('mousemove', this.mouse2.posHandler);
        document.addEventListener('keyup', PressSpaceToRestartHandler);

        this.lives = 3;
        this.score = 0;
        // this.highScore = 0;
        this.last_time_ms = null;

        for (let i = 0; i < 10; i++) {
            this.balls[i] = this.randomBall();
        }
        this.setCollided();
    }

    game.update = function(time_ms) {
        const time_delta_ms = (this.last_time_ms === null)? 0 : time_ms - this.last_time_ms;
        this.last_time_ms = time_ms;

        if(this.stopped) {
            window.removeEventListener('mousemove', this.mouse.posHandler);
            document.removeEventListener('keyup', PressSpaceToRestartHandler);
            return;
        }
        if(this.isOver) return;
        this.score += time_delta_ms/1000;

        this.ctx.clearRect(0, 0, this.width, this.height);
        // this.ctx.fillStyle = `black`; // 'rgba(255, 255, 255, 0.5)';
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);


        this.balls.forEach(b => b.draw(this.ctx, {time_delta_ms, collide: this.collide}));
        this.ctx.font = FONT;
        this.ctx.fillStyle = FONT_COLOR;
        this.ctx.fillText(`Score: ${Math.round(this.score*100)/100}`, 10, 20);
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 40);
        this.ctx.fillText(`HighScore: ${this.highScore}`, 10, 60);
        this.isMouseCollide();
    }

    return game;
}

games[2] = game2;