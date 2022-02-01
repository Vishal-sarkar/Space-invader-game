const RIGHT_KEY = 39;
const LEFT_KEY = 37;
const SPACE_KEY = 32;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// SATE OF THE GAME
const STATE = {
    pos_x : 0,
    pos_y : 0,
    left_move : false,
    right_move : false,
    shoot : false,
    lasers : [],
    enemies : [],
    enemyLasers : [],
    spaceship_width : 50,
    enemy_width : 50,
    cooldown : 0,
    number_of_enemy : 16,
    enemy_cooldown : 0,
    gameOver : false,
}

// General Functions
function setPosition($element, x, y){
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width){
    $element.style.width = `${width}px`;
    $element.style.height = "auto";
}

function bound(x){
    if(x >= GAME_WIDTH - STATE.spaceship_width){
        STATE.pos_x = GAME_WIDTH - STATE.spaceship_width;
        return STATE.pos_x;
    }if(x <= 0){
        STATE.pos_x = 0;
        return STATE.pos_x;
    }else{
        return x;
    }
}

function laserDelete(lasers, laser, $laser){
    const index = lasers.indexOf(laser);
    lasers.splice(index, 1);
    $container.removeChild($laser);
}

function rectCollide(rect1, rect2){
    return!(rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top)
}

// Player
function createPlayer($container){
    STATE.pos_x = GAME_WIDTH/2;
    STATE.pos_y = GAME_HEIGHT - 50;
    const $player = document.createElement("img");
    $player.src = "img/spaceship.png";
    $player.className = "player";
    $container.appendChild($player);
    setPosition($player, STATE.pos_x, STATE.pos_y);
    setSize($player, STATE.spaceship_width);
}

function playerUpdate(){
    if(STATE.right_move){
        STATE.pos_x += 3;
    }if(STATE.left_move){
        STATE.pos_x -= 3;
    }if(STATE.shoot && STATE.cooldown == 0){
        createLaser($container, STATE.pos_x - STATE.spaceship_width/2, STATE.pos_y);
        STATE.cooldown = 30;
    }
    const $player = document.querySelector(".player");
    setPosition($player, bound(STATE.pos_x), STATE .pos_y - 15);
    if(STATE.cooldown > 0){
        STATE.cooldown -= 0.5;
    }
    
}

// Player Laser
function createLaser($container, x, y){
    const $laser = document.createElement("img");
    $laser.src = "img/laser.png";
    $laser.className = "laser";
    $container.appendChild($laser);
    const laser = {x, y, $laser};
    STATE.lasers.push(laser);
    setPosition($laser, x, y);
}

function laserUpdate(){
    const lasers = STATE.lasers;
    for(let i = 0; i<lasers.length; i++){
        const laser = lasers[i];
        laser.y -=2;
        if(laser.y < 0){
            laserDelete(lasers, laser, laser.$laser);
        }
        setPosition(laser.$laser, laser.x, laser.y);
        const laser_rectangle = laser.$laser.getBoundingClientRect();
        const enemies = STATE.enemies;;
        for(let j = 0; j < enemies.length; j++){
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            if(rectCollide(enemy_rectangle, laser_rectangle)){
                laserDelete(lasers, laser, laser.$laser);
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                $container.removeChild(enemy.$enemy)
            }
        }
    }
}

// enemies
function createEnemy($container, x, y){
    const $enemy = document.createElement("img");
    $enemy.src = "img/ufo.png";
    $enemy.className = "enemy";
    $container.appendChild($enemy);
    const enemy_cooldown = Math.floor(Math.random()*100);
    const enemy = {x, y, $enemy, enemy_cooldown};
    STATE.enemies.push(enemy);
    setPosition($enemy, x, y);
    setSize($enemy, STATE.enemy_width);
}

function enemiesUpdate($container){
    const dx = Math.sin(Date.now()/1000)*40;
    const dy = Math.cos(Date.now()/1000)*30;
    const enemies = STATE.enemies;
    for(let i=0; i < enemies.length; i++){
        const enemy = enemies[i];
        var a = enemy.x + dx;
        var b = enemy.y + dy;
        setPosition(enemy.$enemy, a, b);
        if(enemy.enemy_cooldown == 0){
            createEnemyLaser($container, a, b);
            enemy.enemy_cooldown = Math.floor(Math.random()*50)+100;
        }
        enemy.enemy_cooldown -= 0.5;
        
    }
}

function createEnemies($container){
    for(let i = 0; i <= STATE.number_of_enemy/2; i++){
        createEnemy($container, i*80, 100);
    }
    for(let i = 0; i <= STATE.number_of_enemy/2; i++){
        createEnemy($container, i*80, 180);
    }
}

function createEnemyLaser($container, x, y){
    const $enemyLaser = document.createElement("img");
    $enemyLaser.src = "img/enemyLaser.png";
    $enemyLaser.className = "enemyLaser";
    $container.appendChild($enemyLaser);
    const enemyLaser = {x, y, $enemyLaser};
    STATE.enemyLasers.push(enemyLaser);
    setPosition($enemyLaser, x, y);
}

function updateEnemyLaser(){
    const enemyLasers = STATE.enemyLasers;
    for(let i = 0; i< enemyLasers.length; i++){
        const enemyLaser = enemyLasers[i];
        enemyLaser.y += 2;
        if( enemyLaser.y > GAME_HEIGHT - 30){
            laserDelete(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
        }
        const enemyLaser_ractangle = enemyLaser.$enemyLaser.getBoundingClientRect();
        const spaceship_ractangle = document.querySelector(".player").getBoundingClientRect();
        if(rectCollide(spaceship_ractangle, enemyLaser_ractangle)){
            STATE.gameOver = true;
        }
        setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width/2, enemyLaser.y + 15);
        
    }
}


// Key Press
function keyPress(event){
    if(event.keyCode === RIGHT_KEY){
        STATE.right_move = true;
    }else if(event.keyCode === LEFT_KEY){
        STATE.left_move = true;
    }else if(event.keyCode === SPACE_KEY){
        STATE.shoot = true;
    }
}

function keyRelease(event){
    if(event.keyCode === RIGHT_KEY){
        STATE.right_move = false;
    }else if(event.keyCode === LEFT_KEY){
        STATE.left_move = false;
    }else if(event.keyCode === SPACE_KEY){
        STATE.shoot = false;
    }
}
// Main Update Function
function update(){
    playerUpdate();
    laserUpdate($container);
    enemiesUpdate($container);
    updateEnemyLaser()
    
    window.requestAnimationFrame(update);

    if(STATE.gameOver){
        document.querySelector(".lose").style.display = "block";
        $container.removeChild($laser);
    }if(STATE.enemies.length == 0){
        document.querySelector(".win").style.display = "block";
    }
}


// Init. Game
const $container = document.querySelector(".main");

// Event Listener
window.addEventListener("keydown", keyPress );
window.addEventListener("keyup", keyRelease);

const start = document.querySelector(".start");
const startBtn = document.querySelector(".startBtn");
startBtn.addEventListener("click", startGame);
function startGame(){
    
    createPlayer($container);
    createEnemies($container)
    start.style.display = "none";
    update();
};