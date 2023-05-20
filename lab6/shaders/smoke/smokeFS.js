const smokeFS =[
    '#version 300 es',
    'precision mediump float;',
    'uniform sampler2D u_texture;',
    'out vec4 fragColor;',
    'void main() {',
    'fragColor = texture(u_texture, gl_PointCoord)*0.2;',
    '}',
    '',
    '',
    '',
    ''
].join('\n');
export default smokeFS;