import MediaDevice from './MediaDevice'
/**
 * Manage a media device singleton 
 */
class MediaSingleton extends MediaDevice {
    start() {
        return super.start()
    }
    toggle(type,on) {
        return super.toggle(type,on)
    }
    stop(){
        return super.stop()
    }
    
}

export default MediaSingleton;

