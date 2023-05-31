const PhongVS =
    [
            '#version 300 es',
            'in vec3 aVertexPosition;',
            'in vec3 aVertexNormal;',
            'in vec2 aTextureCoords;',
            'in vec4 aVertexColor;',
            'uniform mat4 mWorld;',
            'uniform mat4 mProj;',
            'uniform mat4 uNormalMatrix;',

            'uniform float uShadingModel;',
            'uniform float uAmbientCoeff;',

            'uniform vec3 uLightPosition;',
            'uniform vec3 uAmbientLightColor;',
            'uniform vec3 uDiffuseLightColor;',
            'uniform vec3 uSpecularLightColor;',
            'uniform float uAmbientIntensity;',
            // ' uniform mat3 uNMatrix;',
            'uniform float uc1;',
            'uniform float uc2;',
            // 'uniform float uLightingModel;',
            //'uniform float uShadingModel;',

            'out vec4 vColor;',
            'out vec3 vPosition;',
            'out vec3 vNormal;',
            'out vec3 vCameraPosition;',
            'out highp vec3 vLightWeighting;',
            'out vec2 vTextureCoords;',
            'const float shininess = 32.0;',
            'void main() {',
            'vec4 vertexPositionEye4 = mWorld * vec4(aVertexPosition, 1.0);',
            'vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;',
            'vec3 normal = normalize(mat3(uNormalMatrix) * aVertexNormal);',
            'vec3 viewVectorEye = -normalize(vertexPositionEye3);',


            'gl_Position = mProj * mWorld * vec4(aVertexPosition, 1.0);',
            'vPosition = vertexPositionEye3;',
            'vColor = aVertexColor;',
            'vNormal = normal;',
            'vCameraPosition = viewVectorEye;',
            'vTextureCoords = aTextureCoords;',
            '}',
    ].join('\n');
export default PhongVS;