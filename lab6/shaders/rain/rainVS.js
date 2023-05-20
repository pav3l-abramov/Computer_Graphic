const rainVS =[
    '#version 300 es',
    'in vec3 a_position;',
    'uniform mat4 u_mvMatrix;',
    'uniform mat4 u_pMatrix;',
    'void main() {',
    'gl_Position = u_pMatrix * u_mvMatrix * vec4(a_position, 1.0);',
    'gl_PointSize = 16.0;',
    '}',
    '',
    '',
    ''
].join('\n');
export default rainVS;