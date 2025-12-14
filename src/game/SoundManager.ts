export class SoundManager {
    private audioContext: AudioContext
    private isMuted: boolean = false

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    private playTone(frequency: number, type: OscillatorType, duration: number, startTime: number = 0): void {
        if (this.isMuted) return

        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime)

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime + startTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration)

        osc.connect(gain)
        gain.connect(this.audioContext.destination)

        osc.start(this.audioContext.currentTime + startTime)
        osc.stop(this.audioContext.currentTime + startTime + duration)
    }

    public playEatPellet(): void {
        // Short "waka" sound - technically difficult to synth perfectly simply, 
        // but a short square wave blip works well for retro feel.
        this.playTone(300, 'square', 0.1)
        setTimeout(() => {
            this.playTone(450, 'square', 0.1)
        }, 100)
    }

    public playGameOver(): void {
        // Descending tones
        this.playTone(500, 'sawtooth', 0.2, 0)
        this.playTone(400, 'sawtooth', 0.2, 0.2)
        this.playTone(300, 'sawtooth', 0.2, 0.4)
        this.playTone(200, 'sawtooth', 0.4, 0.6)
    }

    public playWin(): void {
        // Ascending fanfare
        this.playTone(300, 'sine', 0.1, 0)
        this.playTone(400, 'sine', 0.1, 0.1)
        this.playTone(500, 'sine', 0.1, 0.2)
        this.playTone(600, 'square', 0.4, 0.3)
    }

    public playStart(): void {
        this.playTone(400, 'square', 0.1, 0)
        this.playTone(500, 'square', 0.1, 0.15)
    }

    public resumeContext(): void {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume()
        }
    }
}
