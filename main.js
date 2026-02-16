// Main application controller
let fractalRenderer;
let meditationAudio;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fractalCanvas');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const toggleFractalBtn = document.getElementById('toggleFractalBtn');
    const fractalTypeDisplay = document.getElementById('fractalType');
    
    // Initialize fractal renderer
    fractalRenderer = new FractalRenderer(canvas);
    meditationAudio = new MeditationAudio();
    
    // Render initial frame
    fractalRenderer.render();
    
    // Start button - begins meditation experience
    startBtn.addEventListener('click', () => {
        fractalRenderer.start();
        meditationAudio.start();
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        canvas.classList.add('pulsing');
    });
    
    // Stop button
    stopBtn.addEventListener('click', () => {
        fractalRenderer.stop();
        meditationAudio.stop();
        
        stopBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        canvas.classList.remove('pulsing');
    });
    
    // Toggle between Mandelbrot and Julia sets
    toggleFractalBtn.addEventListener('click', () => {
        const newFractalName = fractalRenderer.switchFractal();
        fractalTypeDisplay.textContent = newFractalName;
        fractalRenderer.render();
    });
});
