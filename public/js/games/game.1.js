function game1(canvas) {
    const random = function(min, max) {
        return Math.random() * (max - min) + min;
    }

    function copyInstance (original) {
        var copied = Object.assign(
            Object.create(
            Object.getPrototypeOf(original)
            ),
            original
        );
        return copied;
    }

    class Vector {
        constructor (x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        setXY (x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    }
    
    class Cloud {
        constructor (x, y, width, height, color) {
            this.pos = new Vector(x, y); // center pos
            this.vel = new Vector(random(-3, -1), 0);
            this.width = width;
            this.height = height;
            this.color = color || 'white';
        }

        randomize() {
            this.width = random(MIN_CLOUD_WIDTH, MAX_CLOUD_WIDTH);
            this.height = random(MIN_CLOUD_HEIGHT, Math.min(this.width, MAX_CLOUD_HEIGHT));
        }

        draw (ctx, options = {time_delta_ms: 0}) {
            ctx.beginPath();
            // ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
            ctx.ellipse(this.pos.x, this.pos.y, this.width/2, this.height/2, 0, 0, Math.PI*2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();

            this.pos.x += this.vel.x / 10 * options.time_delta_ms;
            if(this.pos.x + this.width/2 < 0) {
                this.pos.x = ctx.canvas.width + this.width/2;
                this.randomize();
            }
        }
    }

    class Obstacle {
        constructor (x, y, width, height, gap, color) {
            this.pos = new Vector(x, y);
            this.vel = new Vector(-10, 0);
            this.width = width;
            this.height = height;
            this.gap = gap;
            this.color = color || 'green';
        }

        randomize () {
            this.height = random(MIN_OBST_HEIGHT, MAX_OBST_HEIGHT);
            this.gap = random(MIN_OBST_GAP, MAX_OBST_GAP);
        }

        draw (ctx, options = {time_delta_ms: 0}) {
            let upper_obst = {x: this.pos.x, y: this.pos.y, width: this.width, height: this.height};
            let down_obst = {x: this.pos.x, y: this.height + this.gap, width: this.width, height: ctx.canvas.height - this.height - this.gap};

            ctx.fillStyle = this.color;
            ctx.fillRect(upper_obst.x, upper_obst.y, upper_obst.width, upper_obst.height);
            ctx.fillRect(down_obst.x, down_obst.y, down_obst.width, down_obst.height);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(upper_obst.x, upper_obst.y, upper_obst.width, upper_obst.height);
            ctx.strokeRect(down_obst.x, down_obst.y, down_obst.width, down_obst.height);
        
            this.pos.x += this.vel.x / 100 * options.time_delta_ms;
            if(this.pos.x + this.width < 0) {
                this.pos.x = ctx.canvas.width;
                this.randomize();
            }
        }
    }

    class Bird {
        static get GRAVITY() { return 0.007; }
        static get WIDTH() { return 40; }
        static get HEIGHT() { return 40; }
        static get INITIAL_VEL() { return new Vector(0, 0); }

        constructor (x, y, vx, vy, color) {
            this.pos = new Vector(x, y);
            this.vel = (vx && vy) ? new Vector(vx, vy) : {...Bird.INITIAL_VEL};
            // this.gravity_speed = 0;
            this.width = Bird.WIDTH;
            this.height = Bird.HEIGHT;
            this.color = color || 'yellow';
        }

        draw (ctx, options = {time_delta_ms: 0, acceleration: new Vector(), collide: false}) {
            // ctx.save();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
            // ctx.restore();
            
            this.vel.x += options.acceleration.x;
            if(this.vel.y ^ options.acceleration.y >= 0) { // if same signs
                this.vel.y += Bird.GRAVITY + options.acceleration.y;
            } else {
                // this is a cheat to reset accumulated velocity (not exactly according to the laws of physics)
                this.vel.y = options.acceleration.y;
            }
            let newPos = new Vector(
                this.pos.x + this.vel.x * options.time_delta_ms,
                this.pos.y + this.vel.y * options.time_delta_ms);

            if (newPos.y > ctx.canvas.height - this.height) {
                this.pos.x = newPos.x;
                this.pos.y = ctx.canvas.height - this.height;
                this.vel.y = 0;
                return;
            } else if (newPos.y < 0) {
                this.pos.x = newPos.x;
                this.pos.y = 0;
                this.vel.y = 0;
                return;
            }
            this.pos = {...newPos};
        }

        crashWith (obstacle) {

            // let upper_obst = {x: this.pos.x, y: this.pos.y, width: this.width, height: this.height};
            // let down_obst = {x: this.pos.x, y: this.height + this.gap, width: this.width, height: ctx.canvas.height - this.height - this.gap};

            return (this.pos.x + this.width >= obstacle.pos.x)
                && (this.pos.x <= obstacle.pos.x + obstacle.width)
                && (
                       (this.pos.y + this.height >= obstacle.pos.y)
                    && (this.pos.y <= obstacle.pos.y + obstacle.height)
                    || (this.pos.y + this.height >= obstacle.pos.y + obstacle.height + obstacle.gap)
                );
        }
    }

    const CLOUDS_CNT = 3;
    const MIN_CLOUD_WIDTH = 30;
    const MAX_CLOUD_WIDTH = 200;
    const MIN_CLOUD_HEIGHT = 30;
    const MAX_CLOUD_HEIGHT = 100;
    const OBST_CNT = 4;
    const OBST_DIST = 250;
    const MIN_OBST_GAP = 100;
    const MAX_OBST_GAP = 300;
    const MIN_OBST_HEIGHT = 50;
    const MAX_OBST_HEIGHT = 200;
    const OBST_WIDTH = 20;
    const UP_ACCELERATION = new Vector(0, -0.15);
    const DOWN_ACCELERATION = new Vector(0, 0);
    const FONT_COLOR = 'green';
    const FONT = '25px Arial'; // Comic Sans MS


    console.log('Hello from game 1');
    let game = new Game(canvas, 1);

    const RestartHandler = (function(event) {
        if (event.code === 'Space' && this.isOver) {
            this.restart();
            this.isOver = false;
        }
    }).bind(game)

    const PressSpaceToJumpHandler = (function(event) {
        if (event.code === 'Space' && !event.repeat) { // && !event.repeat
            this.birdAcceleration = {...UP_ACCELERATION};
        }
    }).bind(game)


    game.gameOver = function() {
        this.isOver = true;
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

    game.restart = function() {
        this.bird = new Bird(Bird.WIDTH, this.height/2 - Bird.HEIGHT, 0, 0);
        this.obstacles = [];
        this.clouds = [];
        
        for(let i = 0; i < OBST_CNT; i++) {
            this.obstacles[i] = new Obstacle(this.width + i * OBST_DIST, 0, OBST_WIDTH, 0, 0);
            this.obstacles[i].randomize();
        }

        for(let i = 0; i < CLOUDS_CNT; i++) {
            this.clouds[i] = new Cloud(i * MAX_CLOUD_WIDTH, 60, 0, 0);
            this.clouds[i].randomize();
        }
        
        this.birdAcceleration = new Vector();
        
        this.score = 0;
    }

    game.setup = function() {
        this.bird = new Bird(Bird.WIDTH, this.height/2 - Bird.HEIGHT, 0, 0);
        this.obstacles = [];
        this.clouds = [];
        this.passedObstacles = [];
        
        for(let i = 0; i < OBST_CNT; i++) {
            this.obstacles[i] = new Obstacle(this.width + i * OBST_DIST, 0, OBST_WIDTH, 0, 0);
            this.obstacles[i].randomize();
            this.passedObstacles[i] = false;
        }

        for(let i = 0; i < CLOUDS_CNT; i++) {
            this.clouds[i] = new Cloud(i * MAX_CLOUD_WIDTH, 60, 0, 0);
            this.clouds[i].randomize();
        }
        
        this.birdAcceleration = new Vector();
        

        document.addEventListener('keydown', PressSpaceToJumpHandler);
        document.addEventListener('keydown', RestartHandler);
        
        this.score = 0;
        // this.highScore = 0;
        this.last_time_ms = null;
    }

    game.update = function(time_ms) {
        const time_delta_ms = (this.last_time_ms === null)? 0 : time_ms - this.last_time_ms;
        this.last_time_ms = time_ms;

        if(this.stopped) {
            document.removeEventListener('keydown', PressSpaceToJumpHandler);
            document.removeEventListener('keydown', RestartHandler);
            return;
        }
        
        if(this.isOver) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'lightcyan';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.clouds.forEach(c => c.draw(this.ctx, {time_delta_ms}));

        this.bird.draw(this.ctx, { time_delta_ms, acceleration: this.birdAcceleration })
        this.birdAcceleration = {...DOWN_ACCELERATION};
        
        this.obstacles.forEach((obst, idx) => {
            obst.draw(this.ctx, {time_delta_ms});
            if(this.passedObstacles[idx] && obst.pos.x > this.bird.pos.x + this.bird.width) {
                this.passedObstacles[idx] = false;
            } else if(!this.passedObstacles[idx] && obst.pos.x + obst.width < this.bird.pos.x) {
                this.score += 1;
                this.passedObstacles[idx] = true;
            }
        });

        
        this.ctx.font = FONT;
        this.ctx.fillStyle = FONT_COLOR;
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        this.ctx.fillText(`HighScore: ${this.highScore}`, 10, 60);
        
        if (this.obstacles.some(obst => this.bird.crashWith(obst))) {
            this.gameOver();
        }
    }

    return game;
}

games[1] = game1;