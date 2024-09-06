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
        highp vec3 directionalLightColor = vec3(0.3, 0.3, 0.3);  // Less intense directional light
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
    const initialPositions = [];

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

            const vertexPos = [radius * x, radius * y, radius * z];
            positions.push(...vertexPos);
            initialPositions.push(...vertexPos);
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
        vertexCount: indices.length,
        positions,
        initialPositions
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
    const cameraDistance = 30.0;

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
let wallFragments = [];  

const wall = createCube(wallWidth, wallHeight, wallDepth);  
const wallTexture = loadTexture(gl, 'wall.png'); 

const floorPositionX = 0;
const floorPositionY = 0;
const floorPositionZ = 0;
const floorWidth = 20;
const floorDepth = 20;

const floor = createPlane(floorWidth , floorDepth);  
const floorTexture = loadTexture(gl, 'floor.png'); 

const r = 0.5;
const ballPositionX= -4;
const ballPositionY = 3;
const ballPositionZ = 0;
const velocityX = 0.0;
const velocityY = 0.2;
const velocityZ = 0;

let sphere = createSphere(r, 50, 50);
const projectionMatrix = initProjectionMatrix(gl);

const texture = loadTexture(gl, 'image.png');  

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

const backgroundPlane = createBackgroundPlane(2, 2);  


const backgroundTexture = loadTexture(gl, 'background.png'); 

// Variables for ball physics
let ballPosition = [ballPositionX, ballPositionY, ballPositionZ];
let velocity = [velocityX, velocityY, velocityZ];
const gravity = -0.002;  // Gravity in space units
const dampingFactor = 0.5;  // Damping factor

// Variables for view control
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let yaw = 0;  // Rotation around the Y axis (horizontal)
let pitch = 0.2;  // Rotation around the X axis (vertical)

function createWallFragments(wall) {
    const fragmentCount = 10; 
    const fragments = [];
    let remainingHeight = wallHeight;

    for (let i = 0; i < fragmentCount - 1; i++) {
        // Random height of the fragment, gradually reduced from the total
        const fragmentHeight = Math.random() * remainingHeight * 0.25;
        remainingHeight -= fragmentHeight;

        const fragment = createCube(wallWidth, fragmentHeight, wallDepth); 
        fragments.push({
            fragment,
            position: [
                wallPositionX - Math.random() * 0.5 -0.25,  
                (remainingHeight + fragmentHeight / 2), 
                wallPositionZ + Math.random() * 0.5 - 0.25  
            ],
            velocity: [
                Math.random() * 0.04 - 0.02,  
                Math.random() * 0.04 - 0.02,  
                Math.random() * 0.04 - 0.02  
            ],
            fragmentHeight: fragmentHeight  
        });
    }

    const fragment = createCube(wallWidth, remainingHeight, wallDepth);
    fragments.push({
        fragment,
        position: [
            wallPositionX - Math.random() * 0.5, 
            remainingHeight / 2 - wallHeight / 2, 
            wallPositionZ + Math.random() * 0.5 - 0.25  
        ],
        velocity: [
            Math.random() * 0.04 - 0.02, 
            Math.random() * 0.04 - 0.02,
            Math.random() * 0.04 - 0.02 
        ],
        fragmentHeight: remainingHeight 
    });

    return fragments;
}

//Create wall fragments when the wall is broken
function breakWall() {
    wallBroken = true;
    wallFragments = createWallFragments(wall); 
}

function calculateFloorPosition(ballPosition, viewMatrix, projectionMatrix, r) {
    const floorWorldPosition = [0, 0, ballPosition[2], 1];

    const floorViewPosition = vec4.create();
    vec4.transformMat4(floorViewPosition, floorWorldPosition, viewMatrix);

    const floorClipPosition = vec4.create();
    vec4.transformMat4(floorClipPosition, floorViewPosition, projectionMatrix);

    const ndcPositionY = floorClipPosition[1] / floorClipPosition[3];

    return ndcPositionY + r;
}

function drawScene(gl, programInfo, sphere, texture, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // View matrix
    const viewMatrix = calculateViewMatrix();

    // Background rendering
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

    const frictionFactor = 0.8;

    // Wall collision
    if (
        ballPosition[0] + velocity[0] >= wallPositionX - r &&
        ballPosition[0] + velocity[0] <= wallPositionX - r + wallWidth &&
        ballPosition[1] - r <= wallPositionY + wallHeight &&
        ballPosition[1] + r >= 0 &&
        ballPosition[2] + r >= wallPositionZ - wallDepth &&
        ballPosition[2] - r <= wallPositionZ + wallDepth &&
        !wallBroken
    ) {
        velocity[0] = -velocity[0] * dampingFactor;
        breakWall();
    }

    let floorPos = calculateFloorPosition(ballPosition, viewMatrix, projectionMatrix, r);

if (ballPosition[1] + velocity[1] <= floorPos) {
    // Verify if the ball is within the floor boundaries
    if (ballPosition[0] >= floorPositionX - floorWidth/2 && ballPosition[0] <= floorPositionX + floorWidth/2 &&
        ballPosition[2] >= floorPositionZ - floorDepth/2 && ballPosition[2] <= floorPositionZ + floorDepth/2) {
        // Ball bounces on the floor
        velocity[1] = -velocity[1] * dampingFactor;
        velocity[0] *= frictionFactor;  
        velocity[2] *= frictionFactor; 
        ballPosition[1] = floorPos;  
    } else {
        // Ball falls if it's outside the floor
        ballPosition[1] += velocity[1];
        velocity[1] += gravity;
    }
}

    // Update the ball position
    velocity[1] += gravity;
    ballPosition[0] += velocity[0];
    ballPosition[1] += velocity[1];
    ballPosition[2] += velocity[2];

    if (Math.abs(velocity[0]) < 0.001) {
        velocity[0] = 0;
    }

    // Model matrix for the sphere
    const modelViewMatrix = mat4.clone(viewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, ballPosition);

    if(pitch > floorPositionY) {
    // Floor rendering
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

if (wallBroken) {
    for (let i = 0; i < wallFragments.length; i++) {
        const fragment = wallFragments[i];

        // Update the fragment position
        fragment.velocity[1] += 9.81 * gravity * deltaTime;
        fragment.position[0] += fragment.velocity[0];
        fragment.position[1] += fragment.velocity[1];
        fragment.position[2] += fragment.velocity[2];

        const fragmentHeight = fragment.fragmentHeight;

        // Block fragments from falling through the floor
        if (fragment.position[1] - fragmentHeight < floorPositionY) {
            fragment.position[1] = floorPositionY + fragmentHeight;
            fragment.velocity[1] = 0; 

            fragment.velocity[0] *= frictionFactor;
            fragment.velocity[2] *= frictionFactor;

            if (Math.abs(fragment.velocity[0]) < 0.01) {
                fragment.velocity[0] = 0;
            }
            if (Math.abs(fragment.velocity[2]) < 0.01) {
                fragment.velocity[2] = 0;
            }
        }

        const fragmentModelViewMatrix = mat4.clone(viewMatrix);
        mat4.translate(fragmentModelViewMatrix, fragmentModelViewMatrix, fragment.position);

        // Fragments rendering 
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
        //Wall rendering
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

    // Sphere rendering
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
    if (wallBroken) {
        for (let i = 0; i < wallFragments.length; i++) {
            const fragment = wallFragments[i];

            fragment.velocity[1] += 9.81 * gravity * deltaTime;
            fragment.position[0] += fragment.velocity[0];
            fragment.position[1] += fragment.velocity[1];
            fragment.position[2] += fragment.velocity[2];

            const fragmentHeight = fragment.fragmentHeight;

            if (fragment.position[1] - fragmentHeight < floorPositionY) {
                fragment.position[1] = floorPositionY + fragmentHeight;
                fragment.velocity[1] = 0;

                fragment.velocity[0] *= frictionFactor;
                fragment.velocity[2] *= frictionFactor;

                if (Math.abs(fragment.velocity[0]) < 0.01) {
                    fragment.velocity[0] = 0;
                }
                if (Math.abs(fragment.velocity[2]) < 0.01) {
                    fragment.velocity[2] = 0;
                }
            }

            const fragmentModelViewMatrix = mat4.clone(viewMatrix);
            mat4.translate(fragmentModelViewMatrix, fragmentModelViewMatrix, fragment.position);

            // Fragments rendering
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
            // Wall rendering
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

    //Ball rendering
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

    //Floor rendering
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

// Animation loop
function render(now) {
    if (animationRunning) {
        now *= 0.001; 
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

//Start button logic
function startAnimation() {
    if (!animationRunning) {
        animationRunning = true;
        then = 0;
        requestId = requestAnimationFrame(render);
    }
}

//Stop button logic
function stopAnimation() {
    if (animationRunning) {
        animationRunning = false;
        cancelAnimationFrame(requestId);
    }
}

//Reset button logic
function resetAnimation() {
    ballPosition = [ballPositionX, ballPositionY, ballPositionZ];
    velocity = [velocityX, velocityY, velocityZ];
    wallBroken = false;
    wallFragments = [];
}

document.getElementById("start-button").addEventListener("click", startAnimation);
document.getElementById("stop-button").addEventListener("click", stopAnimation);
document.getElementById("reset-button").addEventListener("click", () => {
    resetAnimation();
    if (animationRunning) {
        then = 0;
    }
});

//The animation starts automatically
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

        yaw += deltaX * 0.01;
        pitch += deltaY * 0.01;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});
