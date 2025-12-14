export abstract class Entity {
    protected x: number
    protected y: number
    protected size: number
    protected speed: number
    protected direction: { x: number; y: number } = { x: 0, y: 0 }

    constructor(x: number, y: number, size: number, speed: number) {
        this.x = x
        this.y = y
        this.size = size
        this.speed = speed
    }

    abstract update(deltaTime: number): void
    abstract draw(ctx: CanvasRenderingContext2D): void

    public getPosition() {
        return { x: this.x, y: this.y }
    }
}
