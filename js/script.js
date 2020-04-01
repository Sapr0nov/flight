
import Game from './game.js'

/* ============================================================================*/

document.addEventListener("DOMContentLoaded", e => {

    const field = document.querySelector('.field');
    const ship = document.querySelector('.player');
    const canvas = document.getElementById("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.opacity = "1";
    canvas.used = false;
   
    field.style.backgroundPositionX = '0vw';
    field.style.backgroundPositionY = '0vh';

    const game = new Game(field, ship, canvas, 60000,2000,300,'mouse');

    game.startGame(field,ship);

    /* autofire */
    setInterval( () => {
        if (game.autoFire) {
            game.shipFire(field);
        }
    }, game.fireSpeed);

    /* Controls */

    document.addEventListener('keydown', e => {
        console.log(e.keyCode);
        // 32 Пробел
        //80 P pause
        switch (e.keyCode) {
            case 87 : game.player.dy = -1; break;
            case 65 : game.player.dx = -1; break;
            case 83 : game.player.dy = 1; break;
            case 68 : game.player.dx = 1;  break;
            case 71 : game.autoFire = !game.autoFire; break;
            case 49 : game.player.weapon = 1; game.offHyperMode(field); game.slowMotion = 1; game.stopGame(); game.startGame(field,ship);break;
            case 50 : game.player.weapon = 2; game.changeMode(field,'hyper'); game.slowMotion = 200; game.stopGame(); game.startGame(field,ship); break;
            case 51 : game.control = 'wasd';  document.querySelector('.field').style.cursor = 'pointer'; break;
            case 52 : game.control = 'mouse'; break;
            case 27 :
            case 80 : game.stopGame();
                      (game.paused) ? game.startGame(field,ship) : game.paused = true; break;

        }
       
    });

    document.addEventListener('keyup', e => {
        switch (e.keyCode) {
            case 87 : game.player.dy = 0; break;
            case 65 : game.player.dx = 0; break;
            case 83 : game.player.dy = 0; break;
            case 68 : game.player.dx = 0; break;
            case 70 :  game.shipFire(field);  break;
        }
    });

    document.addEventListener('mousemove', e => {
        if (game.control == 'wasd') return;

        let cursorX = Math.floor(e.clientX / document.documentElement.clientWidth * 100);
        let cursorY = Math.floor(e.clientY / document.documentElement.clientHeight * 100);
        game.magnitoPoint = {'x': cursorX,'y': cursorY};

        document.querySelector('.field').style.cursor = 'none'; //crosshair

        (cursorX > game.player.x + 2) ? game.player.dx = 1 : game.player.dx = -1;
        (cursorY > game.player.y + 3) ? game.player.dy = 1 : game.player.dy = -1;
        if (cursorX < game.player.x + 2 && cursorX > game.player.x - 2 ) {game.player.dx = 0; }
        if (cursorY < game.player.y + 2 && cursorY > game.player.y - 2 ) {game.player.dy = 0; }

    })

    document.addEventListener('click', e => {
        game.shipFire(field);
    })

    document.addEventListener( "contextmenu", e => {
        e.preventDefault();
        game.player.weapon = 2;
        game.shipFire(field);
        game.player.weapon = 1;
      });


});