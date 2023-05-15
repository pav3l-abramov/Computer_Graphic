const GoureauFS =[
    '#version 300 es',
    '#ifdef GL_ES',
    'precision highp float;',
    '#endif',
    'in highp vec3 vLightWeighting;',
    'in vec4 vColor;',
    'out vec4 fragColor;',
    'void main() {',
    '    fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);',
    '}',
    ''
].join('\n');
export default GoureauFS;