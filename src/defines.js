export const APP_STATES = Object.freeze({
  LOGGED_OUT: 'LOGGED_OUT',
  LOGGED_IN: 'LOGGED_IN',
  CALL_RINGING: 'CALL_RINGING',
  CALL_ANSWERED: 'CALL_ANSWERED',
  AFTER_CALL_WORK: 'AFTER_CALL_WORK',
  CALL_DIALING: 'CALL_DIALING'
})
export const CALL_TERMINATION = Object.freeze({
  ANSWERED: 'Answered',
  NOT_ANSWERED: 'Not Answered',
  MISSED: 'Missed'
})
export const CALL_DIRECTION = Object.freeze({
  INBOUND: 'inbound',
  OUTBOUND: 'outbound'
})

export const CALL_NATURE = Object.freeze({
  DIALER: '2',
})


export const AGENT_STATES = Object.freeze({
  UNKNOWN: 0,
  LOG_IN: 1,
  LOG_OUT: 2,
  NOT_READY: 3,
  READY: 4,
  WORK_NOT_READY: 5,
  WORK_READY: 6,
  BUSY: 7,
  Text: {
    '0': 'UNKNOWN',
    '1': 'LOG_IN',
    '2': 'LOG_OUT',
    '3': 'NOT_READY',
    '4': 'READY',
    '5': 'WORK_NOT_READY',
    '6': 'WORK_READY',
    '7': 'BUSY'
  }
})

export const TIMER_STATES = Object.freeze({
  CONTROL: {
    START: 1,
    STOP: 0,
    PAUSE: 2,
  },
  EVENTS: {
    STARTED: 1,
    STOPPED: 0,
    PAUSED: 2,
    EXPIRED: 3
  }


})
// States according to Avaya: [Login, Ready, Not Ready, Wrap-Up, Pending States]
export const CALL_STATES = Object.freeze({
  IDLE: '96',
  RINGING: '97',
  TALKING: '98',
  HELD: '99',
  BRIDGED: '100',
  INUSE: '101',
  DROPPED: '102',
  UNKNOWN: '103',
  CREATED: '106',
  Text: {
    '96': 'IDLE',
    '97': 'RINGING',
    '98': 'TALKING',
    '99': 'HELD',
    '100': ' BRIDGED',
    '101': 'INUSE',
    '102': 'DROPPED',
    '103': 'UNKNOWN',
    '106': 'CREATED'
  }
})

export const CONF_CALL_STATES = Object.freeze({})

export const CONNECTION_STATES = Object.freeze({
  CONNECTED: 'CONNECTED',
  CONNECTING: 'CONNECTING',
  DROPPED: 'DROPPED'
})

export const MESSAGE_TYPES = Object.freeze({
  CTRL_REQ: 'ZC',
  CTRL_RES: 'ZR',

  TELE_CMD: 'TC',
  TELE_RES: 'TR',

  EVNT_CMD: 'EC',
  EVNT_RES: 'ER'
})

export const SocketEvents = Object.freeze({
  GET_SESSION: 'GETSESSION',

  MONITOR_STATION: 'MONDEV',
  MONITOR_END: 'MONEND',
  MAKE_CALL: 'MAKECALL',
  ANSWER_CALL: 'ANSCALL',
  REJECT_CALL: 'REJCALL',
  DROP_CALL: 'CONNCLR',
  HOLD_CALL: 'HOLDCALL',
  RETRIEVE_CALL: 'RETRCALL',
  CONSULT_CALL: 'CONSTCALL',
  RECONNECT_CALL: 'RECONCALL',
  TRANSFER_CALL: 'XFERCALL',
  CONFERENCE_CALL: 'CONFCALL',
  AGENT_LOGIN: 'AGTLOGON',
  AGENT_LOGOFF: 'AGTLOGOFF',
  SET_AGENT_STATE: 'SETAGTSTATE',
  QUERY_AGENT_STATE: 'QRYAGTSTATE',
  QUERY_AGENT_LOGIN: 'QRYAGTLOGIN',

  INCOMING_CALL_RINGING: 'ICALLRING',
  INCOMING_CALL_DISCONNECTED: 'ICALLDISC',
  INCOMING_CALL_TALKING: 'ICALLTALK',
  INCOMING_CALL_HELD: 'ICALLHLD',

  CONFERENCE_CALL_RINGING: 'CONCALLRING',
  CONFERENCE_CALL_DISCONNECTED: 'CONCALLDISC',
  CONFERENCE_CALL_TALKING: 'CONCALLTALK'
})
