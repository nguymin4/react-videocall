import VideoStreamMerger from "./video-stream-merger";
export const positions = [
    { "x": 0, "y": 0, "width": .5, "height": .5 },
    { "x": .5, "y": 0, "width": .5, "height": .5 },
    { "x": 0, "y": .5, "width": .5, "height": .5 },
    { "x": .5, "y": .5, "width": .5, "height": .5 }]
export default function labeledStream(
    stream,
    label,
    iCascadeIndex,
    iCascadeCnt,    
  {
        width = 400, // Width of the output video
        height = 300, // Height of the output video
        fps = 10, // Video capture frames per second
        clearRect = true, // Clear the canvas every frame
        audioContext = null // Supply an external AudioContext (for audio effects)
    } = {}
) {
    const pos = positions[iCascadeIndex]
    const theMerger = new VideoStreamMerger({
        width, // Width of the output video
        height, // Height of the output video
        fps, // Video capture frames per second
        clearRect, // Clear the canvas every frame
        audioContext // Supply an external AudioContext (for audio effects)
    });
    theMerger.addStream(stream, {
        // x: pos.x*MULT, // position of the topleft corner
        // y: pos.y*MULT,
        // width: pos.width * MULT,
        // height: pos.width * MULT,
        // width: theMerger.width,
        // height: theMerger.height,
        mute: false, // we don't want sound from the screen (if there is any)
        draw: function (ctx, frame, done) {
            ctx.drawImage(frame, 
                pos.x*theMerger.width, 
                pos.y*theMerger.height, 
                pos.width*theMerger.width, 
                pos.height*theMerger.height);

            ctx.font = "48px serif";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "boack";
            ctx.fillText(label, 10, 50);
            ctx.strokeText(label, 10, 50);
            done();
        }
    });
    theMerger.start();
    theMerger.result.merger = theMerger
    return theMerger;
}

