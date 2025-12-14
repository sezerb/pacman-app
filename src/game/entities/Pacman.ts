import { Entity } from './Entity'
import { Map } from '../Map'

export class Pacman extends Entity {
    private nextDirection: { x: number; y: number } = { x: 0, y: 0 }
    private map: Map
    private mouthOpen: number = 0.2
    private mouthSpeed: number = 0.01
    private mouthOpening: boolean = true

    constructor(x: number, y: number, tileSize: number, map: Map) {
        super(x, y, tileSize - 4, tileSize / 10) // slightly smaller than tile
        this.map = map
        this.direction = { x: 1, y: 0 } // Start moving right
        this.nextDirection = { x: 1, y: 0 }
    }

    public setNextDirection(dir: { x: number; y: number }) {
        this.nextDirection = dir
    }

    public update(deltaTime: number): void {
        // Animate mouth
        if (this.mouthOpening) {
            this.mouthOpen += this.mouthSpeed * 2 * (deltaTime / 16)
            if (this.mouthOpen >= 0.5) this.mouthOpening = false
        } else {
            this.mouthOpen -= this.mouthSpeed * 2 * (deltaTime / 16)
            if (this.mouthOpen <= 0) this.mouthOpening = true
        }

        const tileSize = this.map.getTileSize()
        const speed = this.speed * (deltaTime / 16)

        let moveDistance = speed

        // We move in steps to allow cornering
        // Current position
        const currentCol = Math.round(this.x / tileSize)
        const currentRow = Math.round(this.y / tileSize)

        // Center of current tile
        const centerX = currentCol * tileSize
        const centerY = currentRow * tileSize

        // Distance to center
        const distToCenterX = centerX - this.x
        const distToCenterY = centerY - this.y
        const distToCenter = Math.sqrt(distToCenterX * distToCenterX + distToCenterY * distToCenterY)

        // Check if we are "passing" the center this frame
        // If we are moving towards the center, and the moveDistance is >= distToCenter, we cross it.
        // Or if we are already at center (dist ~ 0).

        // Simpler approach: 
        // 1. If we are close to center, consider turning.
        // 2. If we turn, snap to center.
        // 3. Move.

        if (distToCenter < speed) {
            // We are at (or extremely close to) the center. 
            // 1. Snap to center to be precise
            this.x = centerX
            this.y = centerY

            // 2. Try to change direction
            if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                if (!this.map.isWall(currentRow + this.nextDirection.y, currentCol + this.nextDirection.x)) {
                    this.direction = this.nextDirection
                    // Reset next direction? Standard behavior keeps it until changed usually, 
                    // but sometimes it clears. Let's keep it.
                }
            }

            // 3. Check if blocked in current direction
            if (this.map.isWall(currentRow + this.direction.y, currentCol + this.direction.x)) {
                // Stop
                return
            }
        } else {
            // We are not at center. 
            // If we want to reverse direction (180 turn), allow it immediately.
            if (this.nextDirection.x === -this.direction.x && this.nextDirection.y === -this.direction.y) {
                this.direction = this.nextDirection
            }
        }

        // Apply movement
        this.x += this.direction.x * moveDistance
        this.y += this.direction.y * moveDistance

        // Wrap around (simple version) - if needed. 
        // (Not requested but good for safety if map has open borders)
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'yellow'
        ctx.beginPath()

        const centerX = this.x + this.map.getTileSize() / 2
        const centerY = this.y + this.map.getTileSize() / 2
        const radius = this.size / 2

        let rotation = 0
        if (this.direction.x === 1) rotation = 0
        else if (this.direction.x === -1) rotation = Math.PI
        else if (this.direction.y === -1) rotation = -Math.PI / 2
        else if (this.direction.y === 1) rotation = Math.PI / 2

        ctx.translate(centerX, centerY)
        ctx.rotate(rotation)
        ctx.arc(0, 0, radius, this.mouthOpen, Math.PI * 2 - this.mouthOpen)
        ctx.lineTo(0, 0)
        ctx.fill()
        ctx.rotate(-rotation)
        ctx.translate(-centerX, -centerY)
    }
}
