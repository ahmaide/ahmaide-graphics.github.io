// primitives.js

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}


function generateSphereData(latBands, longBands, radius) {
    let positions = [];
    let colors = [];
    let normals = []; 
    let indices = [];
    const color = [1.0, 1.0, 1.0];

    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
        let theta = latNumber * Math.PI / latBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = radius * cosPhi * sinTheta;
            let y = radius * cosTheta;
            let z = radius * sinPhi * sinTheta;
            
            positions.push(x, y, z);
            colors.push(...color); 
            
            let norm = normalize([x, y, z]);
            normals.push(...norm); 
        }
    }

    for (let latNumber = 0; latNumber < latBands; latNumber++) {
        for (let longNumber = 0; longNumber < longBands; longNumber++) {
            let first = (latNumber * (longBands + 1)) + longNumber;
            let second = first + longBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals), 
        indices: new Uint16Array(indices)
    };
}

function generateCylinderData(slices, radius, height) {
    let positions = [];
    let colors = [];
    let normals = []; 
    let indices = [];
    let texCoords = []; // Added texture coordinates array
    const color = [1.0, 1.0, 1.0]; 
    const halfHeight = height / 2;
    
    const topCenterIndex = 0;
    positions.push(0, halfHeight, 0);
    colors.push(...color);
    normals.push(0, 1, 0); 
    texCoords.push(0.5, 0.5); // Center of top cap

    const bottomCenterIndex = 1;
    positions.push(0, -halfHeight, 0);
    colors.push(...color);
    normals.push(0, -1, 0); 
    texCoords.push(0.5, 0.5); // Center of bottom cap
    
    let baseVertexIndex = 2; 

    for (let i = 0; i <= slices; i++) {
        const theta = i * 2 * Math.PI / slices;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        const u = i / slices; // U coordinate for side (0 to 1)

        // Top Cap Vertices
        positions.push(x, halfHeight, z);
        colors.push(...color);
        normals.push(0, 1, 0); // Cap normal
        const top_cap_u = Math.cos(theta) * 0.5 + 0.5;
        const top_cap_v = Math.sin(theta) * 0.5 + 0.5;
        texCoords.push(top_cap_u, top_cap_v); 
        
        // Bottom Cap Vertices
        positions.push(x, -halfHeight, z);
        colors.push(...color);
        normals.push(0, -1, 0); // Cap normal
        const bottom_cap_u = Math.cos(theta) * 0.5 + 0.5;
        const bottom_cap_v = Math.sin(theta) * 0.5 + 0.5;
        texCoords.push(bottom_cap_u, bottom_cap_v);
        
        // SIDE Vertices (Duplicated for different normals/UVs)
        
        // Top side vertex
        positions.push(x, halfHeight, z);
        colors.push(...color);
        normals.push(x, 0, z); // Side normal
        texCoords.push(u, 1.0); // Side UV (Top edge)
        
        // Bottom side vertex
        positions.push(x, -halfHeight, z);
        colors.push(...color);
        normals.push(x, 0, z); // Side normal
        texCoords.push(u, 0.0); // Side UV (Bottom edge)
    }
    
    // Indices for the SIDE
    let sideBaseIndex = baseVertexIndex + (slices + 1) * 4; // Start index after all cap and side vertices are pushed
    
    for (let i = 0; i < slices; i++) {
        // We use the last 2 vertices pushed per slice for the side
        const capTop1 = baseVertexIndex + i * 4;
        const capBottom1 = baseVertexIndex + i * 4 + 1;
        const capTop2 = baseVertexIndex + (i + 1) * 4;
        const capBottom2 = baseVertexIndex + (i + 1) * 4 + 1;

        const top1 = baseVertexIndex + i * 4 + 2;
        const bottom1 = baseVertexIndex + i * 4 + 3;
        const top2 = baseVertexIndex + (i + 1) * 4 + 2;
        const bottom2 = baseVertexIndex + (i + 1) * 4 + 3;
        
        // Side triangles
        indices.push(top1, bottom1, top2); 
        indices.push(bottom1, bottom2, top2);

        // Top Cap triangles
        indices.push(topCenterIndex, capTop2, capTop1); 
        
        // Bottom Cap triangles
        indices.push(bottomCenterIndex, capBottom1, capBottom2); 
    }
    
    return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals), 
        texCoords: new Float32Array(texCoords), // Added texCoords return
        indices: new Uint16Array(indices)
    };
}


function generateConeData(slices, radius, height) {
    let positions = [];
    let colors = [];
    let normals = []; 
    let indices = [];
    let texCoords = []; // Added texture coordinates array
    const color = [1.0, 1.0, 1.0];
    const halfHeight = height / 2;

    const tipIndex = 0;
    positions.push(0, halfHeight, 0);
    colors.push(...color);
    normals.push(0, 1, 0); 
    texCoords.push(0.5, 1.0); // Tip UV (mapped to top of texture)

    const baseCenterIndex = 1;
    positions.push(0, -halfHeight, 0);
    colors.push(...color);
    normals.push(0, -1, 0); 
    texCoords.push(0.5, 0.5); // Center of base cap
    
    let baseVertexIndex = 2; 

    for (let i = 0; i <= slices; i++) {
        const theta = i * 2 * Math.PI / slices;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        const u = i / slices;
        
        // Side Vertex
        positions.push(x, -halfHeight, z);
        colors.push(...color);

        const normal_x = Math.cos(theta);
        const normal_z = Math.sin(theta);
        const normal_y = radius / height; 
        let norm = normalize([normal_x, normal_y, normal_z]);
        normals.push(...norm);
        texCoords.push(u, 0.0); // Side UV (Base edge)

        // Base Cap Vertex
        positions.push(x, -halfHeight, z);
        colors.push(...color);
        normals.push(0, -1, 0); // Cap normal
        const cap_u = Math.cos(theta) * 0.5 + 0.5;
        const cap_v = Math.sin(theta) * 0.5 + 0.5;
        texCoords.push(cap_u, cap_v);
    }
    
    // Total vertices generated per slice: 2 (side and cap) + 2 initial (tip and center) = 2 + 2*(slices+1)
    
    for (let i = 0; i < slices; i++) {
        const side1 = baseVertexIndex + i * 2;
        const side2 = baseVertexIndex + (i + 1) * 2;
        
        // Side triangles (Tip, V2, V1)
        indices.push(tipIndex, side2, side1); 
        
        const cap1 = baseVertexIndex + i * 2 + 1;
        const cap2 = baseVertexIndex + (i + 1) * 2 + 1;

        // Base Cap triangles (Center, V1, V2)
        indices.push(baseCenterIndex, cap1, cap2); 
    }

    return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals), 
        texCoords: new Float32Array(texCoords), // Added texCoords return
        indices: new Uint16Array(indices)
    };
}

const allPrimitives = {
    'Cube': { positions: cube_positions, colors: cube_colors, normals: cube_normals, indices: cube_indices },
    'Sphere': generateSphereData(20, 20, 1.0),
    'Cylinder': generateCylinderData(24, 1.0, 1.0),
    'Cone': generateConeData(24, 1.0, 1.0)
};