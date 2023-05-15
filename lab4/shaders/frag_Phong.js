const PhongFS =
    [
        '#version 300 es',
        '#ifdef GL_ES',
        'precision highp float;',
        '#endif',

        'in highp vec3 vLightDir;',
        'in vec3 vNormal;',
        'in vec4 vColor;',
        'in vec3 vPosition;',
        'uniform vec3 uLightPosition;',
        'uniform float uc1;',
        'uniform float uc2;',
        'uniform float uAmbientIntensity;',
        'uniform vec3 uAmbientLightColor;',
        'uniform vec3 uDiffuseLightColor;',
        'uniform vec3 uSpecularLightColor;',

        'uniform float uShadingModel;',
        'uniform float uAmbientCoeff;',

        'const float shininess = 32.0;',
        'const float edge0 = 0.1;',
        'const float edge1 = 0.3;',
        'precision mediump float;',
        'out vec4 fragColor;',
        'void main(void) {',
        'vec3 lightDirection = normalize(uLightPosition - vPosition);',
            'float d = distance(uLightPosition,vPosition);',
        'float diffuseLightDot = max(dot(vNormal, lightDirection), 0.0);',
        'vec3 reflectionVector = normalize(reflect(-lightDirection, vNormal));',
        'vec3 viewVectorEye = -normalize(vPosition);',
        'float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);',
        'float specularLightParam = pow(specularLightDot, shininess);',
            'float attenuation = 1.0 / (1.0 + uc1 * d + uc2 * d * d);',
        'vec3 vLightWeighting = uAmbientLightColor * uAmbientIntensity + (uDiffuseLightColor * diffuseLightDot + uSpecularLightColor * specularLightParam) * attenuation;;' ,
        'fragColor = vec4(vLightWeighting.rgb * vColor.rgb, vColor.a);',
        '',
        '',
        '',
        '',
        '}',
    ].join('\n');
export default PhongFS;