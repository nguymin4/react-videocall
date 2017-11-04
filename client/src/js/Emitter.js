class Emitter {
  constructor() {
    this._events = {};
  }

  emit(event) {
    if (this._events[event]) {
      const args = Array.prototype.slice.call(arguments, 1);
      this._events[event].forEach(fn => fn(...args));
    }
    return this;
  }

  on(event, fn) {
    if (this._events[event]) this._events[event].push(fn);
    else this._events[event] = [fn];
    return this;
  }

  off(event, fn) {
    if (!event) this._event = {};
    else if (fn && typeof fn === 'function') {
      const listeners = this._events[event];
      const index = listeners.findIndex(_fn => _fn === fn);
      listeners.splice(index, 1);
    } else this._events[event] = [];
    return this;
  }
}

export default Emitter;
