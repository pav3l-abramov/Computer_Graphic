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

    const squareVS =
    [
        'attribute vec2 vertPosition;',
        'void main() {',
        '  gl_Position = vec4(vertPosition,0.0, 1.0);',
        '}'
    ].join('\n');

const squareFS =
    [
        'precision mediump float;',
        'varying vec3 fragColor;',
        'void main() {',
        '  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);',
        '}'
    ].join('\n');

const triangleVS =
    [
        'attribute vec2 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        'void main() {',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition,0.0,  1.0);',
        '}'
    ].join('\n');

const triangleFS =
    [
        'precision mediump float;',
        'varying vec3 fragColor;',
        'void main() {',
        '  gl_FragColor = vec4(fragColor, 1.0);',
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
    main("rectangle");
    main("triangle");
    
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

        if (id=="rectangle")
        {
            const shaderProgram = initShaderProgram(gl, squareVS, squareFS);
            gl.useProgram(shaderProgram);
            drawRectangle(shaderProgram);
        }
        else if (id=="triangle")
        {
            const shaderProgram = initShaderProgram(gl, triangleVS, triangleFS);
            gl.useProgram(shaderProgram);
            drawTriangle(shaderProgram);
        }
    }
    function drawRectangle(shaderProgram) {
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
    function drawTriangle(shaderProgram) {
        
        const vertices = [//x,y,    r,g,b
            0.0, 1.0,   0.0, 0.0, 1.0,
            -1.0, -1.0, 0.0, 1.0, 0.0,
            1.0, -1.0,  1.0, 0.0, 0.0
        ];
  
        
        var triangleVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertPosition');
        var colorPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertColor');

        gl.vertexAttribPointer(
            vertexPositionAttribute, // Attribute location
            2, // число значений для каждой вершины, которые хранятся в буфере
            gl.FLOAT, // тип значений, который хранятся в буфере
            false, // True, если будут нормализованы
            5*Float32Array.BYTES_PER_ELEMENT, // шаг между значениями
            0 // смешение - позиция в буфере, с которой начинается обработка
        );
        gl.vertexAttribPointer(
            colorPositionAttribute,
            3,
            gl.FLOAT,
            false,
            5*Float32Array.BYTES_PER_ELEMENT,
            2*Float32Array.BYTES_PER_ELEMENT//первые 2 элемента под координаты
        );
        gl.enableVertexAttribArray(vertexPositionAttribute);
        gl.enableVertexAttribArray(colorPositionAttribute);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    

