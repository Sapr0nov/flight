/* Animation service function*/
export default class SpriteSheet  {
    constructor (path, frameWidth, frameHeight, endFrame, frameSpeed) {
        this.path = path;
        this.frameHeight = frameHeight;
        this.frameWidth = frameWidth;
        this.endFrame = endFrame;
        this.frameSpeed = frameSpeed;
        this.image = new Image();
        this.framesPerRow;
        // вычисление количества кадров в строке после загрузки изображения

        this.image.onload = () => {
            this.framesPerRow = Math.floor(this.image.width / frameWidth);
        };

        this.image.src = path;
        this.currentFrame = 0;  // текущий кадр для отрисовки
        this.counter = 0;       // счетчик ожидания
    }
    update = () => {
        // если подошло время смены кадра, то меняем
        if (this.currentFrame == this.endFrame-1) 
        {
            this.currentFrame = this.endFrame;
            return;
        }

        if (this.counter == (this.frameSpeed - 1))
        this.currentFrame = (this.currentFrame + 1) % this.endFrame;
        // обновление счетчика ожидания
        this.counter = (this.counter + 1) % this.frameSpeed;
        return this.counter;
        }
    draw = (x, y, ctx) => {
        // вычисление столбика и строчки с нужным кадром
        var row = Math.floor(this.currentFrame / this.framesPerRow);
        var col = Math.floor(this.currentFrame % this.framesPerRow);

        ctx.drawImage(
        this.image,
        col * this.frameWidth, row * this.frameHeight,
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth, this.frameHeight);
    };
}
