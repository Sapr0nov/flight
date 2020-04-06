import Game from "./game.js"

class loaderImages {
    constructor(msgBox,...values) {
        const images = [];
        this.percent = 0;
        this.msgBox = msgBox;
        this.step = Math.floor(10000 / values.length);
        for (let i = 0; i < values.length; i++) {
            images[i] = new Image();
            images[i].onload = this.notifyLoaded;
            images[i].src = values[i];
        }
    }

    statusUpdate = () => {
        this.msgBox.innerHTML = `<h1>Loaded ${this.percent / 100 } %</h1>`;
    }

    notifyLoaded = () => {
        this.percent += this.step;
        this.statusUpdate();
        if (this.percent > 9900) {
            this.msgBox.innerHTML = `<h1>Success loaded.<br/> For start play press <button>'ESC'</button> </h1>`;
        }
    }
}

document.addEventListener("DOMContentLoaded", e => {

    const field = document.querySelector(".field");
    const ship = document.querySelector(".player");
    const score = document.querySelector(".score");
    const msgBox = document.querySelector(".messageBox");
    const canvas = document.getElementById("canvas");

    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.opacity = "0";
    canvas.used = false;
   
    field.style.backgroundPositionX = "0vw";
    field.style.backgroundPositionY = "0vh";

    const preloadImages = new loaderImages(msgBox,
        "../img/fon.jpg",
        "../img/bang.png",
        "../img/ship.png",
        "../img/bang.png",
        "../img/asteroid.png",
        "../img/enemy02.png",
        "../img/enemy03.png",
        "../img/enemy07.png",
        "../img/bonus1.png",
        "../img/bonus2.png",
        "../img/bonus3.png",
        "../img/bonus4.png",
        "../img/bonus5.png",
        "../img/bonus6.png",
        "../img/bonus7.png",
        );
        
    const gameParametrs = {
        "field" : field,
        "ship" : ship,
        "msgBox" : msgBox,
        "canvas" : canvas,
        "score" : score,
        "timeLevel" : 60000,
        "enemiesGenerationSpeed" : 2000,
        "fireSpeed" : 600,
        "controlType" : "mouse",
    }
    const game = new Game(gameParametrs);

    game.startGame();
    game.paused = true;
    msgBox.innerHtml 
    msgBox.classList.remove('hide');


     setInterval( () => {
        if (game.autoFire) {
            game.shipFire();
        }
    }, game.fireSpeed);

    /* Controls */

    document.addEventListener("keydown", e => {
        switch (e.keyCode) {
            case 71 : game.autoFire = !game.autoFire; break;
            case 49 : game.player.weapon = 1; break;
            case 50 : game.player.weapon = 2; break;
            case 51 : game.control = "wasd";  field.style.cursor = "pointer"; break;
            case 52 : game.control = "mouse"; field.style.cursor = "crosshair"; break;
            case 27 :
            case 80 : game.paused = !game.paused; msgBox.classList.add('hide'); break;

        }
        
        if (game.control === "mouse") { 
            return 
        }
        switch (e.keyCode) {
            case 87 : game.player.dy = -1; break;
            case 65 : game.player.dx = -1; break;
            case 83 : game.player.dy = 1; break;
            case 68 : game.player.dx = 1;  break;
        }
       
    });

    document.addEventListener("keyup", e => {
        if (game.control === "mouse") { 
            return 
        }
        switch (e.keyCode) {
            case 87 : game.player.dy = 0; break;
            case 65 : game.player.dx = 0; break;
            case 83 : game.player.dy = 0; break;
            case 68 : game.player.dx = 0; break;
            case 70 :  game.shipFire();  break;
        }
    });

    document.addEventListener("mousemove", e => {
        if (game.control === "wasd") return;

        let cursorX = Math.floor(e.clientX / document.documentElement.clientWidth * 100);
        let cursorY = Math.floor(e.clientY / document.documentElement.clientHeight * 100);
        game.magnitoPoint = {"x": cursorX,"y": cursorY};

        field.style.cursor = "crosshair"; //crosshair

        (cursorX > game.player.x + 2) ? game.player.dx = 1 : game.player.dx = -1;
        (cursorY > game.player.y + 3) ? game.player.dy = 1 : game.player.dy = -1;
    })

    document.addEventListener("click", e => {
        game.shipFire();
    })
    /*Right buttom*/
    document.addEventListener( "contextmenu", e => {
        e.preventDefault();
        game.autoFire = !game.autoFire;
      });

      document.addEventListener("click", e => {
        if (e.target.tagName === 'BUTTON') {
            e.preventDefault();
            game.paused = !game.paused; 
            msgBox.classList.add('hide');          
        }
    })

});