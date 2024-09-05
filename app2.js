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
    attribute vec2 aTextureCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;

        highp vec3 ambientLight = vec3(0.6, 0.6, 0.6);  // Warmer ambient light
        highp vec3 directionalLightColor = vec3(0.8, 0.8, 0.8);  // Less intense directional light
        highp vec3 directionalVector = normalize(vec3(-0.75, 0.8, -0.75));

        highp vec4 transformedNormal = uModelViewMatrix * vec4(aVertexPosition.xyz, 0.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
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
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
};

// Function to create and load a cube
function createCube(width, height, depth) {
    const positions = [
        -width, -height,  depth,
        width, -height,  depth,
        width,  height,  depth,
        -width,  height,  depth,
        -width, -height, -depth,
        -width,  height, -depth,
        width,  height, -depth,
        width, -height, -depth,
        -width,  height, -depth,
        -width,  height,  depth,
        width,  height,  depth,
        width,  height, -depth,
        -width, -height, -depth,
        width, -height, -depth,
        width, -height,  depth,
        -width, -height,  depth,
        width, -height, -depth,
        width,  height, -depth,
        width,  height,  depth,
        width, -height,  depth,
        -width, -height, -depth,
        -width, -height,  depth,
        -width,  height,  depth,
        -width,  height, -depth,
    ];

    const textureCoords = [
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
    ];

    const indices = [
        0,  1,  2,    0,  2,  3,
        4,  5,  6,    4,  6,  7,
        8,  9,  10,   8,  10, 11,
        12, 13, 14,   12, 14, 15,
        16, 17, 18,   16, 18, 19,
        20, 21, 22,   20, 22, 23,
    ];

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
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

// Function to create the bouncing floor
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
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length,
    };
}

// Create a 3D sphere with UV coordinates for texture
function createSphere(radius, latitudeBands, longitudeBands) {
    const positions = [];
    const indices = [];
    const textureCoords = [];

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

            positions.push(radius * x, radius * y, radius * z);
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

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

// Load the texture
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

    // Actual image loading
    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // Check if the image has power-of-two dimensions
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

// Configure the projection matrix
function initProjectionMatrix(gl) {
    const fieldOfView = 45;   // in degrees
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView * Math.PI / 180, aspect, zNear, zFar);

    return projectionMatrix;
}

function calculateViewMatrix() {
    const viewMatrix = mat4.create();

    // Calculate the camera distance from the center of the scene
    const cameraDistance = 30.0;  // You can adjust this distance

    // Calculate the camera position using yaw and pitch
    const cameraPosition = [
        Math.sin(yaw) * Math.cos(pitch) * cameraDistance,
        Math.sin(pitch) * cameraDistance,
        Math.cos(yaw) * Math.cos(pitch) * cameraDistance
    ];

    // Point the camera towards the center of the scene
    const center = [floorPositionX, floorPositionY, floorPositionZ];

    // The up vector is generally [0, 1, 0] to keep the head up
    const up = [0, 1, 0];

    // Construct the view matrix using lookAt
    mat4.lookAt(viewMatrix, cameraPosition, center, up);

    return viewMatrix;
}

// Variable to track the wall state
const wallHeight = 2.5;
const wallDepth = 5;
const wallWidth = 0.2;
const wallPositionX = 3.0;
const wallPositionY = 2.5;
const wallPositionZ = 0.0;
let wallBroken = false;
let wallFragments = [];  // Array to store the wall fragments

const wall = createCube(wallWidth, wallHeight, wallDepth);  // A thin, tall, and deep wall
const wallTexture = loadTexture(gl, 'wall.png');  // Replace with your texture URL    

const floorPositionX = 0;
const floorPositionY = 0;
const floorPositionZ = 0;
const floorWidth = 20;
const floorDepth = 20;

const floor = createPlane(floorWidth , floorDepth);  // Create a bouncing floor
const floorTexture = loadTexture(gl, 'floor.png');  // Load the floor texture

const r = 0.5;
const ballPositionX= -4;
const ballPositionY = 3;
const ballPositionZ = 0;
const velocityX = 0.2;
const velocityY = 0.05;
const velocityZ = 0;

let sphere = createSphere(r, 30, 30);
const projectionMatrix = initProjectionMatrix(gl);

const texture = loadTexture(gl, 'image.png');  // Replace with your texture URL

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
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
    };
}

const backgroundPlane = createBackgroundPlane(2, 2);  // Create a background plane that covers the entire view


const backgroundTexture = loadTexture(gl, 'background.png'); // Replace with your texture URL

// Variables for ball physics
let ballPosition = [ballPositionX, ballPositionY, ballPositionZ];
let velocity = [velocityX, velocityY, velocityZ];
const gravity = -0.002;  // Gravity in space units
const dampingFactor = 0.5;  // Damping factor
let time = 0.0;  // Variable to track time

// Variables for view control
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let yaw = 0;  // Rotation around the Y axis (horizontal)
let pitch = 0.2;  // Rotation around the X axis (vertical)

function createWallFragments(wall) {
    const fragmentCount = 10;  // Number of fragments
    const fragments = [];
    let remainingHeight = wallHeight;

    for (let i = 0; i < fragmentCount - 1; i++) {
        // Random height of the fragment, gradually reduced from the total
        const fragmentHeight = Math.random() * remainingHeight * 0.25;
        remainingHeight -= fragmentHeight;

        const fragment = createCube(wallWidth, fragmentHeight, wallDepth);  // Create the fragment with the calculated height
        fragments.push({
            fragment,
            position: [
                wallPositionX - Math.random() * 0.5 -0.25,  // Slightly behind the wall
                (remainingHeight + fragmentHeight / 2),  // Calcola la posizione verticale corretta
                wallPositionZ + Math.random() * 0.5 - 0.25  // Leggera variazione sull'asse Z
            ],
            velocity: [
                Math.random() * 0.04 - 0.02,  // Dispersione sull'asse X
                Math.random() * 0.04 - 0.02,  // Dispersione sull'asse Y
                Math.random() * 0.04 - 0.02   // Dispersione sull'asse Z
            ],
            fragmentHeight: fragmentHeight  // Memorizza l'altezza del frammento per un utilizzo successivo
        });
    }

    // Aggiungi l'ultimo frammento con l'altezza rimanente
    const fragment = createCube(wallWidth, remainingHeight, wallDepth);
    fragments.push({
        fragment,
        position: [
            wallPositionX - Math.random() * 0.5,  // Posiziona leggermente dietro a wallPositionX
            remainingHeight / 2 - wallHeight / 2,  // Posiziona correttamente l'ultimo frammento
            wallPositionZ + Math.random() * 0.5 - 0.25  // Leggera variazione sull'asse Z
        ],
        velocity: [
            Math.random() * 0.04 - 0.02,  // Dispersione sull'asse X
            Math.random() * 0.04 - 0.02,  // Dispersione sull'asse Y
            Math.random() * 0.04 - 0.02   // Dispersione sull'asse Z
        ],
        fragmentHeight: remainingHeight  // Memorizza l'altezza del frammento per un utilizzo successivo
    });

    return fragments;
}

function breakWall() {
    wallBroken = true;
    wallFragments = createWallFragments(wall);  // Crea i frammenti del muro
}

function calculateFloorPosition(ballPosition, viewMatrix, projectionMatrix, r) {
    // La posizione del pavimento nel mondo è y = 0
    const floorWorldPosition = [0, 0, ballPosition[2], 1]; // Centro del pavimento in relazione alla posizione Z della pallina

    // Trasforma la posizione del pavimento nel sistema di coordinate della vista
    const floorViewPosition = vec4.create();
    vec4.transformMat4(floorViewPosition, floorWorldPosition, viewMatrix);

    // Trasforma la posizione della vista nello spazio di clip
    const floorClipPosition = vec4.create();
    vec4.transformMat4(floorClipPosition, floorViewPosition, projectionMatrix);

    // Converti in coordinate NDC (Normalized Device Coordinates)
    const ndcPositionY = floorClipPosition[1] / floorClipPosition[3];

    // Considera il raggio della pallina (r) per la posizione del pavimento rispetto alla pallina
    return ndcPositionY + r;  // Aggiungi il raggio per evitare che la pallina passi sotto il pavimento
}

function drawScene(gl, programInfo, sphere, texture, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Ottieni la matrice di vista con la nuova funzione
    const viewMatrix = calculateViewMatrix();

    // Aggiorna il tempo
    time += deltaTime;

    // Render del piano di sfondo
    const bgModelViewMatrix = mat4.create();
    mat4.translate(bgModelViewMatrix, bgModelViewMatrix, [0.0, 0.0, -1.0]);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, bgModelViewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPlane.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPlane.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, backgroundPlane.indices);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, backgroundPlane.vertexCount, gl.UNSIGNED_SHORT, 0);

    // Collisione con il muro
    if (
        ballPosition[0] + velocity[0] >= wallPositionX - r &&  // Controlla se la pallina raggiunge il muro in X
        ballPosition[0] + velocity[0] <= wallPositionX - r + wallWidth &&  // Controlla se la pallina non supera il muro
        ballPosition[1] - r <= wallPositionY + wallHeight &&  // Controlla se la pallina è entro l'altezza del muro
        ballPosition[1] + r >= 0 &&    // Controlla se la pallina non è sotto il muro
        ballPosition[2] + r >= wallPositionZ - wallDepth && // Controlla se la pallina è entro la profondità del muro
        ballPosition[2] - r <= wallPositionZ + wallDepth && // Controlla se la pallina non è oltre il muro in profondità
        !wallBroken                    // Verifica che il muro non sia già rotto
    ) {
        velocity[0] = -velocity[0] * dampingFactor; // Inverti e smorza la velocità
        time = 0;  // Resetta il tempo per la deformazione
        breakWall();  // Rompi il muro
    }

    let floorPos = calculateFloorPosition(ballPosition, viewMatrix, projectionMatrix, r);

    const frictionFactor = 0.8;  // Fattore di attrito, vicino a 1 per attrito basso, vicino a 0 per attrito alto

 // Rimbalzo dal pavimento o caduta se fuori dal floor
if (ballPosition[1] + velocity[1] <= floorPos) {
    // Verifica se la pallina è ancora sopra il pavimento
    if (ballPosition[0] >= floorPositionX - floorWidth/2 && ballPosition[0] <= floorPositionX + floorWidth/2 &&
        ballPosition[2] >= floorPositionZ - floorDepth/2 && ballPosition[2] <= floorPositionZ + floorDepth/2) {
        // Se è sopra il pavimento, rimbalza
        velocity[1] = -velocity[1] * dampingFactor;
        velocity[0] *= frictionFactor;  // Applica attrito alla velocità lungo l'asse X
        velocity[2] *= frictionFactor;  // Applica attrito alla velocità lungo l'asse Z
        time = 0;
        ballPosition[1] = floorPos;  // Imposta la pallina sopra il pavimento calcolato
        // Se è fuori dal pavimento, continua a cadere sotto l'effetto della gravità
        ballPosition[1] += velocity[1];
        velocity[1] += gravity;
    }
}

    // Aggiorna la posizione della pallina
    velocity[1] += gravity;
    ballPosition[0] += velocity[0];
    ballPosition[1] += velocity[1];
    ballPosition[2] += velocity[2];

    // Fermo la palla se la velocità sull'asse X è molto piccola
    if (Math.abs(velocity[0]) < 0.001) {
        velocity[0] = 0;
    }

    // Matrice di modellazione della palla
    const modelViewMatrix = mat4.clone(viewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, ballPosition);

    if(pitch > floorPositionY) {
    // Render del piano di rimbalzo
    const floorModelViewMatrix = mat4.clone(viewMatrix);
    mat4.translate(floorModelViewMatrix, floorModelViewMatrix, [floorPositionX, floorPositionY, floorPositionZ]);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, floorModelViewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indices);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, floor.vertexCount, gl.UNSIGNED_SHORT, 0);

// Render del muro o dei frammenti
if (wallBroken) {
    for (let i = 0; i < wallFragments.length; i++) {
        const fragment = wallFragments[i];

        // Aggiorna la posizione del frammento
        fragment.velocity[1] += 9.81 * gravity * deltaTime;
        fragment.position[0] += fragment.velocity[0];
        fragment.position[1] += fragment.velocity[1];
        fragment.position[2] += fragment.velocity[2];

        // Calcola la metà dell'altezza del frammento
        const fragmentHeight = fragment.fragmentHeight; // Usa l'altezza reale del frammento

        // Impedisci ai frammenti di scendere sotto il floor
        if (fragment.position[1] - fragmentHeight < floorPositionY) {
            fragment.position[1] = floorPositionY + fragmentHeight;
            fragment.velocity[1] = 0;  // Ferma il movimento verticale

            // Applica attrito alle velocità orizzontali quando il frammento tocca il suolo
            fragment.velocity[0] *= frictionFactor;
            fragment.velocity[2] *= frictionFactor;

            // Fermo il frammento se la velocità è molto piccola
            if (Math.abs(fragment.velocity[0]) < 0.01) {
                fragment.velocity[0] = 0;
            }
            if (Math.abs(fragment.velocity[2]) < 0.01) {
                fragment.velocity[2] = 0;
            }
        }

        const fragmentModelViewMatrix = mat4.clone(viewMatrix);
        mat4.translate(fragmentModelViewMatrix, fragmentModelViewMatrix, fragment.position);

        // Rendering del frammento
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, fragmentModelViewMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fragment.fragment.indices);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, wallTexture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        gl.drawElements(gl.TRIANGLES, fragment.fragment.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}
 else {
        const wallModelViewMatrix = mat4.clone(viewMatrix);
        mat4.translate(wallModelViewMatrix, wallModelViewMatrix, [wallPositionX, wallPositionY, wallPositionZ]);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, wallModelViewMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, wall.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, wall.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wall.indices);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, wallTexture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        gl.drawElements(gl.TRIANGLES, wall.vertexCount, gl.UNSIGNED_SHORT, 0);
    }

    // Render della sfera
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indices);

    gl.useProgram(shaderProgram);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, sphere.vertexCount, gl.UNSIGNED_SHORT, 0);
} else {
    // Render del muro o dei frammenti
    if (wallBroken) {
        for (let i = 0; i < wallFragments.length; i++) {
            const fragment = wallFragments[i];

            // Aggiorna la posizione del frammento
            fragment.velocity[1] += 9.81 * gravity * deltaTime;
            fragment.position[0] += fragment.velocity[0];
            fragment.position[1] += fragment.velocity[1];
            fragment.position[2] += fragment.velocity[2];

            // Calcola la metà dell'altezza del frammento
            const fragmentHeight = fragment.fragmentHeight; // Usa l'altezza reale del frammento

            // Impedisci ai frammenti di scendere sotto il floor
            if (fragment.position[1] - fragmentHeight < floorPositionY) {
                fragment.position[1] = floorPositionY + fragmentHeight;
                fragment.velocity[1] = 0;  // Ferma il movimento verticale

                // Applica attrito alle velocità orizzontali quando il frammento tocca il suolo
                fragment.velocity[0] *= frictionFactor;
                fragment.velocity[2] *= frictionFactor;

                // Fermo il frammento se la velocità è molto piccola
                if (Math.abs(fragment.velocity[0]) < 0.01) {
                    fragment.velocity[0] = 0;
                }
                if (Math.abs(fragment.velocity[2]) < 0.01) {
                    fragment.velocity[2] = 0;
                }
            }

            const fragmentModelViewMatrix = mat4.clone(viewMatrix);
            mat4.translate(fragmentModelViewMatrix, fragmentModelViewMatrix, fragment.position);

            // Rendering del frammento
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, fragmentModelViewMatrix);

            gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, fragment.fragment.textureCoord);
            gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fragment.fragment.indices);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, wallTexture);
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

            gl.drawElements(gl.TRIANGLES, fragment.fragment.vertexCount, gl.UNSIGNED_SHORT, 0);
        }
    }
    else {
            const wallModelViewMatrix = mat4.clone(viewMatrix);
            mat4.translate(wallModelViewMatrix, wallModelViewMatrix, [wallPositionX, wallPositionY, wallPositionZ]);

            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, wallModelViewMatrix);

            gl.bindBuffer(gl.ARRAY_BUFFER, wall.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, wall.textureCoord);
            gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wall.indices);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, wallTexture);
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

            gl.drawElements(gl.TRIANGLES, wall.vertexCount, gl.UNSIGNED_SHORT, 0);
        }

    // Render della sfera
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indices);

    gl.useProgram(shaderProgram);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, sphere.vertexCount, gl.UNSIGNED_SHORT, 0);

    // Render del piano di rimbalzo
    const floorModelViewMatrix = mat4.clone(viewMatrix);
    mat4.translate(floorModelViewMatrix, floorModelViewMatrix, [floorPositionX, floorPositionY, floorPositionZ]);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, floorModelViewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indices);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawElements(gl.TRIANGLES, floor.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}

function render(now) {
    if (animationRunning) {
        now *= 0.001;  // Convert time to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, sphere, texture, deltaTime);

        requestId = requestAnimationFrame(render);
    }
}

let then = 0;
requestAnimationFrame(render);

let animationRunning = false;
let requestId;

function startAnimation() {
    if (!animationRunning) {
        animationRunning = true;
        then = 0;
        requestId = requestAnimationFrame(render);
    }
}

function stopAnimation() {
    if (animationRunning) {
        animationRunning = false;
        cancelAnimationFrame(requestId);
    }
}

// Event listener per i bottoni
document.getElementById("start-button").addEventListener("click", startAnimation);
document.getElementById("stop-button").addEventListener("click", stopAnimation);
document.getElementById("reset-button").addEventListener("click", () => {
    resetAnimation();
    if (animationRunning) {
        then = 0;
    }
});

// Funzione per riavviare l'animazione
function resetAnimation() {
    ballPosition = [ballPositionX, ballPositionY, ballPositionZ];
    velocity = [velocityX, velocityY, velocityZ];
    wallBroken = false; // Ripristina lo stato del muro
    wallFragments = []; // Svuota i frammenti del muro
    time = 0.0; // Reset tempo
}

startAnimation();

// Eventi del mouse per ruotare la scena
canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        // Aggiorna gli angoli di rotazione
        yaw += deltaX * 0.01;
        pitch += deltaY * 0.01;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});
