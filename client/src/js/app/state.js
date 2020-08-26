const state = {
    title: 'This title',
    changeMedia: false,
    mediaDevices: [],
    AppState: {
        room: '',
        clientId: '',
        callWindow: '',
        callFrom: '',
        localSrc: null,
        peerSrc: null,

    },
    diags: [],
    currentWindow: "main",
    isCascading: false,
    attrs: {
        id: 'undefined',
        name: "undefined",
        role: "undefined",
        room: "main",
        status: "disconnected"
    },
    index: -1, //index in cascade. -1 if not in cascade
    nextMember: null,
    members: [], //array of member session numbers
    cascade: [], //array of session numbers in order
    callInfo: {},
    sessions: {},
    allSessions: [],
    users: {}, // keyed list of users with their data
    peerEvents: 0,
    _message: {
        text: '',
        delay: 1000
    },
    streams: {
        empty: null,
        local: null,
        toControl: null,
        cascade: null,

    },

    events: [],
    lastEvent: {},
    control: null,
    leader: null,
    otherRoles: {

    }
}
export default state
