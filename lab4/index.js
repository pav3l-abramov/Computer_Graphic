import PhongFS from "./shaders/frag_Phong"
import PhongVS from "./shaders/vert_Phong"
import BlinnPhongVS from './shaders/vert_BlinnPhong'
import LambertVS from './shaders/vert_Lambert'
import GoureauFS from './shaders/frag_Goureau'
import ToonShadingFS from './shaders/frag_ToonShading'

import * as glm from "gl-matrix";

let gl;
let ambientCoeff = 1.0, shadingModel = 0, lightingModel = 0, c1 = 0.001, c2 = 0.001, distance=30;
let  fs_list= [ PhongFS,GoureauFS, ToonShadingFS],vs_list= [ PhongVS,LambertVS, BlinnPhongVS];
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


    window.addEventListener("keydown", checkKeyPressed);


    function render() {
        const shaderProgram = initShaderProgram(gl,vs_list[lightingModel] ,fs_list[shadingModel] );
        gl.useProgram(shaderProgram);
        if(shaderProgram) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearDepth(1.0);
            drawCube(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube1,pedestal, scene,  [10.0, 0.0, 0.0], 1.0,"cube5");
            drawCube(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube1,pedestal, scene,  [-8.0, 0.0, 0.0], 2.0,"cube1");
            drawCube(shaderProgram, [0.0, 1.0, 1.0, 1.0], cube2,pedestal, scene,  [-2.0, 0.0, 0.0], 1.5,"cube2");
            drawCube(shaderProgram, [1.0, 0.0, 1.0, 1.0], cube3,pedestal, scene, [1.0, 0.0, 0.0], 0.75,"cube3");
            drawCube(shaderProgram, [0.0, 1.0, 0.0, 1.0], cube4,pedestal, scene,  [4.0, 0.0, 0.0], 2.0,"cube4");


        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


}




function drawCube(shaderProgram, color, Cube, Pedestal, Scene,  pos, size,type) {
    //позиции вершин
    const vertices = [
        // Front face
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];

    for (let i = 0; i < vertices.length; ++i) {
        vertices[i] = vertices[i] * size;
    }
    pos = [pos[0], pos[1] + size , pos[2]];

    let cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);
    //обращение к точкам вершин по индексу
    const indexBuffer = gl.createBuffer()
    let indices = [
        0,  1,  2,  2,  3,  0,  // front
        4,  5,  6,  6,  7,  4,  // back
        8,  9,  10, 10, 11, 8,  // top
        12, 13, 14, 14, 15, 12, // bottom
        16, 17, 18, 18, 19, 16, // right
        20, 21, 22, 22, 23, 20 // left
    ]
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
//нормали
    const vertexNormals = [
        // Front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    let cubeNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    const vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalAttribute);


    //цвета
    const faceColors = [
        color,
        color,
        color,
        color,
        color,
        color,
    ];
    let colors = [];

    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"),4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));


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
    glm.mat4.translate(projectionMatrix, projectionMatrix, [0.0, 0.0, 0]);//можно было не трогать камеру, но так проще для понимания
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, -2.0, -30.0]);
    //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Scene);
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);//становится локальным центром пьедестала
    //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Pedestal);
    glm.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
//пока необязательно, но в 5 лабе нужно разделение каждого куба отдельно
switch (type) {
        case "cube1":

            glm.mat4.rotateY(worldMatrix, worldMatrix, cube1);
            break;
        case "cube2":
            glm.mat4.rotateY(worldMatrix, worldMatrix, cube2);
            break;
        case "cube3":
            glm.mat4.rotateY(worldMatrix, worldMatrix, cube3);
            break;
        case "cube4":
            glm.mat4.rotateY(worldMatrix, worldMatrix, cube4);
            break;
    }

    gl.uniformMatrix4fv(mProj, false, projectionMatrix);
    gl.uniformMatrix4fv(mWorld, false, worldMatrix);

    //матрица нормалей
    const normalMatrix = glm.mat4.create();
    glm.mat4.invert(normalMatrix, worldMatrix);
    glm.mat4.transpose(normalMatrix, normalMatrix);
    gl.getUniformLocation(shaderProgram, "uNormalMatrix")
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uNormalMatrix"),false,normalMatrix);
//отрисовка кубов
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

    //положение источника света
    const lightPositionValue = [0, -2, distance];
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
    gl.uniform1f(gl.getUniformLocation(shaderProgram,'uLightingModel'), lightingModel);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,'uShadingModel'), shadingModel);



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

    document.getElementById('btn-lighting').onclick = () => {
        let text = document.getElementById('lightingModel')
        lightingModel++
        if (lightingModel == 3) lightingModel = 0
        if (lightingModel == 0) text.textContent = 'Phong Lighting Model'
        else if (lightingModel == 1) text.textContent = 'Lambert Lighting Model'
        else if (lightingModel == 2) text.textContent = 'Blinn-Phong Lighting Model'
    }

    document.getElementById('btn-shading').onclick = () => {
        let text = document.getElementById('shadingModel')

        shadingModel++
        if (shadingModel == 3) shadingModel = 0
        if (shadingModel == 0) text.textContent = 'Phong Shading Model'
        else if (shadingModel == 1) text.textContent = 'Goureau Shading Model'
        else if (shadingModel == 2) text.textContent = 'Toon Shading Model'
    }

    document.getElementById('myRange').oninput = () => {
        ambientCoeff = Number(document.getElementById('myRange').value) ;
    }

    document.getElementById('c1-range').oninput = () => {
        c1 = Number(document.getElementById('c1-range').value);
    }

    document.getElementById('c2-range').oninput = () => {
        c2 = Number(document.getElementById('c2-range').value);
    }
    document.getElementById('distance').oninput = () => {
        distance = Number(document.getElementById('distance').value);
    }


}

