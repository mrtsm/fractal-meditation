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
        this.offsetX = -0.5;
        this.offsetY = 0;
        this.colorShift = 0;
        this.currentFractal = 'mandelbrot';
        this.juliaC = { re: -0.7, im: 0.27015 };
        this.juliaAngle = 0;
        this.time = 0;
        
        // Interesting zoom targets for Mandelbrot
        this.zoomTargets = [
            { x: -0.7435669, y: 0.1314023 },
            { x: -0.16, y: 1.0405 },
            { x: -1.25066, y: 0.02012 },
        ];
        this.currentTarget = 0;
    }
    
    // Wild psychedelic color palette
    getColor(iterations, maxIterations, smooth) {
        if (iterations === maxIterations) {
            return { r: 0, g: 0, b: 0 };
        }
        
        const t = (iterations + smooth) / 25 + this.colorShift;
        
        // Multiple overlapping sine waves for wild color cycling
        const r = Math.floor(128 + 127 * Math.sin(t * 0.7 + 0));
        const g = Math.floor(128 + 127 * Math.sin(t * 0.5 + 2.094));
        const b = Math.floor(128 + 127 * Math.sin(t * 0.9 + 4.188));
        
        // Add extra intensity bursts
        const burst = Math.sin(t * 0.2) * 0.3 + 0.7;
        
        return {
            r: Math.min(255, Math.floor(r * burst + 40 * Math.sin(t * 1.3))),
            g: Math.min(255, Math.floor(g * burst + 40 * Math.sin(t * 1.7 + 1))),
            b: Math.min(255, Math.floor(b * burst + 40 * Math.sin(t * 2.1 + 2)))
        };
    }
    
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
        
        const log_zn = Math.log(x*x + y*y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        return { iterations: iteration, smooth: 1 - nu };
    }
    
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
        return { iterations: iteration, smooth: 1 - nu };
    }
    
    render() {
        const maxIterations = 150;
        
        for (let px = 0; px < this.width; px++) {
            for (let py = 0; py < this.height; py++) {
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
        this.time += 0.016;
        
        if (this.currentFractal === 'mandelbrot') {
            // Zoom into interesting spots
            const target = this.zoomTargets[this.currentTarget];
            this.zoom *= 1.008;
            // Smoothly drift toward target
            this.offsetX += (target.x - this.offsetX) * 0.003;
            this.offsetY += (target.y - this.offsetY) * 0.003;
            
            // Switch target after deep zoom
            if (this.zoom > 500) {
                this.zoom = 1;
                this.offsetX = -0.5;
                this.offsetY = 0;
                this.currentTarget = (this.currentTarget + 1) % this.zoomTargets.length;
            }
        } else {
            // Julia: animate the C parameter for morphing shapes
            this.juliaAngle += 0.008;
            const radius = 0.7885;
            this.juliaC.re = radius * Math.cos(this.juliaAngle);
            this.juliaC.im = radius * Math.sin(this.juliaAngle);
        }
        
        // Fast color cycling
        this.colorShift += 0.15;
        
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
        const wasRunning = !!this.animationId;
        this.stop();
        
        if (this.currentFractal === 'mandelbrot') {
            this.currentFractal = 'julia';
            this.zoom = 1;
            this.offsetX = 0;
            this.offsetY = 0;
        } else {
            this.currentFractal = 'mandelbrot';
            this.zoom = 1;
            this.offsetX = -0.5;
            this.offsetY = 0;
        }
        
        if (wasRunning) {
            this.start();
        } else {
            this.render();
        }
        
        return this.currentFractal === 'mandelbrot'
            ? 'Mandelbrot Set - Infinite Zoom'
            : 'Julia Set - Morphing Patterns';
    }
}
