import MediaDevice from './MediaDevice'
/**
 * Manage a media device singleton 
 */
class MediaSingleton {
    static device = null
    static count = 0
    constructor(){
        MediaSingleton.count++
        if(!MediaSingleton.device){
            MediaSingleton.device = new MediaDevice()
        }
        this.device = MediaSingleton.device
    }
    on(event,cb) {
        return this.device.on(event,cb)
    }
    start() {
        return this.device.start()
    }
    toggle(type,on) {
        return this.device.toggle(type,on)
    }
    stop(){
        if(--MediaSingleton.count) return
        return this.device.stop()
    }
    
}

export default MediaSingleton;

