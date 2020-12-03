const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rainbow_left = document.getElementById('rainbow-left');
const rainbow_bottom = document.getElementById('rainbow-bottom');
const rainbow_right = document.getElementById('rainbow-right');
const rainbow_top = document.getElementById('rainbow-top');
const heartOne = document.getElementById('heartOne');
const heartTwo = document.getElementById('heartTwo');
const heartThree = document.getElementById('heartThree');
const game_menu = document.getElementById('gameMenu');

canvas.width = innerWidth;
canvas.height = innerHeight;

canvas.style.backgroundColor = 'black';

let smiley_img = new Image();

const lives = [heartOne, heartTwo, heartThree];

const enemy_size = {
    1: 20,
    2: 30,
    3: 40
};

const enemy_color = {
    1: 'hsl(360, 50%, 50%)',
    2: 'hsl(270, 50%, 50%)',
    3: 'hsl(100, 50%, 50%)'
};

var rainbow_area = 100;
let playing = true;

class Smiley {
    constructor(x, y, imageUrl, image, lives, radius) {
        this.x = x;
        this.y = y;
        this.imageUrl = imageUrl;
        this.image = image;
        this.lives = lives;
        this.radius = radius;
    }

    draw() {
        console.log(this.image);
        this.image.onload = function() {
            animate();
        }
        this.image.src = this.imageUrl;
        this.image.style.position = 'absolute';
    }

    update(dx, dy) {
        this.x += dx;
        this.y += dy;
        ctx.drawImage(this.image, this.x, this.y, 50, 50);
    }
}

class Enemy {
    constructor(x, y, lives, radius, color) {
        this.x = x;
        this.y = y;
        this.lives = lives;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        const random_radius = Math.floor(Math.random() * 10) + 1
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(x, y) {
        this.draw();
        this.x += x;
        this.y += y;
    }
}

class Bullet {
    constructor(x, y, x0, y0, radius) {
        this.x = x;
        this.y = y;
        this.x0 = x0;
        this.y0 = y0;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    update(x, y) {
        this.draw();
        this.x += x;
        this.y += y;
    }

    isBulletOutOfRange() {
        if (this.x - this.x0 > (canvas.width / 2)) {
            return true;
        } else {
            return false;
        }
    }
}

const smiley = new Smiley(0, 0, 'assets/smiley.png', smiley_img, 3, 40);

const bullets = [];
const enemies = [];

let spawnEnemyId;
let animationFrameId;

function spawnEnemy() {
    spawnEnemyId = setInterval(() => {
        const radius = Math.floor(Math.random() * 3) + 1;
        const lives = radius;
        const color = enemy_color[lives];
        enemies.push(new Enemy(canvas.width, Math.floor(Math.random() * ((canvas.height - 20) + 1) + 20), lives, enemy_size[radius], color));
    }, 3000);
}

function animate() {
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animationFrameId = requestAnimationFrame(animate);
    smiley.update(0, 0);

    if (rainbow_area == 400) {
        if (bullets.length == 0 && enemies.length == 0) {
            console.log(`[GAME OVER] -- [SMILEY WON]`);
            stopGame();
        }
    }

    bullets.forEach((bullet, bulletIndex) => {
        bullet.update(2, 0);

        if (!playing) {
            bullet.update(0, 10);
            return;
        }

        //remove bullet when it leaves screen
        if (bullet.x > canvas.width) {
            bullets.splice(bulletIndex, 1);
            return;
        } else if (bullet.isBulletOutOfRange()) {
            bullets.splice(bulletIndex, 1);
        } else if (bullet.y > canvas.height) {
            bullets.splice(bulletIndex, 1);
        }

        //remove enemy when hit by bullet
        enemies.forEach((enemy, enemyIndex) => {
            if (isCollision(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.radius)) {
                if (enemy.lives > 1) {
                    console.log('[BULLET COLLISION]');
                    bullets.splice(bulletIndex, 1);
                    enemy.lives -= 1;
                    enemy.color = enemy_color[enemy.lives];
                    enemy.radius = enemy_size[enemy.lives];
                    console.log(`Enemey Count: ${enemies.length}`);
                    return;
                } else if (enemy.lives == 1) {
                    console.log('[BULLET COLLISION] -- ENEMY DESTROYED');
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                    console.log(`Enemey Count: ${enemies.length}`);
                    updateRainbowArea(50);
                    return;
                }
            }
        })
    });

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update(-2, 0);

        if (!playing) {
            enemy.update(0, 10);
            return;
        }


        //remove enemy when it leaves screen
        // reduce smiley lives
        if (enemy.x < 0) {
            if (smiley.lives == 1) {
                if (bullets.length == 0 && enemies.length == 0) {
                    console.log(`[GAME OVER] -- [SMILEY WON]`);
                    stopGame();
                }
            } else {
                console.log('[ENEMY LEFT SCREEN]');
                console.log(`enemy.x : ${enemy.x} enemy.y : ${enemy.y}`)
                updateRainbowArea(-50);
                enemies.splice(enemyIndex, 1);
                smiley.lives -= 1;
                lives[smiley.lives].style.display = 'none';
                return;
            }
        } else if (isCollision(enemy.x, enemy.y, enemy.radius, smiley.x + smiley.radius, smiley.y + smiley.radius, smiley.radius)) {
            if (smiley.lives == 1) {
                console.log(`[GAME OVER] -- [SMILEY COLLISION]`);
                stopGame();
            } else {
                console.log('[SMILEY COLLISION]');
                updateRainbowArea(-50);
                enemies.splice(enemyIndex, 1);
                smiley.lives -= 1;
                lives[smiley.lives].style.display = 'none';
                return;
            }
        }
    })
}

function isCollision(x1, y1, radi1, x2, y2, radi2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance_between_centers = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (distance_between_centers <= radi1 + radi2) {
        return true;
    }
    return false;
}

function updateRainbowArea(quantity_captured) {
    this.rainbow_area += quantity_captured;
    const quotient = Math.floor(this.rainbow_area / 100);
    let remainder = this.rainbow_area % 100;
    console.log(`quotient; ${quotient} rain_bow_area: ${rainbow_area}`);

    if (quotient == 0 || (quotient == 1 && remainder == 0)) {
        console.log(`left_rainbow length : ${(quotient * 100) + this.rainbow_area}%`)
        rainbow_left.style.height = `${(quotient * 100) + this.rainbow_area}%`;
        rainbow_left.style.display = 'block';
        rainbow_bottom.style.display = 'none';
        rainbow_right.style.display = 'none';
        rainbow_top.style.display = 'none';
    } else if (quotient == 1 || (quotient == 2 && remainder == 0)) {
        if (remainder == 0) remainder = 100;
        console.log(`bottom_rainbow length : ${remainder}%`)
        rainbow_bottom.style.width = `${remainder}%`;
        rainbow_bottom.style.display = 'block';
        rainbow_left.style.display = 'block';
        rainbow_right.style.display = 'none';
        rainbow_top.style.display = 'none';
    } else if (quotient == 2 || (quotient == 3 && remainder == 0)) {
        if (remainder == 0) remainder = 100;
        console.log(`right_rainbow length : ${remainder}%`)
        rainbow_right.style.height = `${remainder}%`;
        rainbow_right.style.display = 'block';
        rainbow_left.style.display = 'block';
        rainbow_bottom.style.display = 'block';
        rainbow_top.style.display = 'none';
    } else if (quotient == 3 || (quotient == 4 && remainder == 0)) {
        if (remainder == 0) remainder = 100;
        console.log(`top_rainbow length : ${remainder}%`)
        rainbow_top.style.width = `${remainder}%`;
        rainbow_top.style.display = 'block';
        rainbow_left.style.display = 'block';
        rainbow_bottom.style.display = 'block';
        rainbow_right.style.display = 'block';
    }
}

function stopGame() {
    playing = false;
    cancelAnimationFrame(animationFrameId);
}

window.addEventListener('keydown', (e) => {
    if (playing) {
        if (e.keyCode == '37') {
            moveBack();
        } else if (e.keyCode == '38') {
            moveUp();
        } else if (e.keyCode == '39') {
            moveFoward();
        } else if (e.keyCode == '40') {
            moveDown();
        } else if (e.keyCode == '27') {
            showgame_menu();
        } else if (e.keyCode == '32') {
            bullets.push(new Bullet(smiley.x + smiley.radius / 2, smiley.y + smiley.radius / 2, smiley.x, smiley.y, 5));
            //bullets.push(new Bullet(smiley.x, smiley.y, smiley.x, smiley.y, 5));
        }
    }
})

smiley.draw();
//animate();
spawnEnemy();

// let count_down_audio = new Audio('assets/count-down.mp3');
// let theme_audio = new Audio('assets/theme-track.mp3');

function start_game() {
    lives.forEach((life) => {
        life.style.display = 'block';
    })
    hidegame_menu();
    if (moveCarToStartingPosition(10)) {
        startCountDown();
    }
}

function showgame_menu() {
    game_menu.style.display = 'block';
    //theme_audio.pause();
    stopGame();
    //moveCarToEndPosition();
}

function hidegame_menu() {
    game_menu.style.display = 'none';
}

function moveFoward() {
    if (smiley.x < canvas.width - 200) {
        smiley.update(10, 0);
    }
}

function moveBack() {
    if (smiley.x > 0) {
        smiley.update(-10, 0);
    }
}

function moveUp() {
    if (smiley.y > 0) {
        smiley.update(0, -10);
    }
}

function moveDown() {
    if (smiley.y < canvas.height - 110) {
        smiley.update(0, 10);
    }
}