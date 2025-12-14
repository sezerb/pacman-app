export interface HighScore {
    name: string
    score: number
}

export class ScoreManager {
    private highScores: HighScore[] = []
    private readonly STORAGE_KEY = 'pacman_high_scores'
    private readonly MAX_SCORES = 10

    constructor() {
        this.loadScores()
    }

    private loadScores(): void {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
            try {
                this.highScores = JSON.parse(stored)
            } catch (e) {
                console.error('Failed to parse high scores', e)
                this.highScores = []
            }
        }
    }

    private saveScores(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.highScores))
    }

    public addScore(name: string, score: number): void {
        this.highScores.push({ name, score })
        // Sort descending
        this.highScores.sort((a, b) => b.score - a.score)
        // Keep top N
        if (this.highScores.length > this.MAX_SCORES) {
            this.highScores = this.highScores.slice(0, this.MAX_SCORES)
        }
        this.saveScores()
    }

    public getHighScores(): HighScore[] {
        return this.highScores
    }
}
