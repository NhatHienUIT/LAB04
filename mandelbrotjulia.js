function setupCanvas(canvasId, width, height) {
    const canvas = document.getElementById(canvasId);
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext('2d');
}

function mapToComplex(x, y, width, height, re_min, re_max, im_min, im_max) {
    const re = re_min + (x / width) * (re_max - re_min);
    const im = im_min + (y / height) * (im_max - im_min);
    return { re, im };
}

function complexMagnitude(re, im) {
    return Math.sqrt(re * re + im * im);
}

function getColor(iterations, maxIterations) {
    if (iterations === maxIterations) return [0, 0, 0]; 
    const t = iterations / maxIterations;
    const r = Math.floor(9 * (1 - t) * t * t * t * 255);
    const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    return [r, g, b];
}

function calculateMandelbrot(c_re, c_im, maxIterations) {
    let z_re = 0;
    let z_im = 0;
    let iteration = 0;
    while (complexMagnitude(z_re, z_im) <= 2 && iteration < maxIterations) {
        const z_re_new = z_re * z_re - z_im * z_im + c_re;
        const z_im_new = 2 * z_re * z_im + c_im;
        z_re = z_re_new;
        z_im = z_im_new;
        iteration++;
    } 
    return iteration;
}

function calculateJulia(z_re, z_im, c_re, c_im, maxIterations) {
    let iteration = 0; 
    while (complexMagnitude(z_re, z_im) <= 2 && iteration < maxIterations) {
        const z_re_new = z_re * z_re - z_im * z_im + c_re;
        const z_im_new = 2 * z_re * z_im + c_im;
        z_re = z_re_new;
        z_im = z_im_new;
        iteration++;
    } 
    return iteration;
}
function drawMandelbrot(ctx, width, height, maxIterations = 100) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const re_min = -2.5;
    const re_max = 1;
    const im_min = -1.25;
    const im_max = 1.25;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const complex = mapToComplex(x, y, width, height, re_min, re_max, im_min, im_max);
            const iterations = calculateMandelbrot(complex.re, complex.im, maxIterations);
            const [r, g, b] = getColor(iterations, maxIterations);
            const pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = r;        
            data[pixelIndex + 1] = g;    
            data[pixelIndex + 2] = b;    
            data[pixelIndex + 3] = 255;   
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}
function drawJulia(ctx, width, height, c_re = -0.7, c_im = 0.27, maxIterations = 100) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    const re_min = -2;
    const re_max = 2;
    const im_min = -2;
    const im_max = 2;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const complex = mapToComplex(x, y, width, height, re_min, re_max, im_min, im_max);
            const iterations = calculateJulia(complex.re, complex.im, c_re, c_im, maxIterations);
            const [r, g, b] = getColor(iterations, maxIterations);
            const pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = r;         
            data[pixelIndex + 1] = g;     
            data[pixelIndex + 2] = b;     
            data[pixelIndex + 3] = 255;   
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
window.onload = function() {
    const canvasWidth = 600;
    const canvasHeight = 600;
    const maxIterations = 100;
    const mandelbrotCtx = setupCanvas('mandelbrot-canvas', canvasWidth, canvasHeight);
    const juliaCtx = setupCanvas('julia-canvas', canvasWidth, canvasHeight);
    drawMandelbrot(mandelbrotCtx, canvasWidth, canvasHeight, maxIterations);
    drawJulia(juliaCtx, canvasWidth, canvasHeight, -0.7, 0.27, maxIterations);
    const juliaParamDisplay = document.getElementById('julia-param');
    document.getElementById('mandelbrot-canvas').addEventListener('click', function(event) {
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const complex = mapToComplex(
            x, y, 
            canvasWidth, canvasHeight, 
            -2.5, 1, 
            -1.25, 1.25
        );
        
        juliaParamDisplay.textContent = `c = ${complex.re.toFixed(4)} + ${complex.im.toFixed(4)}i`;
        drawJulia(juliaCtx, canvasWidth, canvasHeight, complex.re, complex.im, maxIterations);
    });
    document.getElementById('iterations-slider').addEventListener('input', function() {
        const newIterations = parseInt(this.value);
        document.getElementById('iterations-value').textContent = newIterations;
        const paramText = juliaParamDisplay.textContent;
        const match = paramText.match(/c = ([-\d.]+) \+ ([-\d.]+)i/);
        const c_re = match ? parseFloat(match[1]) : -0.7;
        const c_im = match ? parseFloat(match[2]) : 0.27;
        drawMandelbrot(mandelbrotCtx, canvasWidth, canvasHeight, newIterations);
        drawJulia(juliaCtx, canvasWidth, canvasHeight, c_re, c_im, newIterations);
    });
};
