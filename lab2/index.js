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

    const pentagonVS =
    [
        'attribute vec2 vertPosition;',
        'varying vec2 fragPosition;',//для полосатого
        'void main() {',
        '  fragPosition = vertPosition;',//для полосатого
        '  gl_Position = vec4(vertPosition,0.0, 1.0);',
        '}'
    ].join('\n');

const pentagonFS =
    [
        'precision mediump float;',
        'void main() {',
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
        '}'
    ].join('\n');

const cubeVS =
[
    'attribute vec3 vertPosition;',
    'uniform mat4 mWorld;',
    'void main() {',
    '  gl_Position = mWorld * vec4(vertPosition, 1.0);',
    '}'
].join('\n');

const cubeFS =
    [
        'precision mediump float;',
        'void main() {',
        '  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);',
        '}'
    ].join('\n');

const stripesFS =
[
    'precision mediump float;',
    'varying vec2 fragPosition;',
    'void main() {',
    '  int x = int(fragPosition.x*30.0+15.0 );',
    '  float isColor = mod(float(x), 2.0);',
    '  if (isColor == 0.0) {',
    '    gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);',
    '  } else {',
    '    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
    '  }',
    '}'
].join('\n');

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


function start() {
    main("pentagon");
    main("cube");
    main("stripes");
    
    
} // function start
function main(id) {
    var canvas = document.getElementById(id);
    //var canvas = document.getElementById(type);
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
        //const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        if (id=="pentagon")
        {
            const shaderProgram = initShaderProgram(gl, pentagonVS, pentagonFS);
            gl.useProgram(shaderProgram);
            drawPentagon(shaderProgram);
        }
        else if (id=="cube")
        {
            const shaderProgram = initShaderProgram(gl, cubeVS, cubeFS);
            gl.useProgram(shaderProgram);
            drawCube(shaderProgram);
        }
        else if (id=="stripes")
        {
            const shaderProgram = initShaderProgram(gl, pentagonVS, stripesFS);
            gl.useProgram(shaderProgram);
            drawStripes(shaderProgram);
        }
    }
    function drawPentagon(shaderProgram) {
        const vertices = [];
        const rad=0.7;
        const phi=-0.315;
        for(let i=0; i<=5; i++) {
            let x = rad * Math.cos(phi + 2 * Math.PI * i/5);
            let y = rad * Math.sin(phi + 2 * Math.PI * i/5);
            vertices.push(x); 
            vertices.push(y); 
        }
        var squareVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
        gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.vertexAttribPointer(
            vertexPositionAttribute, // Attribute location
            2, // число значений для каждой вершины, которые хранятся в буфере
            gl.FLOAT, // тип значений, который хранятся в буфере
            false, // True, если будут нормализованы
            0, // шаг между значениями
            0 // смешение - позиция в буфере, с которой начинается обработка
        );
    
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
    }
    function drawCube(shaderProgram) {
        const vertices = [
            
                -0.5, -0.5, -0.5,  
                -0.5, 0.5, -0.5,   
                0.5, 0.5, -0.5,    
                -0.5, -0.5, -0.5,  
                0.5, 0.5, -0.5,    
                0.5, -0.5, -0.5, 

                -0.5, 0.5, -0.5, 
                -0.5, 0.5, 0.5,    
                0.5, 0.5, 0.5,     
                -0.5, 0.5, -0.5,   
                0.5, 0.5, -0.5,    
                0.5, 0.5, 0.5,     

                -0.5, -0.5, -0.5,  
                0.5, -0.5, 0.5,    
                0.5, -0.5, -0.5,   
                -0.5, -0.5, -0.5,  
                0.5, -0.5, 0.5,    
                -0.5, -0.5, 0.5,  

                -0.5, -0.5, -0.5, 
                -0.5, 0.5, -0.5,   
                -0.5, -0.5, 0.5,   
                -0.5, 0.5, 0.5,    
                -0.5, 0.5, -0.5,   
                -0.5, -0.5, 0.5,

                0.5, 0.5, -0.5,
                0.5, -0.5, 0.5,    
                0.5, -0.5, -0.5,   
                0.5, 0.5, -0.5,    
                0.5, -0.5, 0.5,    
                0.5, 0.5, 0.5,  

                -0.5, 0.5, 0.5, 
                0.5, 0.5, 0.5,     
                -0.5, -0.5, 0.5,   
                0.5, -0.5, 0.5,    
                0.5, 0.5, 0.5,     
                -0.5, -0.5, 0.5
            

        ];

        var squareVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
        gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.vertexAttribPointer(
            vertexPositionAttribute, // Attribute location
            3, // число значений для каждой вершины, которые хранятся в буфере
            gl.FLOAT, // тип значений, который хранятся в буфере
            false, // True, если будут нормализованы
            3*Float32Array.BYTES_PER_ELEMENT, // шаг между значениями
            0 // смешение - позиция в буфере, с которой начинается обработка
        );
    var matWorldUniformLocation=gl.getUniformLocation(shaderProgram,'mWorld');
    

    MWorld = new Float32Array(16);
    glMatrix.mat4.identity(MWorld);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, MWorld);
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    glMatrix.mat4.rotate(MWorld, identityMatrix, 0.5, [1, 1, 1]);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, MWorld);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}



    
    function drawStripes(shaderProgram) {
        
        const vertices = [
            0.5, 0.5, 
            -0.5, 0.5, 
            0.5, -0.5, 
            -0.5, -0.5
            ];
  
        
            var squareVerticesBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
            var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
            gl.enableVertexAttribArray(vertexPositionAttribute);
            gl.vertexAttribPointer(
                vertexPositionAttribute, // Attribute location
                2, // число значений для каждой вершины, которые хранятся в буфере
                gl.FLOAT, // тип значений, который хранятся в буфере
                false, // True, если будут нормализованы
                0, // шаг между значениями
                0 // смешение - позиция в буфере, с которой начинается обработка
            );
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
