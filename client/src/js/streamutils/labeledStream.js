import VideoStreamMerger from './video-stream-merger';
export const positions = [
    { 'x': 0, 'y': 0, 'width': .5, 'height': .5 },
    { 'x': .5, 'y': 0, 'width': .5, 'height': .5 },
    { 'x': 0, 'y': .5, 'width': .5, 'height': .5 },
    { 'x': .5, 'y': .5, 'width': .5, 'height': .5 }]
const drawLabel = (ctx, { label = null, font = '48px serif', fill = 'white', stroke = 'black', x = 10, y = 50 } = {}) => {
    ctx.font = font;
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke;
    ctx.fillText(label, x + 10, y + 50);
    ctx.strokeText(label, x + 10, y + 50);
}
export default function labeledStream(
    stream,
    label,
    iCascadeIndex,
    iCascadeCnt,
    {
        extract = false,
        width = 400, // Width of the output video
        height = 300, // Height of the output video
        fps = 25, // Video capture frames per second
        clearRect = false, // Clear the canvas every frame
        audioContext = null // Supply an external AudioContext (for audio effects)
    } = {}
) {
    const pos = positions[iCascadeIndex]
    let baseTime = performance.now()
    const FRAME_DELTA = 5 //diff between frames in ms
    const theMerger = new VideoStreamMerger({
        width, // Width of the output video
        height, // Height of the output video
        fps, // Video capture frames per second
        clearRect, // Clear the canvas every frame
        audioContext // Supply an external AudioContext (for audio effects)
    });
    if (extract) {
        const x = pos.x * theMerger.width
        const y = pos.y * theMerger.height
        const w = theMerger.width * pos.width
        const h = theMerger.height * pos.height
        console.log("EXTRACT", { x, y, w, h })
        theMerger.setOutputSize(pos.width * theMerger.width,
            pos.height * theMerger.height)
        theMerger.addStream(stream, {

            mute: false, // we don't want sound from the screen (if there is any)
            draw: function (ctx, frame, done) {

                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(frame,
                    x, y, w, h,
                    0, 0, w, h
                )
                drawLabel(ctx, { label: iCascadeIndex, fill: "red" })
                done();
            }
        });

    } else if (iCascadeIndex === -1) {
        theMerger.addStream(stream, {
            // x: pos.x*MULT, // position of the topleft corner
            // y: pos.y*MULT,
            // width: pos.width * MULT,
            // height: pos.width * MULT,
            // width: theMerger.width,
            // height: theMerger.height,
            mute: false, // we don't want sound from the screen (if there is any)
            draw: function (ctx, frame, done) {
                done();
            }
        });

    } else {

        theMerger.addStream(stream, {
            // x: pos.x*MULT, // position of the topleft corner
            // y: pos.y*MULT,
            // width: pos.width * MULT,
            // height: pos.width * MULT,
            // width: theMerger.width,
            // height: theMerger.height,
            mute: false, // we don't want sound from the screen (if there is any)
            draw: function (ctx, frame, done) {
                const nowTime = performance.now()
                if (nowTime - baseTime < FRAME_DELTA) {
                    done()
                    return
                } else {
                    // console.log("draw")
                    baseTime = nowTime
                }
                const x = pos.x * theMerger.width
                const y = pos.y * theMerger.height
                ctx.drawImage(frame,
                    x,
                    y,
                    pos.width * theMerger.width,
                    pos.height * theMerger.height);

                ctx.font = '48px serif';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.fillText(label, x + 10, y + 50);
                ctx.strokeText(label, x + 10, y + 50);
                done();
            }
        });
    }
    theMerger.start();
    // theMerger.result.merger = theMerger
    return theMerger;
}

