import MediaDevice from './MediaDevice'
/**
 * Manage a media device singleton 
 */
class MediaSingleton {
    static device = null
    static count = 0
    static stream = null
    constructor(){
        MediaSingleton.count++
        if(!MediaSingleton.device){
            MediaSingleton.device = new MediaDevice()
            MediaSingleton.device.on('stream',(stream) =>{
                MediaSingleton.stream = stream
                window.XD= MediaSingleton.device
            })
        }
        this.device = MediaSingleton.device
    }
    on(event,cb) {
        if(MediaSingleton.stream) {this.steam = MediaSingleton.stream
            return cb(MediaSingleton.stream)
        }
        MediaSingleton.device.on('stream',(stream)=>{
            this.stream = stream
            cb(stream)
        })
        return this
    }

    start() {
        if(MediaSingleton.count === 1 )
        return this.device.start()
        return this
    }
    toggle(type,on) {
        return this.device.toggle(type,on)
    }
    stop(){
        if(--MediaSingleton.count) return
        MediaSingleton.device = MediaSingleton.stream = null
        return this.device.stop()
    }
    
}

export default MediaSingleton;

