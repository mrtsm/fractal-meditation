// Ambient meditation music synthesizer using Web Audio API
class MeditationAudio {
    constructor() {
        this.audioContext = null;
        this.oscillators = [];
        this.gainNodes = [];
        this.masterGain = null;
        this.isPlaying = false;
    }
    
    init() {
        // Create audio context (requires user interaction)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        this.masterGain.connect(this.audioContext.destination);
    }
    
    // Create a drone pad with harmonics
    createDronePad(baseFrequency, harmonics = [1, 2, 3, 5]) {
        const now = this.audioContext.currentTime;
        
        harmonics.forEach((harmonic, index) => {
            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(
                baseFrequency * harmonic,
                now
            );
            
            // Create gain node for this oscillator
            const gainNode = this.audioContext.createGain();
            const amplitude = 0.1 / (harmonic * harmonic); // Fade harmonics
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(amplitude, now + 3); // Fade in
            
            // Add subtle LFO (Low Frequency Oscillator) for movement
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.setValueAtTime(0.1 + index * 0.05, now);
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.setValueAtTime(amplitude * 0.3, now);
            
            lfo.connect(lfoGain);
            lfoGain.connect(gainNode.gain);
            
            // Connect oscillator -> gain -> master
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start
            oscillator.start(now);
            lfo.start(now);
            
            this.oscillators.push(oscillator);
            this.oscillators.push(lfo);
            this.gainNodes.push(gainNode);
        });
    }
    
    // Create ambient soundscape
    start() {
        if (this.isPlaying) return;
        
        if (!this.audioContext) {
            this.init();
        }
        
        // Resume context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Base frequencies for calming drone (C major-ish ambient)
        // C2, E2, G2 - peaceful major triad in low register
        const frequencies = [
            65.41,  // C2
            82.41,  // E2
            98.00,  // G2
        ];
        
        frequencies.forEach(freq => {
            this.createDronePad(freq, [1, 2, 3, 5]);
        });
        
        // Add subtle high harmonic shimmer
        this.createHighShimmer();
        
        this.isPlaying = true;
    }
    
    // High frequency shimmer for ethereal quality
    createHighShimmer() {
        const now = this.audioContext.currentTime;
        
        [523.25, 659.25, 783.99].forEach((freq, index) => { // C5, E5, G5
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.02, now + 5 + index);
            
            // LFO for shimmer effect
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.setValueAtTime(0.2 + index * 0.1, now);
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.setValueAtTime(0.015, now);
            
            lfo.connect(lfoGain);
            lfoGain.connect(gainNode.gain);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.start(now);
            lfo.start(now);
            
            this.oscillators.push(oscillator);
            this.oscillators.push(lfo);
            this.gainNodes.push(gainNode);
        });
    }
    
    // Fade out and stop
    stop() {
        if (!this.isPlaying) return;
        
        const now = this.audioContext.currentTime;
        const fadeTime = 2;
        
        // Fade out all gain nodes
        this.gainNodes.forEach(gainNode => {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + fadeTime);
        });
        
        // Stop and clean up oscillators
        setTimeout(() => {
            this.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Already stopped
                }
            });
            this.oscillators = [];
            this.gainNodes = [];
            this.isPlaying = false;
        }, fadeTime * 1000);
    }
}
