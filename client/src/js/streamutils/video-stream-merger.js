/* globals window */

module.exports = VideoStreamMerger

function VideoStreamMerger (opts) {
  if (!(this instanceof VideoStreamMerger)) return new VideoStreamMerger(opts)

  opts = opts || {}

  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioSupport = !!(AudioContext && (this._audioCtx = (opts.audioContext || new AudioContext())).createMediaStreamDestination)
  const canvasSupport = !!document.createElement('canvas').captureStream
  const supported = audioSupport && canvasSupport
  if (!supported) {
    throw new Error('Unsupported browser')
  }
  this.width = opts.width || 640
  this.height = opts.height || 480
  this.fps = opts.fps || 25
  this.clearRect = opts.clearRect === undefined ? true : opts.clearRect

  // Hidden canvas element for merging
  this._canvas = document.createElement('canvas')
  this._canvas.setAttribute('width', this.width)
  this._canvas.setAttribute('height', this.height)
  this._canvas.setAttribute('style', 'position:fixed; left: 110%; pointer-events: none') // Push off screen
  this._ctx = this._canvas.getContext('2d')

  this._streams = []
  this._frameCount = 0

  this._audioDestination = this._audioCtx.createMediaStreamDestination()

  // delay node for video sync
  this._videoSyncDelayNode = this._audioCtx.createDelay(5.0)
  this._videoSyncDelayNode.connect(this._audioDestination)

  this._setupConstantNode() // HACK for wowza #7, #10

  this.started = false
  this.result = null

  this._backgroundAudioHack()
}

VideoStreamMerger.prototype.setOutputSize = function (width, height) {
  this.width = width
  this.height = height
  this._canvas.setAttribute('width', this.width)
  this._canvas.setAttribute('height', this.height)
}

VideoStreamMerger.prototype.getAudioContext = function () {
  return this._audioCtx
}

VideoStreamMerger.prototype.getAudioDestination = function () {
  return this._audioDestination
}

VideoStreamMerger.prototype.getCanvasContext = function () {
  return this._ctx
}

VideoStreamMerger.prototype._backgroundAudioHack = function () {
  // stop browser from throttling timers by playing almost-silent audio
  const source = this._audioCtx.createConstantSource()
  const gainNode = this._audioCtx.createGain()
  gainNode.gain.value = 0.001 // required to prevent popping on start
  source.connect(gainNode)
  gainNode.connect(this._audioCtx.destination)
  source.start()
}

VideoStreamMerger.prototype._setupConstantNode = function () {
  const constantAudioNode = this._audioCtx.createConstantSource()
  constantAudioNode.start()

  const gain = this._audioCtx.createGain() // gain node prevents quality drop
  gain.gain.value = 0

  constantAudioNode.connect(gain)
  gain.connect(this._videoSyncDelayNode)
}

VideoStreamMerger.prototype.updateIndex = function (mediaStream, index) {
  if (typeof mediaStream === 'string') {
    mediaStream = {
      id: mediaStream
    }
  }

  index = index == null ? 0 : index

  for (let i = 0; i < this._streams.length; i++) {
    if (mediaStream.id === this._streams[i].id) {
      this._streams[i].index = index
    }
  }
  this._sortStreams()
}

VideoStreamMerger.prototype._sortStreams = function () {
  this._streams = this._streams.sort((a, b) => {
    return a.index - b.index
  })
}

// convenience function for adding a media element
VideoStreamMerger.prototype.addMediaElement = function (id, element, opts) {
  opts = opts || {}

  opts.x = opts.x || 0
  opts.y = opts.y || 0
  opts.width = opts.width
  opts.height = opts.height
  opts.mute = opts.mute || opts.muted || false

  opts.oldDraw = opts.draw
  opts.oldAudioEffect = opts.audioEffect

  if (element.tagName === 'VIDEO' || element.tagName === 'IMG') {
    opts.draw = (ctx, _, done) => {
      if (opts.oldDraw) {
        opts.oldDraw(ctx, element, done)
      } else {
        // default draw function
        const width = opts.width == null ? this.width : opts.width
        const height = opts.height == null ? this.height : opts.height
        ctx.drawImage(element, opts.x, opts.y, width, height)
        done()
      }
    }
  } else {
    opts.draw = null
  }

  if (!opts.mute) {
    const audioSource = element._mediaElementSource || this.getAudioContext().createMediaElementSource(element)
    element._mediaElementSource = audioSource // can only make one source per element, so store it for later (ties the source to the element's garbage collection)
    audioSource.connect(this.getAudioContext().destination) // play audio from original element

    const gainNode = this.getAudioContext().createGain()
    audioSource.connect(gainNode)
    if (element.muted) {
      // keep the element "muted" while having audio on the merger
      element.muted = false
      element.volume = 0.001
      gainNode.gain.value = 1000
    } else {
      gainNode.gain.value = 1
    }
    opts.audioEffect = (_, destination) => {
      if (opts.oldAudioEffect) {
        opts.oldAudioEffect(gainNode, destination)
      } else {
        gainNode.connect(destination)
      }
    }
    opts.oldAudioEffect = null
  }

  this.addStream(id, opts)
}

VideoStreamMerger.prototype.addStream = function (mediaStream, opts) {
  if (typeof mediaStream === 'string') {
    return this._addData(mediaStream, opts)
  }

  opts = opts || {}
  const stream = {}

  stream.isData = false
  stream.x = opts.x || 0
  stream.y = opts.y || 0
  stream.width = opts.width
  stream.height = opts.height
  stream.draw = opts.draw || null
  stream.mute = opts.mute || opts.muted || false
  stream.audioEffect = opts.audioEffect || null
  stream.index = opts.index == null ? 0 : opts.index
  stream.hasVideo = mediaStream.getVideoTracks().length > 0

  // If it is the same MediaStream, we can reuse our video element (and ignore sound)
  let videoElement = null
  for (let i = 0; i < this._streams.length; i++) {
    if (this._streams[i].id === mediaStream.id) {
      videoElement = this._streams[i].element
    }
  }

  if (!videoElement) {
    videoElement = document.createElement('video')
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.srcObject = mediaStream
    videoElement.setAttribute('style', 'position:fixed; left: 0px; top:0px; pointer-events: none; opacity:0;')
    document.body.appendChild(videoElement)

    if (!stream.mute) {
      stream.audioSource = this._audioCtx.createMediaStreamSource(mediaStream)
      stream.audioOutput = this._audioCtx.createGain() // Intermediate gain node
      stream.audioOutput.gain.value = 1
      if (stream.audioEffect) {
        stream.audioEffect(stream.audioSource, stream.audioOutput)
      } else {
        stream.audioSource.connect(stream.audioOutput) // Default is direct connect
      }
      stream.audioOutput.connect(this._videoSyncDelayNode)
    }
  }

  stream.element = videoElement
  stream.id = mediaStream.id || null
  this._streams.push(stream)
  this._sortStreams()
}

VideoStreamMerger.prototype.removeStream = function (mediaStream) {
  if (typeof mediaStream === 'string') {
    mediaStream = {
      id: mediaStream
    }
  }

  for (let i = 0; i < this._streams.length; i++) {
    if (mediaStream.id === this._streams[i].id) {
      if (this._streams[i].audioSource) {
        this._streams[i].audioSource = null
      }
      if (this._streams[i].audioOutput) {
        this._streams[i].audioOutput.disconnect(this._videoSyncDelayNode)
        this._streams[i].audioOutput = null
      }

      this._streams[i] = null
      this._streams.splice(i, 1)
      i--
    }
  }
}

VideoStreamMerger.prototype._addData = function (key, opts) {
  opts = opts || {}
  const stream = {}

  stream.isData = true
  stream.draw = opts.draw || null
  stream.audioEffect = opts.audioEffect || null
  stream.id = key
  stream.element = null
  stream.index = opts.index == null ? 0 : opts.index

  if (stream.audioEffect) {
    stream.audioOutput = this._audioCtx.createGain() // Intermediate gain node
    stream.audioOutput.gain.value = 1
    stream.audioEffect(null, stream.audioOutput)
    stream.audioOutput.connect(this._videoSyncDelayNode)
  }

  this._streams.push(stream)
  this._sortStreams()
}

// Wrapper around requestAnimationFrame and setInterval to avoid background throttling
VideoStreamMerger.prototype._requestAnimationFrame = function (callback) {
  let fired = false
  const interval = setInterval(() => {
    if (!fired && document.hidden) {
      fired = true
      clearInterval(interval)
      callback()
    }
  }, 1000 / this.fps)
  requestAnimationFrame(() => {
    if (!fired) {
      fired = true
      clearInterval(interval)
      callback()
    }
  })
}

VideoStreamMerger.prototype.start = function () {
  this.started = true
  this._requestAnimationFrame(this._draw.bind(this))

  // Add video
  this.result = this._canvas.captureStream(this.fps)

  // Remove "dead" audio track
  const deadTrack = this.result.getAudioTracks()[0]
  if (deadTrack) this.result.removeTrack(deadTrack)

  // Add audio
  const audioTracks = this._audioDestination.stream.getAudioTracks()
  this.result.addTrack(audioTracks[0])
}

VideoStreamMerger.prototype._updateAudioDelay = function (delayInMs) {
  this._videoSyncDelayNode.delayTime.setValueAtTime(delayInMs / 1000, this._audioCtx.currentTime)
}

VideoStreamMerger.prototype._draw = function () {
  if (!this.started) return

  this._frameCount++

  // update video processing delay every 60 frames
  let t0 = null
  if (this._frameCount % 60 === 0) {
    t0 = performance.now()
  }

  let awaiting = this._streams.length
  const done = () => {
    awaiting--
    if (awaiting <= 0) {
      if (this._frameCount % 60 === 0) {
        const t1 = performance.now()
        this._updateAudioDelay(t1 - t0)
      }
      this._requestAnimationFrame(this._draw.bind(this))
    }
  }

  if (this.clearRect) {
    this._ctx.clearRect(0, 0, this.width, this.height)
  }
  this._streams.forEach((stream) => {
    if (stream.draw) { // custom frame transform
      stream.draw(this._ctx, stream.element, done)
    } else if (!stream.isData && stream.hasVideo) {
      // default draw function
      const width = stream.width == null ? this.width : stream.width
      const height = stream.height == null ? this.height : stream.height
      this._ctx.drawImage(stream.element, stream.x, stream.y, width, height)
      done()
    } else {
      done()
    }
  })

  if (this._streams.length === 0) done()
}

VideoStreamMerger.prototype.destroy = function () {
  this.started = false

  this._canvas = null
  this._ctx = null
  this._streams = []
  this._audioCtx.close()
  this._audioCtx = null
  this._audioDestination = null
  this._videoSyncDelayNode = null

  this.result.getTracks().forEach((t) => {
    t.stop()
  })
  this.result = null
}