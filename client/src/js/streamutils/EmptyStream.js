module.exports = EmptyStream
let count = 0;
const intervals = []
const canvases = []
function EmptyStream() {
    if (!(this instanceof EmptyStream)) return new EmptyStream()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const FRAME_RATE = 0.1
    const stream = canvas.captureStream(FRAME_RATE)
    const HEIGHT = 900/4
    const WIDTH = 1600/4
    let toggle = true
    
    canvas.setAttribute('width', WIDTH)
    canvas.setAttribute('height', HEIGHT)
    this.title = 'Nothing'
    canvas.setAttribute('style', 'position:fixed; left: 110%; pointer-events: none') // Push off screen
    const draw = () =>  {
        // console.log('Drew canvas')
        ctx.font = '100px serif';
        toggle =!toggle
        ctx.fillStyle = toggle ? 'white' : 'black';
        ctx.strokeStyle = toggle ? 'black' : 'white';
        ctx.fillRect(0, 0, WIDTH, HEIGHT)
        ctx.fillText(this.title, 20, 100);
        ctx.strokeText(this.title, 20, 100);
    }
    
    const interval = setInterval(draw.bind(this),1000*(1/FRAME_RATE))
    draw()
    canvases.push(canvas)
    intervals.push(interval)
    this.stream = stream
    this.stream.setTitle = this.setTitle.bind(this)
    return this.stream
}
EmptyStream.prototype.setTitle = function (title) {
    this.title = title
}
if (module.hot) {
    module.hot.dispose(data => {
        canvases.forEach(canvas => {
            console.log('got rid of canvas')
            canvas.remove()
        })
        intervals.forEach(interval => {
            console.log('got rid of interval')
            clearInterval(interval)
        })
    })
}