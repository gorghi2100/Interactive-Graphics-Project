const canvas = document.getElementById("webgl-canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL is not supported");
}

// Vertex shader
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;  // Add normal attribute
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;  // Matrix to transform normals

varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Transform the normal to eye space
    highp vec3 transformedNormal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));

    // Lighting calculations (Blinn-Phong)
    highp vec3 ambientLight = vec3(0.6, 0.6, 0.6);
    highp vec3 directionalLightColor = vec3(0.8, 0.8, 0.8);
    highp vec3 directionalVector = normalize(vec3(-10, 5, 5));

    highp float directional = max(dot(transformedNormal, directionalVector), 0.0);

    vLighting = ambientLight + (directionalLightColor * directional);
}
`;

// Fragment shader
const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
        
        if(texelColor.a < 0.1)
            discard;

        // Apply lighting to the texture color
        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
`;

// Shader compilation
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

// Shader linking
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

// Attribute and uniform references
const programInfo = {
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),  // Add normal attribute
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),  // Normal matrix uniform
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
};

// Function to create objects
function createCube(width, height, depth) {
    const positions = [
        // Front face
        -width, -height,  depth,
         width, -height,  depth,
         width,  height,  depth,
        -width,  height,  depth,
        // Back face 
        -width, -height, -depth,
        -width,  height, -depth,
         width,  height, -depth,
         width, -height, -depth,
        // Top face
        -width,  height, -depth,
        -width,  height,  depth,
         width,  height,  depth,
         width,  height, -depth,
        // Bottom face
        -width, -height, -depth,
         width, -height, -depth,
         width, -height,  depth,
        -width, -height,  depth,
        // Right face
        width, -height, -depth,
        width,  height, -depth,
        width,  height,  depth,
        width, -height,  depth,
        // Left face
        -width, -height, -depth,
        -width, -height,  depth,
        -width,  height,  depth,
        -width,  height, -depth,
    ];

    const textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        // Top face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Bottom face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Right face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];

    let indices;

    if(Math.abs(velocity[0]) < vBounce && Math.abs(velocity[2]) < vBounce)
        indices = [
        0,  1,  2,  0,  2,  3,   // front
        4,  5,  6,  4,  6,  7,   // back
        8,  9, 10,  8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom 
        16, 17, 18, 16, 18, 19,   // right 
        20, 21, 22, 20, 22, 23    // left 
        ];
    else
        indices = [
        0,  1,  2,  0,  2,  3,   // front
        4,  5,  6,  4,  6,  7,   // back
        12, 13, 14, 12, 14, 15,   // bottom 
        16, 17, 18, 16, 18, 19,   // right 
        20, 21, 22, 20, 22, 23    // left 
        ];

    const normals = [
        // Front face
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        // Back face
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        // Top face
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        // Bottom face
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        // Right face
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        // Left face
       -1.0,  0.0,  0.0,
       -1.0,  0.0,  0.0,
       -1.0,  0.0,  0.0,
       -1.0,  0.0,  0.0
    ];

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normalBuffer: normalBuffer, 
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length,
    };
}

function createIrregularPolygon3D() {
    const vertices = [];
    const textureCoords = [];
    const indices = [];

    // Genera casualmente i vertici per un poligono irregolare 3D
    for (let i = 0; i < 8; i++) {
        const x = (Math.random() - 0.5) * 2;  // Maggiore variazione su X
        const y = Math.random();  // Maggiore variazione su Y
        const z = (Math.random() - 0.5) * 2;  // Maggiore variazione su Z per dare profondità
        vertices.push(x, y, z);

        // Coordinate texture normalizzate
        const u = (x + 1) / 2; // Normalizziamo x tra 0 e 1
        const v = (y + 1) / 2; // Normalizziamo y tra 0 e 1
        textureCoords.push(u, v);
    }

    // Crea indici per formare i triangoli (poligono irregolare)
    indices.push(
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        0, 3, 7, 0, 7, 4, // Left face
        1, 5, 6, 1, 6, 2, // Right face
        0, 1, 5, 0, 5, 4, // Bottom face
        3, 2, 6, 3, 6, 7  // Top face
    );

    // Funzione per calcolare la normale di un triangolo dato tre vertici
    function calculateNormal(v0, v1, v2) {
        const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
        const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];
        return [
            uy * vz - uz * vy,
            uz * vx - ux * vz,
            ux * vy - uy * vx
        ];
    }

    // Calcola le normali dinamicamente in base agli indici
    const normals = [];
    for (let i = 0; i < indices.length; i += 3) {
        const v0 = vertices.slice(indices[i] * 3, indices[i] * 3 + 3);
        const v1 = vertices.slice(indices[i + 1] * 3, indices[i + 1] * 3 + 3);
        const v2 = vertices.slice(indices[i + 2] * 3, indices[i + 2] * 3 + 3);

        const normal = calculateNormal(v0, v1, v2);
        normals.push(...normal, ...normal, ...normal);  // Stesso normale per i tre vertici del triangolo
    }

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normalBuffer: normalBuffer, 
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length,
    };
}

function createPlane(width, depth) {
    const positions = [
        -width / 2, 0, depth / 2,
        width / 2, 0, depth / 2,
        width / 2, 0, -depth / 2,
        -width / 2, 0, -depth / 2,
    ];

    const textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];

    const indices = [0, 1, 2, 0, 2, 3];

    const normals = [
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0
    ];

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normalBuffer: normalBuffer, 
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length,
    };
}

function createBackgroundPlane(width, height) {
    const positions = [
        -width / 2, -height / 2, 0.0,
         width / 2, -height / 2, 0.0,
         width / 2,  height / 2, 0.0,
        -width / 2,  height / 2, 0.0,
    ];

    const textureCoords = [
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
    ];

    const indices = [
        0, 1, 2,  0, 2, 3,
    ];

    const normals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];
    
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normalBuffer: normalBuffer, 
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

function createSphere(radius, latitudeBands, longitudeBands) {
    const positions = [];
    const indices = [];
    const textureCoords = [];
    const normals = [];  // Aggiungiamo il buffer per le normali

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            const u = 1 - (longNumber / longitudeBands);
            const v = 1 - (latNumber / latitudeBands);

            // Posizione del vertice sulla sfera
            positions.push(radius * x, radius * y, radius * z);
            
            // Normale corrispondente al vertice (direzione del vettore)
            normals.push(x, y, z);  // La normale è il vettore dalla sfera all'origine, normalizzato

            // Coordinate della texture
            textureCoords.push(u, v);
        }
    }

    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);  // Normali per il buffer

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normalBuffer: normalBuffer, 
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length,
    };
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Temporary placeholder
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // Blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    // Io mage loading
    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
    };
    image.src = url;

    return texture;
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min + 1) + min;
}

// Configure the projection matrix
function initProjectionMatrix(gl) {
    const fieldOfView = 45;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView * Math.PI / 180, aspect, zNear, zFar);

    return projectionMatrix;
}

function calculateViewMatrix() {
    const viewMatrix = mat4.create();

    const cameraDistance = 30.0;

    const cameraPosition = [
        Math.sin(yaw) * Math.cos(pitch) * cameraDistance,
        Math.sin(pitch) * cameraDistance,
        Math.cos(yaw) * Math.cos(pitch) * cameraDistance
    ];

    const center = [floorPositionX, floorPositionY, floorPositionZ];

    const up = [0, 1, 0];

    mat4.lookAt(viewMatrix, cameraPosition, center, up);

    return viewMatrix;
}

// Scene update functions
function updateBallPosition() {
    // Ball physics
    if (ballPosition[1] != floorPositionY + r) {
        velocity[1] += gravity;
    }
    // Ball translation
    ballPosition[0] += velocity[0];
    ballPosition[1] += velocity[1];
    ballPosition[2] += velocity[2];
    // Ball rotation 
    ballRotationX += velocity[2] / r;
    ballRotationZ += -velocity[0] / r;

    if (Math.abs(velocity[0]) < 0.001) {
        velocity[0] = 0;
    }
    if (Math.abs(velocity[2]) < 0.001) {
        velocity[2] = 0;
    }
    if (ballPosition[1] + velocity[1] <= floorPositionY + r) {
        handleBallBounceOnFloor(floorPositionY); 
    }
}

function handleBallBounceOnFloor() {
    if (ballPosition[0] >= floorPositionX - floorWidth / 2 &&
        ballPosition[0] <= floorPositionX + floorWidth / 2 &&
        ballPosition[2] >= floorPositionZ - floorDepth / 2 &&
        ballPosition[2] <= floorPositionZ + floorDepth / 2) {
            
            velocity[0] *= frictionFactor;
            velocity[1] = -velocity[1] * dampingFactor;
            velocity[2] *= frictionFactor;
            
            if(Math.abs(velocity[1] < 0.01)){
                ballPosition[1] = floorPositionY + r;
                ballRotationX += velocity[2] / r; 
                ballRotationZ += -velocity[0] / r;
                }
    } else {
            ballPosition[1] += velocity[1] * gravity;
    }
}

function calculateImpactPoint(ballPosition, velocity, wallPositionX) {
    const [x0, y0, z0] = ballPosition; 
    const [vx, vy, vz] = velocity;    

    const gravity = 0.002; 

    if (vx === 0) {
        return null;
    }

    const tImpactX = ((wallPositionX - wallWidth) - x0) / vx;

    const discriminant = vy * vy + 2 * gravity * y0;
    if (discriminant < 0) {
        console.warn("No valid impact due to negative discriminant.");
        return null;
    }
    const yImpact = y0 + vy * tImpactX - 0.5 * gravity * tImpactX * tImpactX;

    let xImpact, zImpact;

    if(x0 < wallPositionX - wallWidth)
        xImpact = wallPositionX - wallWidth;
    else    
        xImpact = wallPositionX + wallWidth;

    if(z0 < wallPositionZ - wallDepth)
        zImpact = wallPositionZ - wallDepth;
    else
        zImpact = wallPositionZ + wallDepth;

    return { x: xImpact, y: yImpact, z: zImpact};
}

function handleWallCollision() {
    if (impactPoint && 
        ballPosition[0] >= wallPositionX - wallWidth - r &&
        ballPosition[0] <= wallPositionX + wallWidth + r &&
        impactPoint.y < wallPositionY + wallHeight + r &&
        ballPosition[1] >= wallHeight - wallPositionY + r &&
        ballPosition[2] + r >= wallPositionZ - wallDepth &&
        ballPosition[2] - r <= wallPositionZ + wallDepth &&
        !wallBroken
    ) {
        if(Math.abs(velocity[0]) <= vBounce)
            velocity[0] = -velocity[0] * dampingFactor;
        if(Math.abs(velocity[2]) <= vBounce)
            velocity[2] = -velocity[2] * dampingFactor;
        if(Math.abs(velocity[0]) >= vBreak){
            console.log("Collision detected! Breaking wall...");
            breakWall();
        }
        if(Math.abs(velocity[2]) >= vBreak){
            console.log("Collision detected! Breaking wall...");
            breakWall();
        }
        if(Math.abs(velocity[0]) > vBounce && Math.abs(velocity[0]) < vBreak){
            console.log("Collision detected! Breaking wall...");
            breakWall();
            velocity[0] = -velocity[0] * dampingFactor/2;
        }
        if(Math.abs(velocity[2]) > vBounce && Math.abs(velocity[2]) < vBreak){
            console.log("Collision detected! Breaking wall...");
            breakWall();
            velocity[2] = -velocity[2] * dampingFactor/2;
        }
    }
}

function breakWall() {
    wallBroken = true; 
    if (impactPoint) {
        wallFragments = createWallFragments(impactPoint, velocity); 
        console.log("Wall fragments created:", wallFragments);
    }
}

function createWallFragments(impactPoint, velocity) {
    console.log("Creating fragments at impact point:", impactPoint);
    const fragmentCount = 30;
    const fragments = [];
    const minHeight = 0.01;
    const maxHeight = 0.15;
    let remainingHeight = wallHeight + wallPositionY;

    let currentY = impactPoint.y;

    for (let i = 0; i < fragmentCount; i++) {
        const fragmentHeight = Math.max(minHeight, maxHeight * Math.random());
        remainingHeight -= fragmentHeight;

        if (currentY > wallPositionY + wallHeight + r) {
            break;
        }

        let fragment;
        const fragmentType = Math.random();

        if (fragmentType < 0.33) {
            fragment = createCube(wallWidth, fragmentHeight, wallDepth /4 * Math.random()); 
        }
        else if (fragmentType < 0.66) {
            fragment = createIrregularPolygon3D();
        }
        else {
            fragment = createCube(wallWidth, fragmentHeight, wallDepth/4); 
        }

        console.log("Created fragment", i, fragment);

        const speedFactor = 0.65; 

        let initialVelocityX;
        const initialVelocityY = velocity[1] * speedFactor + (Math.random() - 0.5) * 0.2;
        const initialVelocityZ = velocity[2] * speedFactor + (Math.random() - 0.5) * 0.2;
        
        if (Math.abs(velocity[0] < vBreak && Math.abs(velocity[0]) >= vBounce)) { 
            if (velocity[0] < 0) {
                initialVelocityX = velocity[0] * speedFactor + (Math.random() - 0.5) * 0.2;
            } else {
                initialVelocityX = velocity[0] * speedFactor + (Math.random() - 0.5) * 0.2;
            }
        } else {  
            if (velocity[0] < 0) {
                initialVelocityX = -velocity[0] * speedFactor + (Math.random() - 0.5) * 0.2;
            } else {
                initialVelocityX = velocity[0] * speedFactor + (Math.random() - 0.5) * 0.2;
            }
        }
        
        fragments.push({
            fragment,
            position: [
                impactPoint.x,
                getRandomInRange(currentY, wallHeight + wallPositionY), 
                getRandomInRange(-wallDepth, wallDepth)
            ],
            velocity: [
                initialVelocityX,
                initialVelocityY,
                initialVelocityZ
            ],
            gravity: gravity,
            fragmentHeight: fragmentHeight,
        });

        currentY += fragmentHeight;
    }
    console.log("Total fragments created:", fragments.length);
    return fragments;
}

function updateFragmentMovement(fragments) {
    fragments.forEach(fragmentData => {
        // Fragments physics
        fragmentData.velocity[0] *= frictionFactor;
        fragmentData.velocity[1] += fragmentData.gravity;
        fragmentData.velocity[2] *= frictionFactor;
        fragmentData.position[0] += fragmentData.velocity[0];
        fragmentData.position[1] += fragmentData.velocity[1];
        fragmentData.position[2] += fragmentData.velocity[2];

        // Bounce and height limit
        if (fragmentData.position[1] - fragmentData.fragmentHeight < floorPositionY && 
            fragmentData.position[0] >= floorPositionX - floorWidth / 2 &&
            fragmentData.position[0] <= floorPositionX + floorWidth / 2 &&
            fragmentData.position[2] >= floorPositionZ - floorDepth / 2 &&
            fragmentData.position[2] <= floorPositionZ + floorDepth / 2) {
                fragmentData.velocity[1] = -fragmentData.velocity[1] * dampingFactorFragments;
                fragmentData.position[1] = floorPositionY + fragmentData.fragmentHeight + 0.01;
        }
    });
}

// Rendering functions
function renderBackground(gl, backgroundPlane, backgroundTexture, programInfo) {
    const bgModelViewMatrix = mat4.create();
    mat4.translate(bgModelViewMatrix, bgModelViewMatrix, [0.0, 0.0, -100.0]);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, bgModelViewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPlane.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPlane.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    // Computation of normal matrix 
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, bgModelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    // Binding of normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPlane.normalBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, backgroundPlane.indices);

    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.drawElements(gl.TRIANGLES, backgroundPlane.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function renderFloor(gl, floor, viewMatrix) {
    const floorModelViewMatrix = mat4.clone(viewMatrix);
    mat4.translate(floorModelViewMatrix, floorModelViewMatrix, [floorPositionX, floorPositionY, floorPositionZ]);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, floorModelViewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    // Computation of normal matrix
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, floorModelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    // Binding of normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, floor.normalBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indices);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, floor.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function renderWall(gl, wall, viewMatrix) {
    if (!wallBroken) {
        const wallModelViewMatrix = mat4.clone(viewMatrix);
        mat4.translate(wallModelViewMatrix, wallModelViewMatrix, [wallPositionX, wallPositionY + 0.01, wallPositionZ]);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, wallModelViewMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, wall.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, wall.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

        // Computation of normal matrix
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, wallModelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        // Binding of normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, wall.normalBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wall.indices);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, wallTexture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        gl.drawElements(gl.TRIANGLES, wall.vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
        const wallBrokenModelViewMatrix = mat4.clone(viewMatrix); 
        mat4.translate(wallBrokenModelViewMatrix, wallBrokenModelViewMatrix, [wallPositionX, Math.abs((impactPoint.y - r) / 2) + 0.01, wallPositionZ]);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, wallBrokenModelViewMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, brokenWall.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, brokenWall.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

        // Computation of normal matrix
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, wallBrokenModelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        // Binding of normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, brokenWall.normalBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, brokenWall.indices);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, brokenWallTexture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        gl.drawElements(gl.TRIANGLES, brokenWall.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}

function renderWallFragments(gl, viewMatrix, programInfo) {
    for (let i = 0; i < wallFragments.length; i++) {
        const fragment = wallFragments[i];
        const fragmentModelViewMatrix = mat4.clone(viewMatrix);
        mat4.translate(fragmentModelViewMatrix, fragmentModelViewMatrix, fragment.position);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, fragmentModelViewMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

        // Computation of normal matrix
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, fragmentModelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        // Binding of normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.normalBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fragment.fragment.indices);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, wallTexture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        gl.drawElements(gl.TRIANGLES, fragment.fragment.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}

function renderBall(gl, sphere, ballPosition, viewMatrix) {
    const modelViewMatrix = mat4.clone(viewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, ballPosition);

    mat4.rotate(modelViewMatrix, modelViewMatrix, ballRotationX, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, ballRotationZ, [0, 0, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    // Computation of normal matrix
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

    // Binding of normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.normalBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indices);

    gl.useProgram(shaderProgram);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, sphere.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function render() {
    if (animationRunning) {
        drawScene(gl, programInfo);
        requestId = requestAnimationFrame(render);
    }
}

function drawScene(gl, programInfo) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const viewMatrix = calculateViewMatrix();

    renderBackground(gl, backgroundPlane, backgroundTexture, programInfo);

    handleWallCollision(); 
    updateFragmentMovement(wallFragments); 

    updateBallPosition();

    renderBall(gl, sphere, ballPosition, viewMatrix); 
    renderFloor(gl, floor, viewMatrix); 

    if (wallBroken) {
        renderWall(gl, brokenWall, viewMatrix);
        renderWallFragments(gl, viewMatrix, programInfo); 
    } else {
        renderWall(gl, wall, viewMatrix); 
    }
}

requestAnimationFrame(render);

let animationRunning = false;
let requestId;

// Start logic
function startAnimation() {
    if (!animationRunning) {
        animationRunning = true;
        requestId = requestAnimationFrame(render);
    }
}
// Reset button logic
function reloadAnimation() {
    location.reload();
}

function restartAnimation(){
        ballPosition = [ballPositionX, ballPositionY, ballPositionZ];
        velocity = [velocityX, velocityY, velocityZ];
        wallBroken = false;
        wallFragments = [];
}

document.getElementById("reload-button").addEventListener("click", () => {
    reloadAnimation();  
});
document.getElementById("restart-button").addEventListener("click", () => {
    restartAnimation();  
});

startAnimation();

// Mouse event handling
canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        // Aggiorna yaw e pitch
        yaw += deltaX * 0.01;
        pitch += deltaY * 0.01;

        // Controlla se il pitch o lo yaw ha superato i 180°
        if (yaw > Math.PI) {
            yaw = -Math.PI + (yaw - Math.PI);
        } else if (yaw < -Math.PI) {
            yaw = Math.PI + (yaw + Math.PI);
        }

        if (pitch > Math.PI) {
            pitch = -Math.PI + (pitch - Math.PI);
        } else if (pitch < -Math.PI) {
            pitch = Math.PI + (pitch + Math.PI);
        }

        // Aggiorna le ultime posizioni del mouse
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Wall parameters
const wallHeight = 2.5;
const wallDepth = 5;
const wallWidth = 0.2;
const wallPositionX = 3.0;
const wallPositionY = 2.5;
const wallPositionZ = 0.0;
let wallBroken = false;
let wallFragments = [];  
// Floor parameters
const floorPositionX = 0;
const floorPositionY = 0;
const floorPositionZ = 0;
const floorWidth = 25;
const floorDepth = 25;
// Ball parameters
const r = 0.5;
const ballPositionX = getRandomInRange(-5, -10);
const ballPositionY = getRandomInRange(1, 4);
const ballPositionZ = 0;
let ballRotationX = 0;
let ballRotationZ = 0;
const velocityX = Math.random() * 0.35;
const velocityY = 0.06;
const velocityZ = 0;
const vBreak = 0.25;
const vBounce = 0.15;
// Physics factors
const gravity = -0.002;  // Gravity in space units
const dampingFactor = 0.6;  
const dampingFactorFragments = 0.25;
const frictionFactor = 0.98; 

// Variables for ball physics
let ballPosition = [ballPositionX, ballPositionY, ballPositionZ];
let velocity = [velocityX, velocityY, velocityZ];

// Variables for view control
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let yaw = 0;  // Rotation around the Y axis (horizontal)
let pitch = 0.2;  // Rotation around the X axis (vertical)

let impactPoint = calculateImpactPoint(ballPosition, velocity, wallPositionX); 

// Objects and textures creation
const wall = createCube(wallWidth, wallHeight, wallDepth);  
const wallTexture = loadTexture(gl, 'wall.png'); 
const brokenWall = createCube(wallWidth, (impactPoint.y - r) / 2, wallDepth);
const brokenWallTexture = loadTexture(gl, 'brokenwall.png')
const floor = createPlane(floorWidth , floorDepth);  
const floorTexture = loadTexture(gl, 'floor.png'); 
const sphere = createSphere(r, 50, 50);
const projectionMatrix = initProjectionMatrix(gl);
const texture = loadTexture(gl, 'image.png');  
const backgroundPlane = createBackgroundPlane(canvas.width, canvas.height);  
const backgroundTexture = loadTexture(gl, 'background.png'); 