const GoureauFS =[
    '#version 300 es',
    '#ifdef GL_ES',
    'precision highp float;',
    '#endif',
    'uniform float uPropMat;',
    'uniform float uPropDig;',
    'uniform sampler2D uSampler0;',
    'uniform sampler2D uSampler1;',
    'in vec2 vTextureCoords;',
    'in highp vec3 vLightWeighting;',
    'in vec4 vColor;',
    'out vec4 fragColor;',
    'void main() {',
    'vec4 matTex = texture(uSampler0, vTextureCoords);',
    'vec4 digTex = texture(uSampler1, vTextureCoords);',
    '    fragColor = vec4(vLightWeighting *(digTex.rgb * digTex.a+ (1.0-digTex.a)*(matTex.a * matTex.rgb + vColor.rgb * (1.0 - matTex.a))),1);',
    '}',
    ''
].join('\n');
export default GoureauFS;