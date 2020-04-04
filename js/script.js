import Game from "./game.js"

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
            case 80 : game.paused = !game.paused; break;

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


});