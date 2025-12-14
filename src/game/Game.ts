import { Map } from './Map'
import { Pacman } from './entities/Pacman'
import { Ghost } from './entities/Ghost'
import { SoundManager } from './SoundManager'
import { ScoreManager } from './ScoreManager'

export class Game {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private lastTime: number = 0
    private map: Map
    private pacman: Pacman
    private ghosts: Ghost[] = []
    private score: number = 0
    private state: 'MENU' | 'PLAYING' | 'WON' | 'GAMEOVER' | 'INPUT_NAME' | 'HIGH_SCORES' = 'MENU'
    private soundManager: SoundManager
    private scoreManager: ScoreManager
    private playerName: string = ''

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        const context = canvas.getContext('2d')
        if (!context) {
            throw new Error('Could not get 2D context')
        }
        this.ctx = context
        this.soundManager = new SoundManager()
        this.scoreManager = new ScoreManager()
        this.map = new Map()
        const ts = this.map.getTileSize()
        this.pacman = new Pacman(ts, ts, ts, this.map)

        // Spawn ghosts
        this.ghosts.push(new Ghost(11 * ts, 14 * ts, ts, this.map, this.pacman, 'red'))
        this.ghosts.push(new Ghost(12 * ts, 14 * ts, ts, this.map, this.pacman, 'pink'))
        this.ghosts.push(new Ghost(13 * ts, 14 * ts, ts, this.map, this.pacman, 'cyan'))
        this.ghosts.push(new Ghost(14 * ts, 14 * ts, ts, this.map, this.pacman, 'orange'))

        this.setupInput()
    }

    private setupInput(): void {
        window.addEventListener('keydown', (e) => {
            // Resume Audio Context on first user interaction
            this.soundManager.resumeContext()

            if (this.state === 'INPUT_NAME') {
                if (e.key === 'Enter') {
                    if (this.playerName.length > 0) {
                        this.scoreManager.addScore(this.playerName, this.score)
                        this.state = 'HIGH_SCORES'
                    }
                    return
                } else if (e.key === 'Backspace') {
                    this.playerName = this.playerName.slice(0, -1)
                } else if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
                    if (this.playerName.length < 5) {
                        this.playerName += e.key.toUpperCase()
                    }
                }
                return
            }

            if (this.state === 'HIGH_SCORES') {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    this.state = 'MENU'
                    this.restart() // Reset game for next round
                }
                return
            }

            if ((this.state === 'GAMEOVER' || this.state === 'WON') && e.key === 'Enter') {
                // Should not happen if logic is correct, but just in case
                // Actually we now transition to INPUT_NAME automatically.
                // But if we want to wait for user to press Enter to go to Input?
                // Request says "After game is over, ask for name".
                // Let's transition immediately on game over/win or wait for one key press?
                // Immediate transition might be jarring. Let's wait for 'Enter' on game over/win to go to input.
                this.state = 'INPUT_NAME'
                this.playerName = ''
                return
            }

            if (this.state === 'MENU') {
                if (e.key === 'Enter') {
                    this.state = 'PLAYING'
                    this.soundManager.playStart() // Optional start sound
                } else if (e.key.toLowerCase() === 'h') {
                    this.state = 'HIGH_SCORES'
                }
                return
            }

            if (this.state === 'PLAYING') {
                switch (e.key) {
                    case 'ArrowUp':
                        this.pacman.setNextDirection({ x: 0, y: -1 })
                        break
                    case 'ArrowDown':
                        this.pacman.setNextDirection({ x: 0, y: 1 })
                        break
                    case 'ArrowLeft':
                        this.pacman.setNextDirection({ x: -1, y: 0 })
                        break
                    case 'ArrowRight':
                        this.pacman.setNextDirection({ x: 1, y: 0 })
                        break
                }
            }
        })
    }

    private restart(): void {
        this.score = 0
        this.resetEntities()
    }

    private resetEntities(): void {
        this.map = new Map() // Reset pellets
        const ts = this.map.getTileSize()
        this.pacman = new Pacman(ts, ts, ts, this.map)
        this.ghosts = [
            new Ghost(11 * ts, 14 * ts, ts, this.map, this.pacman, 'red'),
            new Ghost(12 * ts, 14 * ts, ts, this.map, this.pacman, 'pink'),
            new Ghost(13 * ts, 14 * ts, ts, this.map, this.pacman, 'cyan'),
            new Ghost(14 * ts, 14 * ts, ts, this.map, this.pacman, 'orange')
        ]
    }

    public start(): void {
        requestAnimationFrame(this.loop.bind(this))
    }

    private loop(timestamp: number): void {
        const deltaTime = timestamp - this.lastTime
        this.lastTime = timestamp

        if (this.state === 'PLAYING') {
            this.update(deltaTime)
        }
        this.draw()

        requestAnimationFrame(this.loop.bind(this))
    }

    private update(deltaTime: number): void {
        this.pacman.update(deltaTime)
        const ts = this.map.getTileSize()

        // Check pellet eating
        const tileX = Math.round(this.pacman.getPosition().x / ts)
        const tileY = Math.round(this.pacman.getPosition().y / ts)
        const pelletType = this.map.eatPellet(tileY, tileX)
        if (pelletType > 0) {
            this.score += 10
            if (pelletType === 2) {
                // Power Pellet!
                this.score += 40 // Bonus for power pellet (total 50)
                // Make ghosts scared for ~10 seconds (10000ms)
                for (const ghost of this.ghosts) {
                    ghost.makeScared(10000)
                }
            }

            this.soundManager.playEatPellet()
            if (this.map.getPelletCount() === 0) {
                this.state = 'WON'
                this.soundManager.playWin()
                // Wait for user input to proceed to Name Input
            }
        }

        for (const ghost of this.ghosts) {
            ghost.update(deltaTime)

            // Circular collision detection
            const dx = this.pacman.getPosition().x - ghost.getPosition().x
            const dy = this.pacman.getPosition().y - ghost.getPosition().y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < ts) { // less than 1 tile size
                if (ghost.isVulnerable()) {
                    // Eat Ghost
                    this.score += 200
                    ghost.reset()
                    // Optional: Brief pause or effect?
                } else {
                    this.state = 'GAMEOVER'
                    this.soundManager.playGameOver()
                    // Wait for user input to proceed to Name Input
                }
            }
        }
    }

    private draw(): void {
        // Clear screen
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.state === 'MENU') {
            this.ctx.fillStyle = 'yellow'
            this.ctx.font = '40px Arial'
            this.ctx.textAlign = 'center'
            this.ctx.fillText('PACMAN', this.canvas.width / 2, this.canvas.height / 2 - 40)

            this.ctx.fillStyle = 'white'
            this.ctx.font = '20px Arial'
            this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, this.canvas.height / 2 + 20)
            this.ctx.fillText('Press H for High Scores', this.canvas.width / 2, this.canvas.height / 2 + 50)
            return
        }

        if (this.state === 'HIGH_SCORES') {
            this.ctx.fillStyle = 'yellow'
            this.ctx.font = '40px Arial'
            this.ctx.textAlign = 'center'
            this.ctx.fillText('CHAMPIONS', this.canvas.width / 2, 80)

            const scores = this.scoreManager.getHighScores()
            this.ctx.textAlign = 'left'
            this.ctx.font = '20px Arial'
            this.ctx.fillStyle = 'white'

            const startY = 150
            const lineHeight = 30
            const startX = this.canvas.width / 2 - 100

            scores.forEach((s, i) => {
                this.ctx.fillText(`${i + 1}.`, startX, startY + i * lineHeight)
                this.ctx.fillText(s.name, startX + 50, startY + i * lineHeight)
                this.ctx.textAlign = 'right'
                this.ctx.fillText(s.score.toString(), startX + 250, startY + i * lineHeight)
                this.ctx.textAlign = 'left'
            })

            if (scores.length === 0) {
                this.ctx.textAlign = 'center'
                this.ctx.fillText('No scores yet!', this.canvas.width / 2, this.canvas.height / 2)
            }

            this.ctx.textAlign = 'center'
            this.ctx.fillStyle = '#AAAAAA'
            this.ctx.fillText('Press ENTER to Return', this.canvas.width / 2, this.canvas.height - 50)
            return
        }

        // Draw Game
        this.map.draw(this.ctx)
        this.pacman.draw(this.ctx)
        for (const ghost of this.ghosts) {
            ghost.draw(this.ctx)
        }

        // Draw Score
        this.ctx.fillStyle = 'white'
        this.ctx.font = '20px Arial'
        this.ctx.textAlign = 'left'
        this.ctx.fillText(`Score: ${this.score} `, 10, 25)

        if (this.state === 'GAMEOVER') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            this.ctx.fillStyle = 'red'
            this.ctx.font = '40px Arial'
            this.ctx.textAlign = 'center'
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20)

            this.ctx.fillStyle = 'white'
            this.ctx.font = '20px Arial'
            this.ctx.fillText('Press ENTER to Save Score', this.canvas.width / 2, this.canvas.height / 2 + 30)
        } else if (this.state === 'WON') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            this.ctx.fillStyle = 'green'
            this.ctx.font = '40px Arial'
            this.ctx.textAlign = 'center'
            this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 20)

            this.ctx.fillStyle = 'white'
            this.ctx.font = '20px Arial'
            this.ctx.fillText(`Final Score: ${this.score} `, this.canvas.width / 2, this.canvas.height / 2 + 20)
            this.ctx.fillText('Press ENTER to Save Score', this.canvas.width / 2, this.canvas.height / 2 + 60)
        } else if (this.state === 'INPUT_NAME') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            this.ctx.fillStyle = 'yellow'
            this.ctx.font = '30px Arial'
            this.ctx.textAlign = 'center'
            this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 - 60)

            this.ctx.fillStyle = 'white'
            this.ctx.font = '20px Arial'
            this.ctx.fillText(`Score: ${this.score} `, this.canvas.width / 2, this.canvas.height / 2 - 20)

            this.ctx.fillText('Enter Name:', this.canvas.width / 2, this.canvas.height / 2 + 20)

            this.ctx.font = '40px Arial'
            this.ctx.fillStyle = 'cyan'
            // Draw name with cursor or something? just name is fine
            this.ctx.fillText(this.playerName + (Math.floor(Date.now() / 500) % 2 === 0 ? '_' : ' '), this.canvas.width / 2, this.canvas.height / 2 + 70)

            this.ctx.font = '16px Arial'
            this.ctx.fillStyle = '#AAAAAA'
            this.ctx.fillText('(Max 5 Characters, Press ENTER to Submit)', this.canvas.width / 2, this.canvas.height / 2 + 110)
        }
    }
}
