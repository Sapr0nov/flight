import SpriteSheet from './spriteSheet.js'
export default class Game {
    constructor(field, ship, canvas, timeLevel,enemiesGenerationSpeed,fireSpeed,controlType) {

        this.field = field;
        this.ship = ship;
        this.canvas = canvas;

        this.timeLevel = timeLevel;
        this.enemiesGenerationSpeed = enemiesGenerationSpeed; // 1 per X ms
        this.fireSpeed = fireSpeed; //ms
        this.control = controlType, //'mouse' 'wasd'  
        this.magnitoPoint = {};
        this.player = {
            x : 47,
            y : 80,
            dx : 0,
            dy : 0,
            speed : 0.1, // 1 reload per X ms 
            weapon : 1,
        },
        this.autofire = true;
        this.paused = false;
        this.shoots = [],
        this.enemies = [];
    }

    #speed = 0.09; // Xvh
    #accelerate = 0.1;  // shift  Xvh
    #accelerateTime = 25000; // add game.accelerate each X ms
    #skyFPS = 15; // 1 reload per X ms 
    #enemyDy = 0.5;
    #timerBG;
    #timerWave;
    #timerMove;
    #timerAction;
    #timerLevel;
    #animateID = 0;
    #slowMotion = 1;
    #score = 0;
    #skyPosY = 0;
    #mode = 'normal';
    #bang = new SpriteSheet('./img/bang.png',128,128,48,2);

    
    
    offHyperMode = () => {
        this.field.classList.remove('darken'); this.mode = 'normal';
    }
    
    changeMode = (modeName) => {
        if (this.#mode == 'hyper') {
            return;
        }
        this.field.classList.remove('colorBurn');
        this.field.classList.remove('hardLight');
        this.field.classList.remove('darken');
        switch (modeName) {
            case 'wave' : this.field.classList.add('hardLight'); this.#mode = 'wave'; break;
            case 'boss' : this.field.classList.add('colorBurn'); this.#mode = 'boss'; break;
            case 'hyper' : this.field.classList.add('darken'); this.#mode = 'hyper'; break;
        }
    };
    
    backgroundShift = () => {
        this.#skyPosY += this.#speed;
        if (this.#skyPosY >= 100) { this.#skyPosY = 0; }
        this.field.style.backgroundPositionY = this.#skyPosY + 'vh'; 
        // if animate Bang active shifting with background
        if (this.canvas.used) {
            this.canvas.style.top = (Number(this.canvas.style.top.slice(0,-2)) + this.speed) +"vh";
        }
    };
    
    drawShip = () => {
        this.ship.style.left = this.player.x+'vw';
        this.ship.style.top = this.player.y+'vh';
        this.shoots.forEach(shoot => {
            shoot.style.left = shoot.x+'vw';
            shoot.style.top = shoot.y+'vh';
        })
        this.enemies.forEach(enemy => {
            enemy.style.left = enemy.x+'vw';
            enemy.style.top = enemy.y+'vh';
        })
    }

    shipMove = () => {
        if ( this.enemies.some(enemy => (
            ( enemy.x + 5 > this.player.x) && ( enemy.x + 5 < this.player.x + 6 ) && ( enemy.y + 6 > this.player.y ) && ( enemy.y + 6 < this.player.y + 6 ) ||
            ( enemy.x + 5 > this.player.x) && ( enemy.x + 5 < this.player.x + 6 ) && ( enemy.y > this.player.y ) && ( enemy.y < this.player.y + 6 ) ||
            ( enemy.x > this.player.x) && ( enemy.x < this.player.x + 6 ) && ( enemy.y + 6 > this.player.y ) && ( enemy.y + 6 < this.player.y + 6 ) ||
            ( enemy.x > this.player.x) && ( enemy.x < this.player.x + 6 ) && ( enemy.y > this.player.y ) && ( enemy.y < this.player.y + 6 )
            )))
        {
            console.log('game over');
            this.ship.style.opacity = 0.1;
        }
        if (this.control == 'wasd') {
            ( (this.player.x + this.player.dx * this.player.speed) <= 0 ) || ( (this.player.x + this.player.dx * this.player.speed) > 97 ) 
            ? this.player.dx = 0 
            : this.player.x += this.player.dx * this.player.speed;

        ( (this.player.y + this.player.dy * this.player.speed) <= 0 ) || ( (this.player.y + this.player.dy * this.player.speed) > 92 ) 
            ? this.player.dy = 0 
            : this.player.y += this.player.dy * this.player.speed;
        }

        if (this.control == 'mouse') {
            if (( (this.player.x + this.player.dx * this.player.speed) <= 0 ) || ( (this.player.x + this.player.dx * this.player.speed) > 97 )) {
                this.player.dx = 0;
            }else{
                if  (Math.abs(this.magnitoPoint.x - this.player.x - this.player.dx * this.player.speed) < Math.abs(this.magnitoPoint.x - this.player.x) ) {
                    this.player.x += this.player.dx * this.player.speed;
                }else{
                    this.player.dx = 0;
                }
            }

            if (( (this.player.y + this.player.dy * this.player.speed) <= 0 ) || ( (this.player.y + this.player.dy * this.player.speed) > 92 )) {
                this.player.dy = 0 
            }else{
                if  (Math.abs(this.magnitoPoint.y - this.player.y - this.player.dy * this.player.speed) < Math.abs(this.magnitoPoint.y - this.player.y) ) {
                    this.player.y += this.player.dy * this.player.speed;
                }else{
                    this.player.dy = 0;
                }
            }
        }
        
        /* Player's shoots */ 
        this.shoots.forEach((shoot,i) => {

            if ( ((shoot.x + shoot.dx * shoot.speed) <= -2 ) || ( (shoot.x + shoot.dx * shoot.speed) > 101 ))
            {
                this.field.removeChild(shoot);
                this.shoots.splice(i, 1);
                return;
            }
            shoot.x += shoot.dx * shoot.speed;
            if(((shoot.y + shoot.dy * shoot.speed) <= -2 ) || ( (shoot.y + shoot.dy * shoot.speed) > 101 ) )
            {
                this.field.removeChild(shoot);
                this.shoots.splice(i, 1);
                return;
            }
            shoot.y += shoot.dy * shoot.speed;
        });
    }

    enemiesMove = () => {
        
        this.enemies.forEach((enemy,i) => {
            this.shoots.forEach( (shoot,index) => {
                if ( ( shoot.x > enemy.x) && ( shoot.x < enemy.x + 5 ) && ( shoot.y > enemy.y ) && ( shoot.y < enemy.y + 6 ) )
                {
                    this.canvas.style.left = (enemy.x - 3) +"vw";
                    this.canvas.style.top = enemy.y+"vh";
                    this.#score += 100 * enemy.type;
                    this.field.removeChild(enemy);
                    this.enemies.splice(i, 1);
                    this.field.removeChild(shoot);
                    this.shoots.splice(index, 1);
                    this.#animateID++; 
                    this.canvas.opacity = 1;
                    this.animate();  
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
                this.field.removeChild(enemy);
                this.enemies.splice(i, 1);
            }
            if (enemy.type == 1) {
                this.rotateAsteroid(enemy);
            }
            enemy.y += enemy.dy * enemy.speed;
            
        });
    
    
    }
    
    shipFire = () => {
        const shoot = document.createElement('div');
        this.field.appendChild(shoot);
        shoot.x = this.player.x + 2.2;
        shoot.y = this.player.y - 0.7;
        shoot.dx = 0;
        shoot.dy = -1;
        shoot.speed = 0.5; 
        shoot.type = this.player.weapon;
        
        if (this.player.weapon == 2) {
            const shoot2 = shoot.cloneNode(true);
            const shoot3 = shoot.cloneNode(true);
    
            this.field.appendChild(shoot2);
            this.field.appendChild(shoot3);
            shoot2.x = this.player.x + 2.2;
            shoot2.y = this.player.y - 0.7;
            shoot2.dx = -0.3;
            shoot2.dy = -1;
            shoot2.speed = 0.5; 
            shoot2.type = this.player.weapon;
            shoot3.x = this.player.x + 2.2;
            shoot3.y = this.player.y - 0.7;
            shoot3.dx = 0.3;
            shoot3.dy = -1;
            shoot3.speed = 0.5; 
            shoot3.type = this.player.weapon;
            shoot2.classList.add('shoot');
            shoot2.classList.add(`shoot${this.player.weapon}`);
            shoot3.classList.add('shoot');
            shoot3.classList.add(`shoot${this.player.weapon}`);
            this.shoots.push(shoot2);
            this.shoots.push(shoot3);
        }
    
        shoot.classList.add('shoot');
        shoot.classList.add(`shoot${this.player.weapon}`);
    
        this.shoots.push(shoot);
    } 
    
    addEnemy = (newEnemy) =>  {
    
        if (this.enemies.length > 40) return;
        const enemy = document.createElement('div');
        this.field.appendChild(enemy);
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
        this.enemies.push(enemy);
    } 
    /* Timers */
    startTimerLevel = () => {
        
        this.#timerLevel = setInterval( ()=> {
            this.stopGame();
            alert('YOU WIN, score:'+ this.#score);
        }, this.timeLevel);
    } 
    
    startTimerBG = () => {
        return setInterval(() => {
            this.backgroundShift(this.field);
            this.drawShip(this.ship);
        }, this.#skyFPS);
    }

    startTimerAction = () => {

        return setInterval(() => {
            
            (this.#speed > 0.7) ? 
            this.#speed = 0.1 :
            this.#speed += this.#accelerate;
            this.#enemyDy += 0.5;
        
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
                this.addEnemy(newEnemy);
            }
        
        }, this.#accelerateTime); 
    }

    startTimerMove = () => {
        return setInterval(() => {
            this.shipMove();
            this.enemiesMove();
        }, this.player.speed * this.#slowMotion); 
    }

    startTimerWave = () => {
        return setInterval(() => {
            let randomEnemy = {
                'x' : 1 + Math.floor(Math.random() * 99),
                'y' : -10,
                'dx' : -2 + Math.random() * 4,
                'dy' : this.#enemyDy + Math.random() * (2.0 - this.#enemyDy),
                'speed' : 0.03 + Math.random() * 0.03,
                'type' : 1
            }
            this.addEnemy(randomEnemy);
            this.changeMode('wave');
        }, this.enemiesGenerationSpeed) ;
    }

    startGame = () => {
        this.startTimerLevel();
        this.#timerBG = this.startTimerBG();
        this.#timerAction = this.startTimerAction();
        this.#timerMove = this.startTimerMove();
        this.#timerWave = this.startTimerWave();  
        this.paused = false;  
    }

    stopGame = () => {
        clearInterval(this.#timerLevel);
        clearInterval(this.#timerBG);
        clearInterval(this.#timerAction);
        clearInterval(this.#timerMove);
        clearInterval(this.#timerWave);
    }

    rotateAsteroid = (enemy) => {
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

    animate = () => {
        let bangID = requestAnimationFrame(this.animate);
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, 128, 128);
        if (bangID < 48 * this.#animateID) {
            this.canvas.style.opacity = "1";
            this.canvas.used = true;
            this.#bang.update();
        }else{
            this.canvas.style.opacity = "0";
            this.canvas.used = false;
            cancelAnimationFrame(bangID);
        }
        this.#bang.draw(0, 0, ctx);
     }
}
