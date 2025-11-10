// Perspective matrix
function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ];
}

function ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
    return [
        -2*lr, 0, 0, 0,
        0, -2*bt, 0, 0,
        0, 0, 2*nf, 0,
        (left+right)*lr, (top+bottom)*bt, (far+near)*nf, 1
    ];
}

function mat4Identity() {
    return new Float32Array([
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    ]);
}

function mat4Translate(matrix, translation) {
    const result = new Float32Array(matrix);
    const [tx, ty, tz] = translation;
    
    result[12] = matrix[0] * tx + matrix[4] * ty + matrix[8] * tz + matrix[12];
    result[13] = matrix[1] * tx + matrix[5] * ty + matrix[9] * tz + matrix[13];
    result[14] = matrix[2] * tx + matrix[6] * ty + matrix[10] * tz + matrix[14];
    result[15] = matrix[3] * tx + matrix[7] * ty + matrix[11] * tz + matrix[15];
    
    return result;
}

function mat4RotateX(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);

    const mv1 = matrix[4], mv5 = matrix[5], mv9 = matrix[6], mv13 = matrix[7];
    const mv2 = matrix[8], mv6 = matrix[9], mv10 = matrix[10], mv14 = matrix[11];

    result[4] = mv1 * c + mv2 * s;
    result[5] = mv5 * c + mv6 * s;
    result[6] = mv9 * c + mv10 * s;
    result[7] = mv13 * c + mv14 * s;
    
    result[8] = mv2 * c - mv1 * s;
    result[9] = mv6 * c - mv5 * s;
    result[10] = mv10 * c - mv9 * s;
    result[11] = mv14 * c - mv13 * s;

    return result;
}

function mat4RotateY(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);

    const mv0 = matrix[0], mv4 = matrix[1], mv8 = matrix[2], mv12 = matrix[3];
    const mv2 = matrix[8], mv6 = matrix[9], mv10 = matrix[10], mv14 = matrix[11];


    result[0] = mv0 * c - mv2 * s;
    result[1] = mv4 * c - mv6 * s;
    result[2] = mv8 * c - mv10 * s;
    result[3] = mv12 * c - mv14 * s;
    
    result[8] = mv0 * s + mv2 * c;
    result[9] = mv4 * s + mv6 * c;
    result[10] = mv8 * s + mv10 * c;
    result[11] = mv12 * s + mv14 * c;

    return result;
}

function mat4RotateZ(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const result = new Float32Array(matrix);

    const mv0 = matrix[0], mv4 = matrix[1], mv8 = matrix[2], mv12 = matrix[3];
    const mv1 = matrix[4], mv5 = matrix[5], mv9 = matrix[6], mv13 = matrix[7]; 

    result[0] = mv0 * c + mv1 * s;
    result[1] = mv4 * c + mv5 * s;
    result[2] = mv8 * c + mv9 * s;
    result[3] = mv12 * c + mv13 * s;

    result[4] = mv1 * c - mv0 * s;
    result[5] = mv5 * c - mv4 * s;
    result[6] = mv9 * c - mv8 * s;
    result[7] = mv13 * c - mv12 * s;

    return result;
}

function multiplyMat4(a, b) {
    let r = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) { 
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[k * 4 + i] * b[j * 4 + k]; 
            }
            r[j * 4 + i] = sum;
        }
    }
    return r;
}

function mat4Scale(matrix, scale) {
    const [sx, sy, sz] = scale;
    const result = new Float32Array(matrix);
    result[0] *= sx;
    result[1] *= sx;
    result[2] *= sx;
    result[3] *= sx;
    
    result[4] *= sy;
    result[5] *= sy;
    result[6] *= sy;
    result[7] *= sy;
    
    result[8] *= sz;
    result[9] *= sz;
    result[10] *= sz;
    result[11] *= sz;

    return result;
}

function mat4Inverse(m) {
  const r = new Float32Array(16);
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
  const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
  const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;
  r[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  r[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  r[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  r[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  r[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  r[5] = (a00 * b11 + a03 * b07 - a02 * b08) * det;
  r[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  r[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  r[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  r[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  r[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  r[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  r[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  r[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  r[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  r[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return r;
}

function mat4InverseTranspose(m) {
    const inv = mat4Inverse(m);
    if (!inv) return null;
    const r = new Float32Array(16);
    r[0] = inv[0]; r[1] = inv[4]; r[2] = inv[8]; r[3] = inv[12];
    r[4] = inv[1]; r[5] = inv[5]; r[6] = inv[9]; r[7] = inv[13];
    r[8] = inv[2]; r[9] = inv[6]; r[10] = inv[10]; r[11] = inv[14];
    r[12] = inv[3]; r[13] = inv[7]; r[14] = inv[11]; r[15] = inv[15];

    return r;
}