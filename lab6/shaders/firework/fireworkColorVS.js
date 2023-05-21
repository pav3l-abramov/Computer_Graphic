const fireworkVS =[
    '#version 300 es',
    'in vec3 a_position;',
    'in vec4 aVertexColor;',
    'uniform mat4 uMVMatrix;',
    'uniform mat4 uPMatrix;',
    'out vec4 vColor;',
    'out vec3 pos;',
    '',
    'void main() {',
    'gl_Position = uPMatrix * uMVMatrix * vec4(a_position, 1.0);',
    ' gl_PointSize = 4.0;',
    'vColor = aVertexColor;',
    '}',
    '',
    ''
].join('\n');
export default fireworkVS;