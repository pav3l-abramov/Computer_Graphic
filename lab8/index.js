import PhongFS from "./shaders/frag_Phong"
import PhongVS from "./shaders/vert_Phong"
import {OBJ} from "webgl-obj-loader"
import {sphere} from "./textures/sphere_obj";
import orangeColor from "./textures/orangeColor.png";
import orange_Normal from "./textures/orange_normal3.jpg";
import * as glm from "gl-matrix";

let gl;
let ambientCoeff = 1.0, c1 = 0.001, c2 = 0.0001, distance=30;
let propDig = 1.0, propMat = 1.0, orangeTexture, orangeNormal;
let mesh = new OBJ.Mesh(sphere);


function main(id) {
    var canvas = document.getElementById(id);
    gl = initWebGL(canvas); // инициализация контекста GL – сами пишем
    // продолжать только если WebGL доступен и работает
    if (gl) { // продолжать только если WebGL доступен и работает
        // Устанавливаем размер вьюпорта
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность//немного другой цвет сделал
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // включает использование буфера глубины
        gl.enable(gl.DEPTH_TEST);
        // определяет работу буфера глубины: более ближние объекты перекрывают дальние
        gl.depthFunc(gl.LEQUAL);
        // очистить буфер цвета и буфер глубины
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    }
    let shaderProgram = initShaderProgram(gl,PhongVS ,PhongFS );


    //тут загружаем OBJ, т.е. сферу
    OBJ.initMeshBuffers(gl, mesh);



    window.addEventListener("keydown", checkKeyPressed);
    orangeTexture = gl.createTexture();
    orangeNormal = gl.createTexture();
    setTexture([orangeColor,orange_Normal],[orangeTexture,orangeNormal]);
    function setTexture(urls, textures) {
        for(let i = 0; i < urls.length; i++){
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

            let image = new Image();
            image.onload = function() {
                handleTextureLoaded(image, textures[i]);
            }
            image.src = urls[i];

            gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"+i), i);
        }
    }
    function handleTextureLoaded(image, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }
    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    function render() {
        shaderProgram = initShaderProgram(gl,PhongVS ,PhongFS );
        gl.useProgram(shaderProgram);
        if(shaderProgram) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearDepth(1.0);
            drawCube(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube1,pedestal, scene,  [0.0, 0.0, 0.0], 2.0,"orange");


        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


}




function drawCube(shaderProgram, color, Cube, Pedestal, Scene,  pos, size,type) {

    //положение источника света
    const lightPositionValue = [20, 20, distance];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uLightPosition"),lightPositionValue);
    //цвет фонового освещения
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "uAmbientLightColor"),[0.1, 0.1, 0.1]);
    //цвет диффузиозного освещения
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "uDiffuseLightColor"),[0.7, 0.7, 0.7]);
    //спекулярный цвет освещения
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uSpecularLightColor"),[1.0, 1.0, 1.0]);
    //коэффициент линейного рассеивания
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "uc1"),c1);
    //коэффициент квадратичного рассеивания
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "uc2"),c2);
    //коэффициент фонового освещения
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "uAmbientIntensity"),ambientCoeff);


    const positionBuffer = mesh.vertexBuffer;

    const textureCoordBuffer = mesh.textureBuffer;

    const indexBuffer = mesh.indexBuffer;

    const normalBuffer = mesh.normalBuffer;



    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);
    //обращение к точкам вершин по индексу

    const aTextCoords = gl.getAttribLocation(shaderProgram, "aTextureCoords");
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(aTextCoords, textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTextCoords);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(vertexNormalAttribute, normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalAttribute);



    //операции над кубами
    const mProj = gl.getUniformLocation(shaderProgram, "mProj");
    const mWorld = gl.getUniformLocation(shaderProgram, "mWorld");

    const fieldOfView = ( Math.PI) / 10;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const Near = 0.1;
    const Far = 500.0;

    const projectionMatrix = glm.mat4.create();
    const worldMatrix = glm.mat4.create();
    glm.mat4.perspective(projectionMatrix, fieldOfView, aspect, Near, Far);
    // перемещаем камеру на 4 вниз и 30 от плоскости ху, кубы в центре координат
    glm.mat4.translate(projectionMatrix, projectionMatrix, [0.0, 0.0, -10]);//можно было не трогать камеру, но так проще для понимания
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);
    //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Scene);
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);//становится локальным центром пьедестала
    //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Pedestal);
    glm.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
    glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);

            gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D, orangeTexture);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler0"), 0);
            gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D, orangeNormal);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler1"), 1);


    //теккстуры
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropMat"), propMat);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropDig"), propDig);



    gl.uniformMatrix4fv(mProj, false, projectionMatrix);
    gl.uniformMatrix4fv(mWorld, false, worldMatrix);

    //матрица нормалей
    const normalMatrix = glm.mat4.create();
    glm.mat4.invert(normalMatrix, worldMatrix);
    glm.mat4.transpose(normalMatrix, normalMatrix);
    gl.getUniformLocation(shaderProgram, "uNormalMatrix")
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uNormalMatrix"),false,normalMatrix);

//отрисовка кубов
    gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);




}
start();

function initWebGL(canvas) {
    gl = null;
    try { // Попытаться получить стандартный контекст.
        // Если не получится, попробовать получить экспериментальный.
        gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}
    // Если мы не получили контекст GL, завершить работу
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;

}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    // Send the source to the shader object
    gl.shaderSource(shader, source);
    // Compile the shader program
    gl.compileShader(shader);
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

var elment= "";
var cube1= 0.0;
var cube2= 0.0;
var cube3= 0.0;
var cube4= 0.0;
var pedestal= 0.0;
var scene= 0.0;

function start() {
    main("scene");


} // function start

function checkKeyPressed(e) {
    if (e.keyCode == "49")
    {
        elment = "1";
    }
    if (e.keyCode == "50")
    {
        elment = "2";
    }
    if (e.keyCode == "51")
    {
        elment = "3";
    }
    if (e.keyCode == "52")
    {
        elment = "4";
    }
    if (e.keyCode == "53")
    {
        elment = "p";
    }
    if (e.keyCode == "54")
    {
        elment = "s";
    }

    if (e.keyCode == "37") {
        switch (elment) {
            case "1":
                cube1 -= 0.1;
                break;
            case "2":
                cube2 -= 0.1;
                break;
            case "3":
                cube3 -= 0.1;
                break;
            case "4":
                cube4 -= 0.1;
                break;
            case "p":
                pedestal -= 0.1;
                break;
            case "s":
                scene -= 0.1;
                break;

        }
    }
    if (e.keyCode == "39") {
        switch (elment) {
            case "1":
                cube1 += 0.1;
                break;
            case "2":
                cube2 += 0.1;
                break;
            case "3":
                cube3 += 0.1;
                break;
            case "4":
                cube4 += 0.1;
                break;
            case "p":
                pedestal += 0.1;
                break;
            case "s":
                scene += 0.1;
                break;
        }
    }
}

