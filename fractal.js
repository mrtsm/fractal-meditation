// Fractal rendering engine
class FractalRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.imageData = this.ctx.createImageData(this.width, this.height);
        
        this.animationId = null;
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.colorShift = 0;
        this.currentFractal = 'mandelbrot';
        this.juliaC = { re: -0.7, im: 0.27015 };
    }
    
    // Convert iteration count to smooth color
    getColor(iterations, maxIterations, smooth) {
        if (iterations === maxIterations) {
            return { r: 0, g: 0, b: 0 };
        }
        
        // Smooth coloring with color shift for animation
        const t = (iterations + smooth + this.colorShift) / 50;
        
        const r = Math.floor(128 + 128 * Math.sin(t * 0.3 + 0));
        const g = Math.floor(128 + 128 * Math.sin(t * 0.3 + 2));
        const b = Math.floor(128 + 128 * Math.sin(t * 0.3 + 4));
        
        return { r, g, b };
    }
    
    // Mandelbrot set calculation
    mandelbrot(x0, y0, maxIterations) {
        let x = 0, y = 0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < maxIterations) {
            const xtemp = x*x - y*y + x0;
            y = 2*x*y + y0;
            x = xtemp;
            iteration++;
        }
        
        if (iteration === maxIterations) {
            return { iterations: iteration, smooth: 0 };
        }
        
        // Smooth coloring
        const log_zn = Math.log(x*x + y*y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        const smooth = 1 - nu;
        
        return { iterations: iteration, smooth };
    }
    
    // Julia set calculation
    julia(x0, y0, maxIterations) {
        let x = x0, y = y0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < maxIterations) {
            const xtemp = x*x - y*y + this.juliaC.re;
            y = 2*x*y + this.juliaC.im;
            x = xtemp;
            iteration++;
        }
        
        if (iteration === maxIterations) {
            return { iterations: iteration, smooth: 0 };
        }
        
        const log_zn = Math.log(x*x + y*y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        const smooth = 1 - nu;
        
        return { iterations: iteration, smooth };
    }
    
    render() {
        const maxIterations = 100;
        
        for (let px = 0; px < this.width; px++) {
            for (let py = 0; py < this.height; py++) {
                // Map pixel to complex plane
                const x = (px - this.width / 2) / (this.width / 4) / this.zoom + this.offsetX;
                const y = (py - this.height / 2) / (this.height / 4) / this.zoom + this.offsetY;
                
                let result;
                if (this.currentFractal === 'mandelbrot') {
                    result = this.mandelbrot(x, y, maxIterations);
                } else {
                    result = this.julia(x, y, maxIterations);
                }
                
                const color = this.getColor(result.iterations, maxIterations, result.smooth);
                
                const index = (py * this.width + px) * 4;
                this.imageData.data[index] = color.r;
                this.imageData.data[index + 1] = color.g;
                this.imageData.data[index + 2] = color.b;
                this.imageData.data[index + 3] = 255;
            }
        }
        
        this.ctx.putImageData(this.imageData, 0, 0);
    }
    
    animate() {
        // Slow zoom into the fractal
        if (this.currentFractal === 'mandelbrot') {
            this.zoom *= 1.01;
            this.offsetX += 0.0002;
        }
        
        // Cycle colors smoothly
        this.colorShift += 0.3;
        
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (!this.animationId) {
            this.animate();
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    switchFractal() {
        if (this.currentFractal === 'mandelbrot') {
            this.currentFractal = 'julia';
            this.zoom = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            return 'Julia Set - Dancing Patterns';
        } else {
            this.currentFractal = 'mandelbrot';
            this.zoom = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            return 'Mandelbrot Set - Infinite Zoom';
        }
    }
}
