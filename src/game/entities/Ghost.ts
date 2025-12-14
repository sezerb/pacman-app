import { Entity } from './Entity'
import { Map } from '../Map'
import { Pacman } from './Pacman'

export class Ghost extends Entity {
    private map: Map
    private color: string
    private pacman: Pacman
    private isScared: boolean = false
    private scaredTimer: number = 0
    private startX: number
    private startY: number

    constructor(x: number, y: number, tileSize: number, map: Map, pacman: Pacman, color: string = 'red') {
        super(x, y, tileSize - 4, tileSize * 0.075)
        this.map = map
        this.pacman = pacman
        this.color = color
        this.direction = { x: 1, y: 0 }
        this.startX = x
        this.startY = y
    }

    public makeScared(durationBytes: number): void {
        this.isScared = true
        this.scaredTimer = durationBytes
    }

    public reset(): void {
        this.isScared = false
        this.scaredTimer = 0
        this.x = this.startX
        this.y = this.startY
        // Reset direction too just in case
        this.direction = { x: 1, y: 0 }
    }

    public isVulnerable(): boolean {
        return this.isScared
    }

    public update(deltaTime: number): void {
        if (this.isScared) {
            this.scaredTimer -= deltaTime
            if (this.scaredTimer <= 0) {
                this.isScared = false
            }
        }

        const tileSize = this.map.getTileSize()
        // Move slower if scared
        const moveSpeed = this.isScared ? this.speed * 0.5 : this.speed
        const speed = moveSpeed * (deltaTime / 16)

        // Calculate grid position
        const currentCol = Math.round(this.x / tileSize)
        const currentRow = Math.round(this.y / tileSize)

        const centerX = currentCol * tileSize
        const centerY = currentRow * tileSize

        const distToCenterX = centerX - this.x
        const distToCenterY = centerY - this.y
        const distToCenter = Math.sqrt(distToCenterX * distToCenterX + distToCenterY * distToCenterY)

        if (distToCenter < speed) {
            // We reached the center of the tile
            this.x = centerX
            this.y = centerY

            // AI Decision logic
            const possibleDirs = []
            const dirs = [
                { x: 0, y: -1 }, // Up
                { x: 0, y: 1 },  // Down
                { x: -1, y: 0 }, // Left
                { x: 1, y: 0 }   // Right
            ]

            for (const dir of dirs) {
                // Prevent immediate illegal 180 reverse unless allowed/stuck
                if (dir.x === -this.direction.x && dir.y === -this.direction.y) continue

                if (!this.map.isWall(currentRow + dir.y, currentCol + dir.x)) {
                    possibleDirs.push(dir)
                }
            }

            if (possibleDirs.length > 0) {
                let chosenDir = possibleDirs[0]

                if (!this.isScared && (this.color === 'red' || this.color === 'pink')) {
                    // Smart Tracking (Only when NOT scared)
                    let targetX = this.pacman.getPosition().x
                    let targetY = this.pacman.getPosition().y

                    // Sort possibleDirs by distance to target
                    possibleDirs.sort((a, b) => {
                        const posA = { x: (currentCol + a.x) * tileSize, y: (currentRow + a.y) * tileSize }
                        const posB = { x: (currentCol + b.x) * tileSize, y: (currentRow + b.y) * tileSize }

                        const distA = Math.sqrt(Math.pow(posA.x - targetX, 2) + Math.pow(posA.y - targetY, 2))
                        const distB = Math.sqrt(Math.pow(posB.x - targetX, 2) + Math.pow(posB.y - targetY, 2))

                        return distA - distB
                    })

                    chosenDir = possibleDirs[0]
                } else if (this.isScared) {
                    // Flee Logic (Basic: Pick direction creating most distance OR Random)
                    // For simplicity and effectiveness, Random is often fine for scared ghosts to separate,
                    // but Fleeing is better. Let's do random for now to ensure they don't get stuck oscilating.
                    chosenDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)]
                } else {
                    // Random for Cyan/Orange
                    chosenDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)]
                }

                this.direction = chosenDir
            } else {
                // Dead end, must reverse
                const reverseDir = { x: -this.direction.x, y: -this.direction.y }
                if (!this.map.isWall(currentRow + reverseDir.y, currentCol + reverseDir.x)) {
                    this.direction = reverseDir
                }
            }
        }

        // Apply movement
        this.x += this.direction.x * speed
        this.y += this.direction.y * speed
    }


    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.isScared ? 'blue' : this.color
        ctx.beginPath()

        const centerX = this.x + this.map.getTileSize() / 2
        const centerY = this.y + this.map.getTileSize() / 2
        const radius = this.size / 2

        // Simple ghost shape (circle top, rectangle bottom)
        ctx.arc(centerX, centerY - 2, radius, Math.PI, 0)
        ctx.lineTo(centerX + radius, centerY + radius)
        ctx.lineTo(centerX - radius, centerY + radius)
        ctx.fill()

        // Eyes
        const eyeOffsetX = radius * 0.35
        const eyeOffsetY = -radius * 0.2
        const eyeRadius = radius * 0.3
        const pupilRadius = radius * 0.15

        // Offset pupils based on direction
        // Limit offset so they don't leave the eye
        const pupilOffsetX = this.direction.x * 2
        const pupilOffsetY = this.direction.y * 2

        ctx.fillStyle = 'white'
        // If scared, maybe make eyes smaller or different? keeping same for now as requested "Add eyes"
        if (this.isScared) {
            ctx.fillStyle = '#e0e0e0' // Slightly dimmer white if scared
        }

        // Left Eye
        ctx.beginPath()
        ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Right Eye
        ctx.beginPath()
        ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Pupils
        ctx.fillStyle = 'blue'
        if (this.isScared) {
            ctx.fillStyle = 'white' // White pupils if body is blue/scared might look frightened? 
            // Or maybe just pink/red for scared?
            // Let's stick to blue, but if body is blue and eye is white, blue pupil works.
        }

        // Left Pupil
        ctx.beginPath()
        ctx.arc(centerX - eyeOffsetX + pupilOffsetX, centerY + eyeOffsetY + pupilOffsetY, pupilRadius, 0, Math.PI * 2)
        ctx.fill()

        // Right Pupil
        ctx.beginPath()
        ctx.arc(centerX + eyeOffsetX + pupilOffsetX, centerY + eyeOffsetY + pupilOffsetY, pupilRadius, 0, Math.PI * 2)
        ctx.fill()
    }
}
