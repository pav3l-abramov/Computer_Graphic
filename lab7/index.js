import PhongFS from "./shaders/frag_Phong"
import PhongVS from "./shaders/vert_Phong"
import {OBJ} from "webgl-obj-loader"
import {sphere} from "./textures/sphere_obj";
import {stolb} from "./textures/stolb_obj";
import {lamp} from "./textures/lamp_obj";
import orangeColor from "./textures/orangeColor.png";
import brownColor from "./textures/orangeColor.jpg";
import parkJpg from "./textures/Park.jpg";
import stoun from "./textures/stoun.jpg";
import orange_Normal from "./textures/orange_normal3.jpg";
import * as glm from "gl-matrix";
import {vec3} from "glsl-shader-loader/src/utils/constructor-mask";


let gl;
let ambientCoeff = 0.7, c1 = 0.001, c2 = 0.0001, distance=30;
let propDig = 1.0, propMat = 1.0, orangeTexture,parkTexture,lampTexture,stolbTexture, orangeNormal;
let mesh = new OBJ.Mesh(sphere);
let mesh2 = new OBJ.Mesh(stolb);
let mesh3 = new OBJ.Mesh(lamp);
const carPosit= glm.vec3.fromValues(0.0,0.0,0.0);
let stolbPos1=[7.0, 0.0, -20];
let stolbPos2=[-7.0, 0.0, -20];
let lampPos1=[3.0, 2.0, -20];
let lampPos2=[-3.0, 2.0, -20];
let lightCarDirection=[0.0,0.0,0.0];



function main(id) {
    var canvas = document.getElementById(id);
    gl = initWebGL(canvas); // инициализация контекста GL – сами пишем
    // продолжать только если WebGL доступен и работает
    if (gl) { // продолжать только если WebGL доступен и работает
        // Устанавливаем размер вьюпорта
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность//немного другой цвет сделал
        gl.clearColor(0.05, 0.05, 0.2, 1.0);
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
    OBJ.initMeshBuffers(gl, mesh2);
    OBJ.initMeshBuffers(gl, mesh3);



    window.addEventListener("keydown", checkKeyPressed);
    orangeTexture = gl.createTexture();
    orangeNormal = gl.createTexture();
    parkTexture = gl.createTexture();
    lampTexture = gl.createTexture();
    stolbTexture = gl.createTexture();
    setTexture([orangeColor,orange_Normal,brownColor,parkJpg,stoun],[orangeTexture,orangeNormal,lampTexture,parkTexture,stolbTexture]);
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

            //положение источника света
            const lightPositionValue = [0, 20, distance];
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


            drawCube(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube1,pedestal, scene,  [0.0, 0.0, 0.0], 0.0,"orange");
            drawStolb(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube4,pedestal, scene,  [0.0, 0.0, 0.0], 0.0,"stolb1");
            drawStolb(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube4,pedestal, scene,  [0.0, 0.0, 0.0], 0.0,"stolb2");
            drawLamp(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube4,pedestal, scene,  [0.0, 0.0, 0.0], 0.0,"lamp1");
            drawLamp(shaderProgram, [1.0, 0.0, 0.0, 1.0], cube4,pedestal, scene,  [0.0, 0.0, 0.0], 0.0,"lamp2");
            drawFlat(shaderProgram, [1.0, 1.0, 0.0, 1.0], cube4,pedestal, scene,  [0.0, 0.0, 0.0], 28.0,"cube1");
           // drawFlat(shaderProgram,20,[0.0, 0.0, 0.0])

        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


}




function drawCube(shaderProgram, color, Cube, Pedestal, Scene,  pos, size,type) {



//считывание с obj объекта, тут машина
    const positionBuffer = mesh.vertexBuffer;

    const textureCoordBuffer = mesh.textureBuffer;

    const indexBuffer = mesh.indexBuffer;

    const normalBuffer = mesh.normalBuffer;


//все, что нужно для отрисовки машины
    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);

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
    glm.mat4.translate(projectionMatrix, projectionMatrix, [0.0, -2.0, -20]);//можно было не трогать камеру, но так проще для понимания

    glm.mat4.translate(worldMatrix, worldMatrix, carPosit);
    //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
    //glm.mat4.translate(worldMatrix, worldMatrix, carPosit);//становится локальным центром пьедестала
    // //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
     //glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
    // glm.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
    // glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
/*
 glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, Near, Far);
        // перемещаем камеру на 4 вниз и 30 от плоскости ху, кубы в центре координат
        glMatrix.mat4.translate(projectionMatrix, projectionMatrix, [0.0, -4.0, -30]);//можно было не трогать камеру, но так проще для понимания
        glMatrix.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);
        //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
                glMatrix.mat4.rotateY(worldMatrix, worldMatrix, Scene);
                  glMatrix.mat4.translate(worldMatrix, worldMatrix, [12.0, 0.0, 0.0]);//становится локальным центром пьедестала
                 //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
                 glMatrix.mat4.rotateY(worldMatrix, worldMatrix, Pedestal);
                 glMatrix.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
                 glMatrix.mat4.rotateY(worldMatrix, worldMatrix, Cube);
 */
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D, orangeTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler0"), 0);



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

//отрисовка машины
    gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
function drawLamp(shaderProgram, color, Cube, Pedestal, Scene,  pos, size,type) {



//считывание с obj объекта, тут машина
    const positionBuffer = mesh3.vertexBuffer;

    const textureCoordBuffer = mesh3.textureBuffer;

    const indexBuffer = mesh3.indexBuffer;

    const normalBuffer = mesh3.normalBuffer;


//все, что нужно для отрисовки машины
    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);

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
    glm.mat4.translate(projectionMatrix, projectionMatrix, [0.0, -2.0, -20.0]);
    switch (type){
        case "lamp1":glm.mat4.translate(worldMatrix, worldMatrix, lampPos1);break;
        case "lamp2":glm.mat4.translate(worldMatrix, worldMatrix, lampPos2);break;

    }


    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);
    //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);//становится локальным центром пьедестала
    // //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
    // glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
    // glm.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
    // glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);

    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D, lampTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler0"), 0);


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

//отрисовка машины
    gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
function drawStolb(shaderProgram, color, Cube, Pedestal, Scene,  pos, size,type) {



//считывание с obj объекта, тут машина
    const positionBuffer = mesh2.vertexBuffer;

    const textureCoordBuffer = mesh2.textureBuffer;

    const indexBuffer = mesh2.indexBuffer;

    const normalBuffer = mesh2.normalBuffer;


//все, что нужно для отрисовки машины
    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);

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
    glm.mat4.translate(projectionMatrix, projectionMatrix, [0.0, -2.0, -20.0]);
    switch (type){

        case "stolb1":glm.mat4.translate(worldMatrix, worldMatrix, stolbPos1);break;//можно было не трогать камеру, но так проще для понимания
        case"stolb2":glm.mat4.translate(worldMatrix, worldMatrix, stolbPos2);break;//можно было не трогать камеру, но так проще для понимания
    }
    //glm.mat4.translate(projectionMatrix, projectionMatrix, [10.0, -2.0, -40]);//можно было не трогать камеру, но так проще для понимания
    //glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);
    //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);//становится локальным центром пьедестала
    // //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
    // glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);
    // glm.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
    // glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);

    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D, stolbTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler0"), 0);


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

//отрисовка машины
    gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
function drawFlat(shaderProgram, color, Cube, Pedestal, Scene,  pos, size,type) {    //позиции вершин
    const vertices = [
        // Front face
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

        // Back face
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0,

        // Top face
        -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];

    for (let i = 0; i < vertices.length; ++i) {
        vertices[i] = vertices[i] * size;
    }
    pos = [pos[0], pos[1] - size , pos[2]];

    let cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);
    //обращение к точкам вершин по индексу
    const indexBuffer = gl.createBuffer()
    let indices = [
        //0,  1,  2,  2,  3,  0,  // front
        //4,  5,  6,  6,  7,  4,  // back
        8,  9,  10, 10, 11, 8,  // top
        //12, 13, 14, 14, 15, 12, // bottom
        //16, 17, 18, 18, 19, 16, // right
        //20, 21, 22, 22, 23, 20 // left
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
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, -2.0, -40.0]);
    //кубы еще не разделены, ставит центр сцены в [12.0, 0.0, 0.0], а крутит вокруг [0.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Scene);
    glm.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);//становится локальным центром пьедестала
    //кубы уже  разделены (благодаря pos), ставит центр каждого отдельного куба pos относительно [12.0, 0.0, 0.0], а крутит вокруг [12.0, 0.0, 0.0]
    glm.mat4.rotateY(worldMatrix, worldMatrix, Pedestal);
    glm.mat4.translate(worldMatrix, worldMatrix, pos);//локальный центр каждого куба, т.к. больше нет translate, то у него больше нет точки, относительно которой он будет вращать локальный центр, поэтому каждый куб имеет свой локальный центр, и каждый центр прописан в pos
    glm.mat4.rotateY(worldMatrix, worldMatrix, Cube);

            //текстуры
            gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D, parkTexture);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler0"), 0);

    //теккстуры
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropMat"), propMat);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropDig"), propDig);
    const textCoordsBuffer = gl.createBuffer();
    const textureCoordinates = [];
    for (let i=0; i<6; i++) { textureCoordinates.push(0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0 ); }

    gl.bindBuffer(gl.ARRAY_BUFFER, textCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    const aTextCoords = gl.getAttribLocation(shaderProgram,"aTextureCoords");
    gl.enableVertexAttribArray(aTextCoords);
    gl.vertexAttribPointer(aTextCoords, 2, gl.FLOAT, false, 0, 0);

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
var cube1= -1.0;
var cube2= 0.0;
var cube3= 0.0;
var cube4= 0.0;
var pedestal= 0.0;
var scene= 0.0;
var cube1Position =0.0;

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
                cube1 += 0.1;
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
                cube1 -= 0.1;
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
    if (e.key == "ArrowDown") {
        switch (elment) {
            case "1":
                cube1Position = 0.5;
                const vector = glm.vec3.fromValues(-Math.sin(cube1),0.0,-Math.cos(cube1));
                const vectorTest=[carPosit[0],carPosit[1],carPosit[2]];
                //glm.vec3.scaleAndAdd(vectorTest, vectorTest, vector, cube1Position);
                const n=2;
                const m=40;
                if (((((carPosit[0]+vector[0]>stolbPos1[0]-n)&&(carPosit[0]+vector[0]<stolbPos1[0]+n))||(((carPosit[0]+vector[0]>stolbPos2[0]-n)&&(carPosit[0]+vector[0]<stolbPos2[0]+n))))&&((carPosit[2]+vector[2]>stolbPos1[2]-n)&&(carPosit[2]+vector[2]<stolbPos1[2]+n)))||carPosit[2]+vector[2]>8||carPosit[2]+vector[2]<-m) cube1Position=0;
                else glm.vec3.scaleAndAdd(carPosit, carPosit, vector, cube1Position);
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
    if (e.key == "ArrowUp") {
        switch (elment) {
            case "1":
                cube1Position = 0.5;
                const vector = glm.vec3.fromValues(Math.sin(cube1),0.0,Math.cos(cube1));
                const vectorTest=[carPosit[0],carPosit[1],carPosit[2]];
                //glm.vec3.scaleAndAdd(vectorTest, vectorTest, vector, cube1Position);
                const n=2;
                const m=40;
                 if (((((carPosit[0]+vector[0]>stolbPos1[0]-n)&&(carPosit[0]+vector[0]<stolbPos1[0]+n))||(((carPosit[0]+vector[0]>stolbPos2[0]-n)&&(carPosit[0]+vector[0]<stolbPos2[0]+n))))&&((carPosit[2]+vector[2]>stolbPos1[2]-n)&&(carPosit[2]+vector[2]<stolbPos1[2]+n)))||carPosit[2]+vector[2]>8||carPosit[2]+vector[2]<-m) cube1Position=0;
                 else glm.vec3.scaleAndAdd(carPosit, carPosit, vector, cube1Position);
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

