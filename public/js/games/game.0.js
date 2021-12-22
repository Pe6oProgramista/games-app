function game0(canvas) {
    console.log('Hello from game 0');
    let game = new Game(canvas);
    
    game.setup = function() {
        this.square = {
            "x": 25,
            "y": 25,
            "dirX": -1,
            "dirY": 1,
            "speed": 2,
            "sizeX": 50,
            "sizeY": 50,
            "color": "red"
        }
    }
    
    game.update = function(time_ms) {
        if (this.square.x + this.square.sizeX + this.square.speed * this.square.dirX > gameCanvas.width)    this.square.dirX = -1;
        if (this.square.x + this.square.speed * this.square.dirX < 0)
            this.square.dirX = 1;
        if (this.square.y + this.square.sizeY + this.square.speed * this.square.dirY > gameCanvas.height)   this.square.dirY = -1;
        if (this.square.y + this.square.speed * this.square.dirY < 0)
            this.square.dirY = 1;
    
        this.changeColor();
        this.square.x += this.square.speed * this.square.dirX;
        this.square.y += this.square.speed * this.square.dirY;
    
        this.render();
    }
    
    game.render = function() {
        this.ctx.fillStyle = this.square.color;
        this.ctx.fillRect(this.square.x, this.square.y, this.square.sizeX, this.square.sizeY);
    }
    
    game.changeColor = function() {
        let colors = ['green', 'blue', 'red', 'yellow'];
        this.square.color = colors[Math.floor(Math.random() * colors.length)];
    }

    return game;
}

games[0] = game0;