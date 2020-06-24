import VideoStreamMerger from "./video-stream-merger";
let theMerger = null
export default function labeledStream(
  stream,
  label,
  {
    width = 400, // Width of the output video
    height = 300, // Height of the output video
    fps = 10, // Video capture frames per second
    clearRect = true, // Clear the canvas every frame
    audioContext = null // Supply an external AudioContext (for audio effects)
  } = {}
) {
if(theMerger && theMerger.result) return theMerger
  theMerger = new VideoStreamMerger({
    width, // Width of the output video
    height, // Height of the output video
    fps, // Video capture frames per second
    clearRect, // Clear the canvas every frame
    audioContext // Supply an external AudioContext (for audio effects)
  });
  theMerger.addStream(stream, {
    x: 0, // position of the topleft corner
    y: 0,
    width: theMerger.width,
    height: theMerger.height,
    mute: false, // we don't want sound from the screen (if there is any)
    draw: function(ctx, frame, done) {
      ctx.drawImage(frame, 0, 0, theMerger.width, theMerger.height);
      ctx.font = "48px serif";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "boack";
      ctx.fillText(label, 10, 50);
      ctx.strokeText(label, 10, 50);
      done();
    }
  });
  theMerger.start();
  return theMerger;
}
