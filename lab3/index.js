var gl; // глобальная переменная для контекста WebGL

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





const cubeVS =
[
    '#version 300 es',
    'in vec3 aVertexPosition;',
    'uniform mat4 mWorld;',
    'uniform mat4 mProj;',
    'void main() {',
    '    gl_Position = mProj  * mWorld * vec4(aVertexPosition, 1.0);',
    '}',
].join('\n');

const cubeFS =
[
    '#version 300 es',
    'precision mediump float;',
    'uniform vec4 fColor;',
    'out vec4 fragColor;',
    'void main(void) {',
    '    fragColor = fColor;',
    '}',
].join('\n');



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
function main(id) {
    var canvas = document.getElementById(id);
    gl = initWebGL(canvas); // инициализация контекста GL – сами пишем
    // продолжать только если WebGL доступен и работает
    if (gl) { // продолжать только если WebGL доступен и работает
        // Устанавливаем размер вьюпорта
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // установить в качестве цвета очистки буфера цвета черный, полная непрозрачность//немного другой цвет сделал
        gl.clearColor(0.3, 0.2, 0.5, 1.0);
        // включает использование буфера глубины
        gl.enable(gl.DEPTH_TEST);
        // определяет работу буфера глубины: более ближние объекты перекрывают дальние
        gl.depthFunc(gl.LEQUAL);
        // очистить буфер цвета и буфер глубины
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        }
            const shaderProgram = initShaderProgram(gl, cubeVS, cubeFS);
            gl.useProgram(shaderProgram);





            window.addEventListener("keydown", checkKeyPressed);

            function render() {
                if(shaderProgram) {
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.clearDepth(1.0);
        
                     drawCube(shaderProgram, [1.0, 1.0, 0.0, 1.0], cube1,pedestal, scene,  [-8.0, 0.0, 0.0], 1.0,'1');
                    drawCube(shaderProgram, [0.0, 1.0, 1.0, 1.0], cube2,pedestal, scene,  [0.0, 0.0, 0.0], 0.5,'2');
                     drawCube(shaderProgram, [1.0, 0.0, 1.0, 1.0], cube3,pedestal, scene, [4.0, 0.0, 0.0], 0.75, '3');
                     drawCube(shaderProgram, [0.0, 1.0, 0.0, 1.0], cube4,pedestal, scene,  [8.0, 0.0, 0.0], 2.0, '4');
                }
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        
    }
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

    
    function drawCube(shaderProgram, color, Cube, Pedestal, Scene,  pos, size, cube_type) {
        const vertices = [
            -1.0, -1.0, 1.0, 
            1.0, -1.0, 1.0, 
            1.0, 1.0, 1.0, 
            -1.0, 1.0, 1.0,


            -1.0, -1.0, -1.0, 
            -1.0, 1.0, -1.0, 
            1.0, 1.0, -1.0, 
            1.0, -1.0, -1.0, 

            -1.0, 1.0, -1.0, 
            -1.0, 1.0, 1.0, 
            1.0, 1.0, 1.0,
             1.0, 1.0, -1.0, 

            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0, 
             1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0, 

            1.0, -1.0, -1.0, 
            1.0, 1.0, -1.0, 
            1.0, 1.0, 1.0,
             1.0, -1.0, 1.0,

            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ];
    
        for (i = 0; i < vertices.length; ++i) {
            vertices[i] = vertices[i] * size;
        }
        pos = [pos[0], pos[1] + size , pos[2]];
    
        let cubeVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        const mProj = gl.getUniformLocation(shaderProgram, "mProj");
        const mWorld = gl.getUniformLocation(shaderProgram, "mWorld");
        const fColor = gl.getUniformLocation(shaderProgram, "fColor");
    
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPositionAttribute);
    
        const fieldOfView = (70 * Math.PI) / 180; 
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const Near = 0.1;
        const Far = 500.0;
    
        const projectionMatrix = glMatrix.mat4.create();
        const worldMatrix = glMatrix.mat4.create();
    
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
                 glMatrix.mat4.rotate(worldMatrix, worldMatrix, Cube, [0, 1, 0]);

        gl.uniform4f(fColor, color[0], color[1], color[2], color[3]);
        gl.uniformMatrix4fv(mProj, false, projectionMatrix);
        gl.uniformMatrix4fv(mWorld, false, worldMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 36);
    }