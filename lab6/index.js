import bengalFS from "./shaders/bengal/bengalFS"
import bengalVS from "./shaders/bengal/bengalVS"
import trackFS from "./shaders/bengal/trackFS"
import trackVS from "./shaders/bengal/trackVS"
import fireworkFS from "./shaders/firework/fireworkFS"
import fireworkVS from "./shaders/firework/fireworkVS"
import smokeFS from './shaders/smoke/smokeFS'
import smokeVS from './shaders/smoke/smokeVS'
import rainFS from './shaders/rain/rainFS'
import rainVS from './shaders/rain/rainVS'
import spark_texture from "./textures/bengalpng.png"
import smoke_texture from "./textures/smokepng.png"
import rain_texture from "./textures/rainpng.png"
import {mat4} from "gl-matrix";
let punkt=0;
const canvas = document.querySelector('canvas');

document.getElementById('btn-change').onclick = () => {
    let text = document.getElementById('model')

    punkt++
    if (punkt === 4) punkt = 0
    if (punkt === 0) text.textContent = 'bengal'
    else if (punkt === 1) text.textContent = 'smoke'
    else if (punkt === 2) text.textContent = 'electrons in a bipolar transistor'
    else if (punkt === 3) text.textContent = 'firework'
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;

}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function Spark() {
    this.init();
}

// количество искр
Spark.sparksCount = 500;


main_bengal();
function main_bengal() {
    Spark.prototype.init = function () {
        // время создания искры
        this.timeFromCreation = performance.now();

        // задаём направление полёта искры в градусах, от 0 до 360
        const angle = Math.random() * 360;
        // радиус - это расстояние, которое пролетит искра
        const radius = Math.random()*2;
        // отмеряем точки на окружности - максимальные координаты искры
        this.xMax = Math.cos(angle) * radius;
        this.yMax = Math.sin(angle) * radius;

        // dx и dy - приращение искры за вызов отрисовки, то есть её скорость,
        // у каждой искры своя скорость. multiplier подобран экспериментально
        const multiplier = 125 + Math.random() * 125;
        this.dx = this.xMax / multiplier;
        this.dy = this.yMax / multiplier;

        // Для того, чтобы не все искры начинали движение из начала координат,
        // делаем каждой искре свой отступ, но не более максимальных значений.
        this.x = (this.dx * 1000) % this.xMax;
        this.y = (this.dy * 1000) % this.yMax;
    };

    Spark.prototype.move = function (time) {
        // находим разницу между вызовами отрисовки, чтобы анимация работала
        // одинаково на компьютерах разной мощности
        const timeShift = time - this.timeFromCreation;
        this.timeFromCreation = time;

        // приращение зависит от времени между отрисовками
        const speed = timeShift*0.2;
        this.x += this.dx * speed;
        this.y += this.dy * speed;

        // если искра достигла конечной точки, запускаем её заново из начала координат
        if (Math.abs(this.x) > Math.abs(this.xMax) || Math.abs(this.y) > Math.abs(this.yMax)) {
            this.init();
        }
    };
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // gl.SRC_ALPHA - рисуемая искра умножается на прозрачный канал, чтобы убрать фон
    // изображения. gl.ONE - уже нарисованные искры остаются без изменений
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let programTrack = initShaderProgram(gl, trackVS, trackFS);

    // инициализация программы следов искр

    const positionAttributeLocationTrack = gl.getAttribLocation(programTrack, "a_position");
    const colorAttributeLocationTrack = gl.getAttribLocation(programTrack, "a_color");
    const pMatrixUniformLocationTrack = gl.getUniformLocation(programTrack, "u_pMatrix");
    const mvMatrixUniformLocationTrack = gl.getUniformLocation(programTrack, "u_mvMatrix");

    // инициализация программы искр
    let programSpark = initShaderProgram(gl, bengalVS, bengalFS);

    const positionAttributeLocationSpark = gl.getAttribLocation(programSpark, "a_position");
    const textureLocationSpark = gl.getUniformLocation(programSpark, "u_texture");
    const pMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_pMatrix");
    const mvMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_mvMatrix");

    const texture = gl.createTexture();

    const image = new Image();
    image.src = spark_texture;
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(drawScene);
    });

    const mvMatrix = mat4.create();
    const pMatrix = mat4.create();

    function drawTracks(positions) {
        const colors = [];
        const positionsFromCenter = [];
        for (let i = 0; i < positions.length; i += 3) {
            // для каждой координаты добавляем точку начала координат, чтобы получить след искры
            positionsFromCenter.push(0, 0, 0);
            positionsFromCenter.push(positions[i], positions[i + 1], positions[i + 2]);

            // цвет в начале координат будет белый (горячий), а дальше будет приближаться к оранжевому
            colors.push(0, 0, 0, 0.47, 0.31, 0.24);
        }

        gl.useProgram(programTrack);

        gl.uniformMatrix4fv(pMatrixUniformLocationTrack, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationTrack, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsFromCenter), gl.STATIC_DRAW);

        gl.vertexAttribPointer(positionAttributeLocationTrack, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocationTrack);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        gl.vertexAttribPointer(colorAttributeLocationTrack, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorAttributeLocationTrack);

        gl.drawArrays(gl.LINES, 0, positionsFromCenter.length / 3);
    }

    function drawSparks(positions) {
        gl.useProgram(programSpark);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocationSpark, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(positionAttributeLocationSpark, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(positionAttributeLocationSpark);

        gl.drawArrays(gl.POINTS, 0, positions.length / 3);
    }

    const sparks = [];
    for (let i = 0; i < Spark.sparksCount; i++) {
        sparks.push(new Spark());
    }

    function drawScene(now) {

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);

        for (let i = 0; i < sparks.length; i++) {
            sparks[i].move(now);
        }

        const positions = [];
        sparks.forEach(function(item, i, arr) {
            positions.push(item.x);
            positions.push(item.y);
            // искры двигаются только в одной плоскости xy
            positions.push(0);
        });

        drawTracks(positions);
        drawSparks(positions);

       if (punkt===0) requestAnimationFrame(drawScene);
       if(punkt===1) main_smoke();
    }
}


function Smoke() {
    this.init();
}

// количество искр

Smoke.sparksCount = 5000;

function main_smoke() {
    Smoke.prototype.init = function () {
        // время создания искры
        this.timeFromCreation = performance.now();

        // задаем начальные координаты
        const startX = Math.random() * 8 - 4;// генерируем случайное значение по ширине окна
        const startY = Math.random() * (-4 + 2) - 2;

        // задаем максимальное значение по y, которое может достигнуть дым
        const yMax = 2;

        // скорость движения дыма
        const speed = 0.001 + Math.random() * 0.05;

        // максимальное смещение по оси x
        const xMaxOffset = 0.001 + Math.random() * 0.001;

        // скорость изменения смещения по оси x
        const xChangeSpeed = Math.random() * (-0.000002) + 0.000001;

        this.size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
        // начальное смещение по оси x
        this.xOffset = 0;

        // сохраняем стартовые координаты
        this.x = startX;
        this.y = startY;

        // сохраняем максимальное значение по y
        this.yMax = yMax;

        // сохраняем скорость
        this.speed = speed;

        // сохраняем максимальное смещение по оси x
        this.xMaxOffset = xMaxOffset;

        // сохраняем скорость изменения смещения по оси x
        this.xChangeSpeed = xChangeSpeed
    };

    Smoke.prototype.move = function (time) {
        this.timeFromCreation = time;

        // приращение по y зависит от времени между отрисовками и скорости дыма
        const ySpeed = this.speed;
        this.y += ySpeed;

        // изменение смещения по оси x
        const xOffsetSpeed = this.xChangeSpeed;
        this.xOffset = this.xOffset + xOffsetSpeed;
        const x = this.x + this.xOffset;

        // если дым достиг конечной точки по y, начинаем вновь
        if (this.y > this.yMax) {
            this.init();
        }

        // сохраняем новые координаты
        this.x = x;
        //this.y = this.y;
    };
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // gl.SRC_ALPHA - рисуемая искра умножается на прозрачный канал, чтобы убрать фон
    // изображения. gl.ONE - уже нарисованные искры остаются без изменений
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let programSmoke = initShaderProgram(gl, smokeVS, smokeFS);

    const positionAttributeLocationSpark = gl.getAttribLocation(programSmoke, "a_position");
    const textureLocationSpark = gl.getUniformLocation(programSmoke, "u_texture");
    const pMatrixUniformLocationSpark = gl.getUniformLocation(programSmoke, "u_pMatrix");
    const mvMatrixUniformLocationSpark = gl.getUniformLocation(programSmoke, "u_mvMatrix");

    const texture = gl.createTexture();

    const image = new Image();
    image.src = smoke_texture;
    image.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(drawScene);
    });

    const mvMatrix = mat4.create();
    const pMatrix = mat4.create();

    function drawSmoke(positions) {
        gl.useProgram(programSmoke);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocationSpark, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(positionAttributeLocationSpark, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(positionAttributeLocationSpark);

        gl.drawArrays(gl.POINTS, 0, positions.length / 3);
    }

    const smokes = [];
    for (let i = 0; i < Smoke.sparksCount; i++) {
        smokes.push(new Smoke());
    }

    function drawScene(now) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);

        for (let i = 0; i < smokes.length; i++) {
            smokes[i].move(now);
        }

        const positions = [];
        smokes.forEach(function (item, i, arr) {
            positions.push(item.x);
            positions.push(item.y);
            // искры двигаются только в одной плоскости xy
            positions.push(0);
        });

        drawSmoke(positions);

        if (punkt===1) requestAnimationFrame(drawScene);
        if(punkt===2) main_rain();
    }
}


function Rain() {
    this.init();
}
// количество искр

Rain.sparksCount = 2000;

function main_rain() {
    Rain.prototype.init = function () {
        // время создания искры
        this.timeFromCreation = performance.now();

        // задаем начальные координаты
        const startX = Math.random() * 8 - 2;// генерируем случайное значение по ширине окна
        const startY = Math.random() * 2 + 3;

        // задаем максимальное значение по y, которое может достигнуть дым
        const yMax = -2;
        const xMax = -4;

        // скорость движения дыма
        const speed =-0.01 - Math.random() * 0.01;
        // скорость изменения смещения по оси x
        const xChangeSpeed = Math.random() * (-0.02) -0.001;

        this.size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
        // начальное смещение по оси x
        this.xOffset = 0;

        // сохраняем стартовые координаты
        this.x = startX;
        this.y = startY;

        // сохраняем максимальное значение по y
        this.yMax = yMax;
        this.xMax = xMax;
        // сохраняем скорость
        this.speed = speed;

        // сохраняем скорость изменения смещения по оси x
        this.xChangeSpeed = xChangeSpeed
    };

    Rain.prototype.move = function (time) {
        this.timeFromCreation = time;

        // приращение по y зависит от времени между отрисовками и скорости дыма
        const ySpeed = this.speed;
        this.y += ySpeed;

        // изменение смещения по оси x
        const  xSpeed= this.xChangeSpeed;
        this.x += xSpeed;

        // если дым достиг конечной точки по y, начинаем вновь
        if (this.y < this.yMax|| this.x < this.xMax) {
            this.init();
        }

        // сохраняем новые координаты
        //this.x = x;
        //this.y = this.y;
    };
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // gl.SRC_ALPHA - рисуемая искра умножается на прозрачный канал, чтобы убрать фон
    // изображения. gl.ONE - уже нарисованные искры остаются без изменений
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let programSmoke = initShaderProgram(gl, rainVS, rainFS);

    const positionAttributeLocationSpark = gl.getAttribLocation(programSmoke, "a_position");
    const textureLocationSpark = gl.getUniformLocation(programSmoke, "u_texture");
    const pMatrixUniformLocationSpark = gl.getUniformLocation(programSmoke, "u_pMatrix");
    const mvMatrixUniformLocationSpark = gl.getUniformLocation(programSmoke, "u_mvMatrix");

    const texture = gl.createTexture();

    const image = new Image();
    image.src = rain_texture;
    image.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(drawScene);
    });

    const mvMatrix = mat4.create();
    const pMatrix = mat4.create();

    function drawSmoke(positions) {
        gl.useProgram(programSmoke);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocationSpark, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(positionAttributeLocationSpark, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(positionAttributeLocationSpark);

        gl.drawArrays(gl.POINTS, 0, positions.length / 3);
    }

    const rain = [];
    for (let i = 0; i < Rain.sparksCount; i++) {
        rain.push(new Rain());
    }

    function drawScene(now) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);

        for (let i = 0; i < rain.length; i++) {
            rain[i].move(now);
        }

        const positions = [];
        rain.forEach(function (item, i, arr) {
            positions.push(item.x);
            positions.push(item.y);
            // искры двигаются только в одной плоскости xy
            positions.push(0);
        });

        drawSmoke(positions);

        if (punkt===2) requestAnimationFrame(drawScene);
        if(punkt===3) main_firework();
    }
}

function Fire() {
    this.init();
}

// количество искр
Fire.sparksCount = 50;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function main_firework() {
    Fire.prototype.init = function () {
        // время создания искры
        this.timeFromCreation = performance.now();
        const a =Math.floor(Math.random() * 10);
        // задаём направление полёта искры в градусах, от 0 до 360
        const angle = Math.floor(Math.random() * (a*2+1)) * Math.PI/a;
        // радиус - это расстояние, которое пролетит искра
        const radius = Math.floor(Math.random() * 3);
        // отмеряем точки на окружности - максимальные координаты искры
        this.xMax = Math.cos(angle) * radius;
        this.yMax = Math.sin(angle) * radius;

        // dx и dy - приращение искры за вызов отрисовки, то есть её скорость,
        // у каждой искры своя скорость. multiplier подобран экспериментально
        const multiplier = 125 + Math.random() * 125;
        this.dx = this.xMax / multiplier;
        this.dy = this.yMax / multiplier;

        // Для того, чтобы не все искры начинали движение из начала координат,
        // делаем каждой искре свой отступ, но не более максимальных значений.
        this.x = (this.dx * 10) % this.xMax;
        this.y = (this.dy * 10) % this.yMax;
    };

    Fire.prototype.move = function (time) {
        // находим разницу между вызовами отрисовки, чтобы анимация работала
        // одинаково на компьютерах разной мощности
        const timeShift = time - this.timeFromCreation;
        this.timeFromCreation = time;

        // приращение зависит от времени между отрисовками
        const speed = timeShift*0.05;
        this.x += this.dx * speed;
        this.y += this.dy * speed;

        // если искра достигла конечной точки, запускаем её заново из начала координат
       if (Math.abs(this.x) > Math.abs(this.xMax) || Math.abs(this.y) > Math.abs(this.yMax)) {
           this.init();
        }
    };
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // gl.SRC_ALPHA - рисуемая искра умножается на прозрачный канал, чтобы убрать фон
    // изображения. gl.ONE - уже нарисованные искры остаются без изменений
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let programTrack = initShaderProgram(gl, trackVS, trackFS);

    // инициализация программы следов искр

    const positionAttributeLocationTrack = gl.getAttribLocation(programTrack, "a_position");
    const colorAttributeLocationTrack = gl.getAttribLocation(programTrack, "a_color");
    const pMatrixUniformLocationTrack = gl.getUniformLocation(programTrack, "u_pMatrix");
    const mvMatrixUniformLocationTrack = gl.getUniformLocation(programTrack, "u_mvMatrix");

    // инициализация программы искр
    let programSpark = initShaderProgram(gl, fireworkVS, fireworkFS);

    const positionAttributeLocationSpark = gl.getAttribLocation(programSpark, "a_position");
    const textureLocationSpark = gl.getUniformLocation(programSpark, "u_texture");
    const pMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_pMatrix");
    const mvMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_mvMatrix");

    const texture = gl.createTexture();

    const image = new Image();
    image.src = spark_texture;
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(drawScene);
    });

    const mvMatrix = mat4.create();
    const pMatrix = mat4.create();

    function drawTracks(positions) {
        const colors = [];
        const positionsFromCenter = [];
        for (let i = 0; i < positions.length; i += 3) {
            // для каждой координаты добавляем точку начала координат, чтобы получить след искры
            positionsFromCenter.push(0, 0, 0);
            positionsFromCenter.push(positions[i], positions[i + 1], positions[i + 2]);

            // цвет в начале координат будет белый (горячий), а дальше будет приближаться к оранжевому
            colors.push(0, 0, 0, 0.47, 0.31, 0.24);
        }

        gl.useProgram(programTrack);

        gl.uniformMatrix4fv(pMatrixUniformLocationTrack, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationTrack, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsFromCenter), gl.STATIC_DRAW);

        gl.vertexAttribPointer(positionAttributeLocationTrack, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocationTrack);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        gl.vertexAttribPointer(colorAttributeLocationTrack, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorAttributeLocationTrack);

        gl.drawArrays(gl.LINES, 0, positionsFromCenter.length / 3);
    }

    function drawSparks(positions) {
        gl.useProgram(programSpark);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocationSpark, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(positionAttributeLocationSpark, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(positionAttributeLocationSpark);

        gl.drawArrays(gl.POINTS, 0, positions.length / 3);
    }

    const sparks = [];
    for (let i = 0; i < Fire.sparksCount; i++) {
        sparks.push(new Fire());
    }

    function drawScene(now) {

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);

        for (let i = 0; i < sparks.length; i++) {
            sparks[i].move(now);
        }

        const positions = [];
        sparks.forEach(function(item, i, arr) {
            positions.push(item.x);
            positions.push(item.y);
            // искры двигаются только в одной плоскости xy
            positions.push(0);
        });

        drawTracks(positions);
        drawSparks(positions);

        if (punkt===3) requestAnimationFrame(drawScene);
        if(punkt===0) main_bengal();
    }
}