const game = {};
    game.enemiesGenerationSpeed = 2000; // 1 per X ms
    game.skyPosY = 0;
    game.speed = 0.09; // Xvh
    game.accelerate = 0.1;  // shift  Xvh
    game.accelerateTime = 25000; // add game.accelerate each X ms
    game.skyFPS = 15; // 1 reload per X ms 
    game.autofire = true;
    game.enemyDy = 0.5;

const player = {};
    player.x = 47;
    player.y = 80;
    player.dx = 0;
    player.dy = 0;
    player.speed = 0.1; // 1 reload per X ms 
    player.weapon = 1;
    player.fireSpeed = 300; //ms
    shoots = [];
    enemies = [];

    let animateID = 0;

const backgroundShift = (field) => {
    game.skyPosY += game.speed;
    if (game.skyPosY >= 100) { game.skyPosY = 0; }
    field.style.backgroundPositionY = game.skyPosY + 'vh'; 
    // если взрыв активен, сносим его вместе с фоном
    if (canvas.used) {
        canvas.style.top = (Number(canvas.style.top.slice(0,-2)) + game.speed) +"vh";
    }
};

const drawShip = (ship) => {
    ship.style.left = player.x+'vw';
    ship.style.top = player.y+'vh';
    shoots.forEach(shoot => {
        shoot.style.left = shoot.x+'vw';
        shoot.style.top = shoot.y+'vh';
    })
    enemies.forEach(enemy => {
        enemy.style.left = enemy.x+'vw';
        enemy.style.top = enemy.y+'vh';
    })
}

const shipMove = (field) => {

    if ( enemies.some(enemy => (
        ( enemy.x + 5 > player.x) && ( enemy.x + 5 < player.x + 6 ) && ( enemy.y + 6 > player.y ) && ( enemy.y + 6 < player.y + 6 ) ||
        ( enemy.x + 5 > player.x) && ( enemy.x + 5 < player.x + 6 ) && ( enemy.y > player.y ) && ( enemy.y < player.y + 6 ) ||
        ( enemy.x > player.x) && ( enemy.x < player.x + 6 ) && ( enemy.y + 6 > player.y ) && ( enemy.y + 6 < player.y + 6 ) ||
        ( enemy.x > player.x) && ( enemy.x < player.x + 6 ) && ( enemy.y > player.y ) && ( enemy.y < player.y + 6 )
        )))
    {
        console.log('game over');
        const ship = document.querySelector('.player');
        ship.style.opacity = 0.1;
    }

    ( (player.x + player.dx * player.speed) <= 0 ) || ( (player.x + player.dx * player.speed) > 90 ) 
        ? player.dx = 0 
        : player.x += player.dx * player.speed;

    ( (player.y + player.dy * player.speed) <= 0 ) || ( (player.y + player.dy * player.speed) > 90 ) 
        ? player.dy = 0 
        : player.y += player.dy * player.speed;
    player.y += player.dy * player.speed;

    /* Player's shoots */ 
    shoots.forEach((shoot,i) => {

        if ( ((shoot.x + shoot.dx * shoot.speed) <= 0 ) || ( (shoot.x + shoot.dx * shoot.speed) > 95 ))
        {
            field.removeChild(shoot);
            shoots.splice(i, 1);
            return;
        }
        shoot.x += shoot.dx * shoot.speed;
        if(((shoot.y + shoot.dy * shoot.speed) <= 0 ) || ( (shoot.y + shoot.dy * shoot.speed) > 95 ) )
        {
            field.removeChild(shoot);
            shoots.splice(i, 1);
            return;
        }
        shoot.y += shoot.dy * shoot.speed;
    });
}

const enemiesMove = (field,animate) => {
    const bang = new SpriteSheet('./img/bang.png',128,128,48,2);
    enemies.forEach((enemy,i) => {
        shoots.forEach( (shoot,index) => {
            if ( ( shoot.x > enemy.x) && ( shoot.x < enemy.x + 5 ) && ( shoot.y > enemy.y ) && ( shoot.y < enemy.y + 6 ) )
            {
                canvas.style.left = (enemy.x - 3) +"vw";
                canvas.style.top = enemy.y+"vh";
                field.removeChild(enemy);
                enemies.splice(i, 1);
                field.removeChild(shoot);
                shoots.splice(index, 1);
                animateID++; 
                canvas.opacity = 1;
                animate();  
            }
        })
          
        if ( ((enemy.x + enemy.dx * enemy.speed) <= 0 ) || ( (enemy.x + enemy.dx * enemy.speed) > 95 ))
        {
            enemy.dx = -enemy.dx;
        }
        enemy.x += enemy.dx * enemy.speed;
        
        if( (enemy.y + enemy.dy * enemy.speed) < -10 ) 
        {
            enemy.dy = Math.abs(enemy.dy);
            
        }
        if  ( (enemy.y + enemy.dy * enemy.speed) > 110 ) 
        {
            field.removeChild(enemy);
            enemies.splice(i, 1);
        }
        if (enemy.type == 1) {
            rotateAsteroid(enemy);
        }
        enemy.y += enemy.dy * enemy.speed;
        
    });


}

const shipFire = (field) => {
    const shoot = document.createElement('div');
    field.appendChild(shoot);
    shoot.x = player.x + 2.2;
    shoot.y = player.y - 0.7;
    shoot.dx = 0;
    shoot.dy = -1;
    shoot.speed = 0.5; 
    shoot.type = player.weapon;
    
    if (player.weapon == 2) {
        shoot2 = shoot.cloneNode(true);
        shoot3 = shoot.cloneNode(true);

        field.appendChild(shoot2);
        field.appendChild(shoot3);
        shoot2.x = player.x + 2.2;
        shoot2.y = player.y - 0.7;
        shoot2.dx = -0.3;
        shoot2.dy = -1;
        shoot2.speed = 0.5; 
        shoot2.type = player.weapon;
        shoot3.x = player.x + 2.2;
        shoot3.y = player.y - 0.7;
        shoot3.dx = 0.3;
        shoot3.dy = -1;
        shoot3.speed = 0.5; 
        shoot3.type = player.weapon;
        shoot2.classList.add('shoot');
        shoot2.classList.add(`shoot${player.weapon}`);
        shoot3.classList.add('shoot');
        shoot3.classList.add(`shoot${player.weapon}`);
        shoots.push(shoot2);
        shoots.push(shoot3);
    }

    shoot.classList.add('shoot');
    shoot.classList.add(`shoot${player.weapon}`);

    shoots.push(shoot);
} 


const addEnemy = (field,newEnemy) => {
    if (enemies.length > 40) return;
    const enemy = document.createElement('div');
    field.appendChild(enemy);
    // TODO оптимизировать присовение
    enemy.x = newEnemy.x;
    enemy.y = newEnemy.y;
    enemy.dx = newEnemy.dx;
    enemy.dy = newEnemy.dy;
    enemy.speed = newEnemy.speed; 
    enemy.type = newEnemy.type;
    if (enemy.type == 1) {
        enemy.style.backgroundPositionX = 0;
        enemy.style.backgroundPositionY = 0;

        enemy.style.transform = "rotate("+ Math.floor(Math.random() * 90) +"deg)";
        enemy.timerRotate = 0;
        enemy.rotateDirection = (enemy.x > 0);
        enemy.timerRotateMax = 30 * (3 - enemy.dy);    
        if (enemy.timerRotateMax < 3) { enemy.timerRotateMax = 3 }
    }
 
    enemy.classList.add('enemy');
    enemy.classList.add(`enemy${enemy.type}`); 
    enemies.push(enemy);
} 


document.addEventListener("DOMContentLoaded", function(event) {

    const field = document.querySelector('.field');
    const ship = document.querySelector('.player');

    field.style.backgroundPositionX = '0vw';
    field.style.backgroundPositionY = game.skyPosY + 'vh';

    /* Background Animation */
    setInterval(() => {
        backgroundShift(field);
        drawShip(ship);
    }, game.skyFPS);

    setInterval(() => {
        (game.speed > 0.7) ? 
        agame.speed = 0.1 :
        game.speed += game.accelerate;
        game.enemyDy += 0.5;

        let newEnemy = {
            'x' : 10,
            'y' : -20,
            'dx' : 0.5,
            'dy' : 0.2,
            'speed' : 0.07,
            'type' : 2
        };
        for (let i=0; i<30; i++) {
            if (i==10) {
                newEnemy.x -= 60; 
                newEnemy.y -= 30;
            }
            if (i==20) {
                newEnemy.x -= 60; 
                newEnemy.y -= 30;
            }
            newEnemy.x += 6;
            newEnemy.y += 1;
            addEnemy(field, newEnemy);
        }

    }, game.accelerateTime); 

    /* ship moved */
    setInterval(() => {
        shipMove(field);
        enemiesMove(field, animate);
    }, player.speed);

    /* generate enemies */ 
    setInterval(() => {
        let randomEnemy = {
            'x' : 1 + Math.floor(Math.random() * 99),
            'y' : -10,
            'dx' : -2 + Math.random() * 4,
            'dy' : game.enemyDy + Math.random() * (2.0 - game.enemyDy),
            'speed' : 0.03 + Math.random() * 0.03,
            'type' : 1
        }
        addEnemy(field,randomEnemy);
    }, game.enemiesGenerationSpeed);

    /* autofire */
    setInterval(() => {
        if (game.autoFire) {
            shipFire(field);
        }
    }, player.fireSpeed);


    /* Controls */
    document.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
            case 87 : player.dy = -1; break;
            case 65 : player.dx = -1; ship.classList.add('right'); break;
            case 83 : player.dy = 1; break;
            case 68 : player.dx = 1; ship.classList.add('left'); break;
            case 71 : game.autoFire = !game.autoFire; break;
            case 49 : player.weapon = 1; break;
            case 50 : player.weapon = 2; break;
            case 51 :  player.fireSpeed = 100; break;
        }
       
    });
    document.addEventListener('keyup', (event) => {
        switch (event.keyCode) {
            case 87 : player.dy = 0; break;
            case 65 : player.dx = 0; ship.classList.remove('right'); break;
            case 83 : player.dy = 0; break;
            case 68 : player.dx = 0; ship.classList.remove('left'); break;
            case 70 :  shipFire(field);  break;
        }
    });


    const canvas = document.getElementById("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.opacity = "0";
    canvas.used = false;
    const ctx = canvas.getContext("2d");
    const bang = new SpriteSheet('./img/bang.png',128,128,48,2);
    
    function animate() {
        let bangID = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, 128, 128);
        if (bangID < 48 * animateID) {
            canvas.style.opacity = "1";
            canvas.used = true;
            bang.update();
        }else{
            canvas.style.opacity = "0";
            canvas.used = false;
            cancelAnimationFrame(bangID);
        }
        bang.draw(0, 0, ctx);
     }
  
    
    /* Animation */
});

function SpriteSheet(path, frameWidth, frameHeight, endFrame, frameSpeed) {
    var image = new Image();
    var framesPerRow;
    // вычисление количества кадров в строке после загрузки изображения
    var self = this;
    image.onload = function() {
       framesPerRow = Math.floor(image.width / frameWidth);
    };
    image.src = path;
    var currentFrame = 0;  // текущий кадр для отрисовки
    var counter = 0;       // счетчик ожидания
    // обновление анимации
    this.update = function() {
      // если подошло время смены кадра, то меняем
      if (currentFrame == endFrame-1) 
      {
          currentFrame = endFrame;
          return;
      }

      if (counter == (frameSpeed - 1))
        currentFrame = (currentFrame + 1) % endFrame;
      // обновление счетчика ожидания
      counter = (counter + 1) % frameSpeed;
      return counter;
      }
      this.draw = function(x, y, ctx) {
        // вычисление столбика и строчки с нужным кадром
        var row = Math.floor(currentFrame / framesPerRow);
        var col = Math.floor(currentFrame % framesPerRow);
   
        ctx.drawImage(
           image,
           col * frameWidth, row * frameHeight,
           frameWidth, frameHeight,
           x, y,
           frameWidth, frameHeight);
    };
}

const rotateAsteroid = (enemy) => {
    if (enemy.timerRotate > 0) {
        enemy.timerRotate--;
        return;
    }

    enemy.timerRotate = enemy.timerRotateMax;
    let bgX = Number(enemy.style.backgroundPositionX.slice(0,-2)) - 7;
    let bgY = Number(enemy.style.backgroundPositionY.slice(0,-2));
    
    if (bgX <= -56) {
        bgX = 0;
        bgY -= 7;
    }

    if (bgY <= -32) {
        bgX = 0; 
        bgY = 0;
    }
    enemy.rotateDirection 
        ? enemy.style.backgroundPosition = bgX + 'vw ' + bgY +'vw'
        : enemy.style.backgroundPosition = bgX + 'vw ' + Number(bgY + 28) +'vw';
}