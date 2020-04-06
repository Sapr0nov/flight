import SpriteSheet from "./spriteSheet.js"
export default class Game {
    constructor({field, ship, score, msgBox, canvas, timeLevel, enemiesGenerationSpeed, fireSpeed, controlType}) {

        this.field = field;
        this.ship = ship;
        this.score = score;
        this.msgBox = msgBox;
        this.canvas = canvas;
        this.timeLevel = timeLevel;
        this.enemiesGenerationSpeed = enemiesGenerationSpeed; // 1 per X ms
        this.fireSpeed = fireSpeed; //ms
        this.control = controlType, //"mouse" "wasd"  
 
        this.player = {
            x : 47,
            y : 80,
            dx : 0,
            dy : 0,
            speed : 0.9, // 1 reload per X ms 
            weapon : 1,
            bonus1 : 0,
            bonus2 : 0,
            bonus3 : 0,
        },
        this.emptyRide = false; // final line without enemies
       // Arrays on the field
        this.shoots = [];
        this.bonuses = [];
        this.enemies = [];
        this.enemyShoots = [];
    }

    #paused = false;
    #slowMotion = 1;
    #magnitoPoint = {};
    #autoFire = true;
    set paused(value) {
        this.#paused = Boolean(value);
    }
    get paused() {
        return this.#paused;   
    }
    set slowMotion(value) {
        this.#slowMotion = Math.floor(value);
    }
    get slowMotion() {
        return this.#slowMotion;   
    }
    set magnitoPoint(obj) {
        this.#magnitoPoint = obj;
    }
    get magnitoPoint() {
        return this.#magnitoPoint;   
    }
    set autoFire(value) {
        this.#autoFire = Boolean(value);
    }
    get autoFire() {
        return this.#autoFire;
    }
    
    #timer = 0;
    #timeLine = 0;
    #tik = 20;  // ms  (1 update per Xms)
    #speed = 0.1; // Xvh (move background)
    #accelerate = 0.1;  // shift  Xvh
    #enemyDy = 1; // base speed Enemies Ship

    #animateID = 0;
    #score = 0;
    #skyPosY = 0;
    #mode = "normal";
    #bang = new SpriteSheet("./img/bang.png",128,128,48,2);

    
    drawAll = () => {
        this.ship.style.left = this.player.x+"vw";
        this.ship.style.top = this.player.y+"vh";
        this.shoots.forEach(shoot => {
            shoot.style.left = shoot.x+"vw";
            shoot.style.top = shoot.y+"vh";
        })
        this.enemies.forEach(enemy => {
            enemy.style.left = enemy.x+"vw";
            enemy.style.top = enemy.y+"vh";
        })
        this.enemyShoots.forEach(enemyShoot => {
            enemyShoot.style.left = enemyShoot.x+"vw";
            enemyShoot.style.top = enemyShoot.y+"vh";
        })
        this.bonuses.forEach(bonus => {
            bonus.style.left = bonus.x+"vw";
            bonus.style.top = bonus.y+"vh";
        })
    }

    backgroundShift = () => {
        this.#skyPosY += this.#speed;
        if (this.#skyPosY >= 100) { this.#skyPosY = 0; }
        this.field.style.backgroundPositionY = this.#skyPosY + "vh"; 
        // if animate Bang active shifting with background
        if (this.canvas.used) {
            this.canvas.style.top = (Number(this.canvas.style.top.slice(0,-2)) + this.speed) +"vh";
        }
    };

    shipMove = () => {
        if ( this.enemies.some(enemy => (
            ( enemy.x + 5 > this.player.x) && ( enemy.x + 5 < this.player.x + 6 ) && ( enemy.y + 6 > this.player.y ) && ( enemy.y + 6 < this.player.y + 6 ) ||
            ( enemy.x + 5 > this.player.x) && ( enemy.x + 5 < this.player.x + 6 ) && ( enemy.y > this.player.y ) && ( enemy.y < this.player.y + 6 ) ||
            ( enemy.x > this.player.x) && ( enemy.x < this.player.x + 6 ) && ( enemy.y + 6 > this.player.y ) && ( enemy.y + 6 < this.player.y + 6 ) ||
            ( enemy.x > this.player.x) && ( enemy.x < this.player.x + 6 ) && ( enemy.y > this.player.y ) && ( enemy.y < this.player.y + 6 )
            )))
        {
            this.loseMessage();
        }

        if (this.control == "wasd") {
            ( (this.player.x + this.player.dx * this.player.speed) <= 0 ) || ( (this.player.x + this.player.dx * this.player.speed) > 97 ) 
            ? this.player.dx = 0 
            : this.player.x += this.player.dx * this.player.speed;

        ( (this.player.y + this.player.dy * this.player.speed) <= 0 ) || ( (this.player.y + this.player.dy * this.player.speed) > 92 ) 
            ? this.player.dy = 0 
            : this.player.y += this.player.dy * this.player.speed;
        }

        if (this.control == "mouse") {
            if (( (this.player.x + this.player.dx * this.player.speed) <= 0 ) || ( (this.player.x + this.player.dx * this.player.speed) > 97 )) {
                this.player.dx = 0;
            }else{
                if  (Math.abs(this.magnitoPoint.x - 2 - this.player.x - this.player.dx * this.player.speed) < Math.abs(this.magnitoPoint.x - 2 - this.player.x) ) {
                    this.player.x += this.player.dx * this.player.speed;
                }else{
                    this.player.dx = 0;
                }
            }

            if (( (this.player.y + this.player.dy * this.player.speed) <= 0 ) || ( (this.player.y + this.player.dy * this.player.speed) > 92 )) {
                this.player.dy = 0 
            }else{
                if  (Math.abs(this.magnitoPoint.y - 3 - this.player.y - this.player.dy * this.player.speed) < Math.abs(this.magnitoPoint.y - 3 - this.player.y) ) {
                    this.player.y += this.player.dy * this.player.speed;
                }else{
                    this.player.dy = 0;
                }
            }
        }
        this.bonuses.forEach((bonus,i) => {
            if (Math.abs(bonus.x - this.player.x) > 3 || Math.abs(bonus.y - this.player.y) > 3 ) {
                return
            }
            this.field.removeChild(bonus);
            this.bonuses.splice(i,1);
            this.bonusActivate(bonus.type);
            return;
        })
        /* Player"s shoots */ 
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

            if (enemy.type === 2 || enemy.type === 7) {
                enemy.shootTimer = enemy.shootTimer+1 || 0;
            }

            if ( enemy.shootTimer > 100 ) {
                enemy.shootTimer = 0;
                const shoot = document.createElement("div");
                this.field.appendChild(shoot);
                shoot.x = enemy.x + 2.2;
                shoot.y = enemy.y + 1.7;
                shoot.dx = 0;
                shoot.dy = 1;
                shoot.speed = 1; 
                shoot.type = 1;
                shoot.classList.add("shoot");
                shoot.classList.add(`shootEnemy${shoot.type}`);
                this.enemyShoots.push(shoot);
            }

            this.shoots.forEach( (shoot,index) => {
                if ( ( shoot.x > enemy.x) && ( shoot.x < enemy.x + 5 ) && ( shoot.y > enemy.y ) && ( shoot.y < enemy.y + 6 ) )
                {
                    if (enemy.health || enemy.health > 0) {
                        enemy.health--;
                        this.canvas.style.left = (enemy.x - 3) +"vw";
                        this.canvas.style.top = enemy.y+"vh";
                        this.#animateID++; 
                        this.animate();  
                        this.field.removeChild(shoot);
                        this.shoots.splice(index, 1);
                        return;
                    }
                    this.canvas.style.left = (enemy.x - 3) +"vw";
                    this.canvas.style.top = enemy.y+"vh";
                    this.addScore(100 * enemy.type);
                    
                    if (Math.random() * 100 < 10 ) {
                        let bonus = document.createElement("div");
                        this.field.appendChild(bonus);
                        bonus.x = enemy.x;
                        bonus.y = enemy.y;
                        bonus.dx = 0;
                        bonus.dy = 1;
                        bonus.type = 1 + Math.floor(Math.random() * 4);
                        bonus.speed = enemy.speed;
                        bonus.timerRotateMax = 5;
                        bonus.classList.add("bonus");
                        bonus.classList.add(`bonus${bonus.type}`);
                        this.bonuses.push(bonus);
                    }  
                    try{
                        this.field.removeChild(enemy);
                    }catch (e) {
                        console.log(e);
                        enemy.style.opacity = 0;
                        this.refreshField();
                    }
                  
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
            if (enemy.type === 1) {
                this.animateObject(enemy, 8, 8);
            }
            enemy.y += enemy.dy * enemy.speed;
            
        });

        this.bonuses.forEach((bonus,i) => {
            if( (bonus.y + bonus.dy * bonus.speed) < -10 ) 
            {
                bonus.dy = Math.abs(bonus.dy);
                
            }
            if  ( (bonus.y + bonus.dy * bonus.speed) > 110 ) 
            {
                this.field.removeChild(bonus);
                this.bonuses.splice(i, 1);
            }
            if (bonus.type <= 4) {
                this.animateObject(bonus, 8, 4);
            }
            if (bonus.type > 4)  {
                this.animateObject(bonus, 5, 4);
            }
            bonus.y += bonus.dy * bonus.speed
        });
        
        this.enemyShoots.forEach((enemyShoot,i) => {
            if ( ( enemyShoot.x > this.player.x) && ( enemyShoot.x < this.player.x + 5 ) && ( enemyShoot.y > this.player.y ) && ( enemyShoot.y < this.player.y + 6 ) ) {
                this.field.removeChild(enemyShoot);
                this.enemyShoots.splice(i, 1);
                this.loseMessage();
                return;
            }

            if ( ((enemyShoot.x + enemyShoot.dx * enemyShoot.speed) <= -2 ) || ( (enemyShoot.x + enemyShoot.dx * enemyShoot.speed) > 101 ))
            {
                this.field.removeChild(enemyShoot);
                this.enemyShoots.splice(i, 1);
                return;
            }
            enemyShoot.x += enemyShoot.dx * enemyShoot.speed;
            if(((enemyShoot.y + enemyShoot.dy * enemyShoot.speed) <= -2 ) || ( (enemyShoot.y + enemyShoot.dy * enemyShoot.speed) > 101 ) )
            {
                this.field.removeChild(enemyShoot);
                this.enemyShoots.splice(i, 1);
                return;
            }
            enemyShoot.y += enemyShoot.dy * enemyShoot.speed;
        });
    }
    
    shipFire = () => {
        if (this.paused) {
            return;
        }

        if (this.shoots.length > 30) {
            return;
        }

        const shoot = document.createElement("div");
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
            shoot2.classList.add("shoot");
            shoot2.classList.add(`shoot${this.player.weapon}`);
            shoot3.classList.add("shoot");
            shoot3.classList.add(`shoot${this.player.weapon}`);
            this.shoots.push(shoot2);
            this.shoots.push(shoot3);
        }
    
        shoot.classList.add("shoot");
        shoot.classList.add(`shoot${this.player.weapon}`);
    
        this.shoots.push(shoot);
    } 
    
    addEnemy = (newEnemy) =>  {
        if (this.emptyRide) {
            return;
        }
        if (this.enemies.length > 40) return;
        let enemy = document.createElement("div");
        this.field.appendChild(enemy);
        enemy = Object.assign(enemy, newEnemy);
        enemy.health = newEnemy.health || 0;
         if (enemy.type === 1) {
            enemy.style.backgroundPositionX = 0;
            enemy.style.backgroundPositionY = 0;
    
            enemy.style.transform = "rotate("+ Math.floor(Math.random() * 90) +"deg)";
            enemy.timerRotate = 0;
            enemy.timerRotateMax = 30 * (3 - enemy.dy);    
            if (enemy.timerRotateMax < 3) { enemy.timerRotateMax = 3 }
        }
     
        enemy.classList.add("enemy");
        enemy.classList.add(`enemy${enemy.type}`); 
        this.enemies.push(enemy);
    } 

    bonusActivate = (type) => {
        switch (type) {
            case 1 : this.player.bonus1 += 1000;
                     this.player.weapon = 2;
                    break;
            case 2 : this.player.bonus2 += 300;
                     this.slowMotion = 2;
                     this.player.speed = 1;
                     this.changeMode("hyper");
                    break;
            case 3 :
            case 4 :
            case 5 :
            case 6 :
            case 7 : this.addScore(10000);
                    break;
        }
    }

    checkBonusTime() {
   
        if ((this.player.bonus1 === 0) && (this.player.bonus2 === 0) && (this.player.bonus3 === 0)) {
            return;
        }
        if (this.player.bonus1 > 0) {
            this.player.bonus1--;
        }
        if (this.player.bonus2 > 0) {
            this.player.bonus2--;
        }
        if (this.player.bonus3 > 0) {
            this.player.bonus3--;
        }

        if (this.player.bonus1 === 1) {
            this.player.weapon = 1;
        }
        if (this.player.bonus2 === 1) {
            this.slowMotion = 1;
            this.player.speed = 0.9;
            this.offHyperMode("wave");
        }
        if (this.player.bonus3 === 1) {
//            console.log("disable any bonus here")
        }
    }

    changeMode = (modeName) => {
        if (this.#mode === "hyper") {
            return;
        }

        this.field.classList.remove("colorBurn");
        this.field.classList.remove("hardLight");
        this.field.classList.remove("darken");

        switch (modeName) {
            case "wave" : this.field.classList.add("hardLight"); 
                            this.#mode = "wave"; 
                            break;
            case "boss" : this.field.classList.add("colorBurn"); 
                            this.#mode = "boss"; 
                            break;
            case "hyper" : this.field.classList.add("darken"); 
                            this.#mode = "hyper"; 
                            break;
        }
    };

    offHyperMode = (mode) => {
        this.field.classList.remove("darken"); 
        this.#mode = mode;
        this.changeMode(mode);
    }
    
    addScore(value) {
        this.#score += Math.floor(value);
        this.score.innerText = this.#score;

    }
    // LEVEL SETTINGS

    newWave = () => {
        (this.#speed > 0.7) ? 
        this.#speed = 0.1 :
        this.#speed += this.#accelerate;
        this.#enemyDy += 0.5;

        const newEnemy = {
            "x" : 10,
            "y" : -18,
            "dx" : 0.5,
            "dy" : 0.3,
            "speed" : 0.1,
            "type" : 2,
        };
        for (let i=0; i<30; i++) {
            newEnemy.shootTimer = Math.floor(Math.random()*100); 
            if (i===10) {
                newEnemy.x -= 67; 
                newEnemy.y += 4;
            }
            if (i===20) {
                newEnemy.x -= 73; 
                newEnemy.y += 5;
            }
            newEnemy.x += 7;
            newEnemy.y += 0;
            this.addEnemy(newEnemy);
        }
        this.changeMode("wave");
    }

    addBoss = (type) => {
        let boss = {
            "x" : 10,
            "y" : -2,
            "dx" : 3,
            "dy" : 0.1,
            "speed" : 0.1,
            "type" : type,
            "health" : 15
        };
        this.changeMode("boss");
        this.addEnemy(boss);
        this.emptyRide = true;
    }

    addRandomEnemy = (type) => {
        if (this.emptyRide) {
            return;
        }

        let randomEnemy = {
        "x" : 10 + Math.floor(Math.random() * 80),
        "y" : -7,
        "dx" : -2 + Math.random() * 4,
        "dy" : this.#enemyDy + Math.random() * (2.0 - this.#enemyDy),
        "speed" : 0.1 + Math.random() * 0.1,
        "type" : type
        }
        if (type === 3) { randomEnemy.dy += 3; }
        this.addEnemy(randomEnemy);     
    }

    /* Configure level timers */
    startGame = () => {
        this.canvas.style.width = "7vw";
        this.canvas.style.height = "7vw";
        this.ship.style.opacity = 1;
        this.#timer = setInterval(() => {
            if (this.#paused) {
                return;
            }

            this.#timeLine += 1 / this.slowMotion;
            this.drawAll();
            this.shipMove();
            this.checkBonusTime();
            if (this.#timeLine % this.slowMotion === 0 ) {
                this.enemiesMove();
                this.backgroundShift();
            }
            if (this.#timeLine > 3700 ) { // last event in level
                return;
            }

            if (this.#timeLine === 3700 ) {
                this.addBoss(7);
                this.#speed = 0;
                this.emptyRide = true;
                setTimeout( this.checkFreeSky, 1000);
            }

            if (this.#timeLine % 150 === 0 ) {
                this.addRandomEnemy(Math.floor(1+Math.random()*3));
            }

            if (this.#timeLine % 1250 === 0 ) {
                this.newWave();
            }

        }, this.#tik);

        this.paused = false;  
        this.emptyRide = false;
    }

    resetGame = () => {
        this.paused = true;
        clearInterval(this.#timer);
        this.player = {
            x : 47,
            y : 80,
            dx : 0,
            dy : 0,
            speed : 0.5, // 1 reload per X ms 
            weapon : 1,
            bonus1 : 0,
            bonus2 : 0,
            bonus3 : 0,
        };
        this.field.querySelectorAll(".shoot").forEach(el => {
            this.field.removeChild(el);
        })
        this.field.querySelectorAll(".enemy").forEach(el => {
            this.field.removeChild(el);
        })
        this.field.querySelectorAll(".bonus").forEach(el => {
            this.field.removeChild(el);
        })
        this.emptyRide = false; // final line without enemies
        this.shoots = [];
        this.bonuses = [];
        this.enemyShoots = [];
        this.enemies = [];
        this.#timeLine = 1;
        this.#speed = 0.1; // Xvh (move background)
        this.#accelerate = 0.1;  // shift  Xvh
        this.#enemyDy = 1; // base speed Enemies Ship
        this.#score = 0;
        this.#skyPosY = 0;
        this.changeMode("normal");
    }

    animateObject = (obj,x,y) => {
        if (obj.timerRotate > 0) {
            obj.timerRotate--;
            return;
        }

        obj.timerRotate = obj.timerRotateMax;
        let bgX = Number(obj.style.backgroundPositionX.slice(0,-2)) - 7;
        let bgY = Number(obj.style.backgroundPositionY.slice(0,-2));
        
        if (bgX <= -7 * x) {
            bgX = 0;
            bgY -= 7;
        }

        if (bgY <= -7 * y) {
            bgX = 0; 
            bgY = 0;
        }
        obj.style.backgroundPosition = bgX + "vw " + bgY +"vw";
    }

    checkFreeSky = () => {
        if (this.enemies.length === 0) {
            this.offHyperMode();
            this.changeMode("normal");
            setTimeout(this.winMessage, 3000);
            return true;
        }

        setTimeout(this.checkFreeSky, 1000);
        return false; 
    }

    winMessage = () => {
        this.#paused = !this.#paused;
        this.msgBox.classList.remove("hide");
        this.msgBox.innerHTML= `You WIN!<br/>Your score: ${this.#score} <br/><div class="newGameBtn">next Level</div>`;
        this.msgBox.querySelector(".newGameBtn").addEventListener("click", () => {
            this.msgBox.classList.add("hide");
            this.resetGame();
            this.startGame();
        });
    }

    loseMessage = () => {
        this.#paused = !this.#paused;
        
        this.canvas.style.left = (this.player.x - 9) +"vw";
        this.canvas.style.top = (this.player.y - 9)+"vh";
        this.canvas.style.width = "20vw";
        this.canvas.style.height = "20vw";
        this.#animateID++; 
        this.animate();  

        this.ship.style.opacity = 0;
        setTimeout( () => {
            
            this.msgBox.classList.remove("hide");
            this.msgBox.innerHTML= `Your ship destroyed!<br/>Your score: ${this.#score} <br/><div class="newGameBtn">avange!</div>`;
            this.msgBox.querySelector(".newGameBtn").addEventListener("click", () => {
                this.msgBox.classList.add("hide");
                this.resetGame();
                this.startGame();
            });
            this.ship.style.opacity = 0.3;
        }, 1700);

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
    /* Errors */
    refreshField = () => {
        this.field.querySelectorAll('.enemy').forEach(el => {
            el.style.opacity = "0";
        })
        this.enemies.forEach(el => {
            el.style.opacity = "1";
        })
    }
}
