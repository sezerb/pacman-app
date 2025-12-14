export class Map {
    private tileSize: number = 30
    // 0: Empty, 1: Wall, 2: Pellet, 3: Power Pellet
    private layout: number[][] = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
        [1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 1],
        [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]

    private pelletCount: number = 0

    constructor() {
        this.countPellets()
    }

    private countPellets() {
        this.pelletCount = 0
        for (let row = 0; row < this.layout.length; row++) {
            for (let col = 0; col < this.layout[row].length; col++) {
                if (this.layout[row][col] === 2 || this.layout[row][col] === 3) {
                    this.pelletCount++
                }
            }
        }
    }

    public getPelletCount(): number {
        return this.pelletCount
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        for (let row = 0; row < this.layout.length; row++) {
            for (let col = 0; col < this.layout[row].length; col++) {
                const tile = this.layout[row][col]
                const x = col * this.tileSize
                const y = row * this.tileSize

                if (tile === 1) {
                    ctx.fillStyle = 'blue'
                    ctx.fillRect(x, y, this.tileSize, this.tileSize)
                } else if (tile === 2) {
                    ctx.fillStyle = 'white'
                    ctx.beginPath()
                    ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 3, 0, Math.PI * 2)
                    ctx.fill()
                } else if (tile === 3) {
                    ctx.fillStyle = 'white'
                    ctx.beginPath()
                    ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, 8, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }
    }

    public getTileSize(): number {
        return this.tileSize
    }

    public isWall(row: number, col: number): boolean {
        if (row < 0 || row >= this.layout.length || col < 0 || col >= this.layout[0].length) {
            return true
        }
        return this.layout[row][col] === 1
    }

    public eatPellet(row: number, col: number): number {
        if (row >= 0 && row < this.layout.length && col >= 0 && col < this.layout[0].length) {
            const tile = this.layout[row][col]
            if (tile === 2 || tile === 3) {
                this.layout[row][col] = 0 // Remove pellet
                this.pelletCount--
                return tile === 3 ? 2 : 1 // 2 for Power Pellet, 1 for Normal
            }
        }
        return 0
    }
}
