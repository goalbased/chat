/* eslint-disable */
import moment from 'moment'

function Session() {
    this.token = '000000';
    this.sessionId = '';
    this.connectedStatus = 'idel';
    this.clientId = '';
    this.supportId = 'michael_mao@trendmicro.com';
    this.seq = '';
    this.version = '';
    this.connectedStartTime = '';
    this.messages = [];
    this.commands = {};
    this.currentCommandSeq = 0;
}

export const state = {
    sessions: []
}

var firstSession = new Session();
state.sessions.push(firstSession);

export const mutations = {
    set_token(state, payload) {
        state.sessions[0].token = payload.token
        state.sessions[0].sessionId = payload.sessionId
        state.sessions[0].connectedStatus = 'Waiting for Client Connect'
    },
    get_token(state, payload) {
        state.sessions[0].connectedStatus = 'Registing token id'
    },
    sendMsg(state, payload) {
        var message = new Message()
        var now = new Date()
        message.timestamp = now
        message.formatedTime = moment(now).format('YYYY/MM/DD hh:mm')
        message.content = payload.content.content.wording
        message.arrived = false
        message.seq = payload.seq
        state.sessions[0].messages.push(message)
        state.sessions[0].commands[payload.seq] = payload        
        state.sessions[0].commands[payload.seq].status = false
        state.sessions[0].currentCommandSeq++

        //test code, can get client message without server
        // var m = new Message()
        // m.timestamp = ''
        // m.content = 'Hello, I am Michael and I need help. Could you help me cdoing'
        // m.fromClient = true
        // state.sessions[0].messages.push(m)
    },
    getStatus(state, payload) {
        //client grab token 
        if ('initArg' in payload) {
            state.sessions[0].connectedStatus = 'Connected'
            state.sessions[0].version = payload.initArg.version
            state.sessions[0].connectedStartTime = moment().format('YYYY-MM-DD hh:mm:ss')
        }

        if ('cmdStatus' in payload) {
            for (var prop in payload.cmdStatus) {
                var content = payload.cmdStatus[prop].content
                if (content.hasOwnProperty('wording')) {
                    var message = new Message()
                    message.timestamp = payload.cmdStatus[prop].created
                    message.content = content.wording
                    message.fromClient = true
                    message.formatedTime = moment(message.timestamp * 1000).format('YYYY/MM/DD hh:mm')
                    message.seq = prop
                    state.sessions[0].messages.push(message)
                }

                if (content.hasOwnProperty('asSeqStatus')) {
                    if (content.asSeqStatus == 'OK' && prop < 1000) {
                        for (var i = 0; i < state.sessions[0].messages.length; i++) {
                            if (state.sessions[0].messages[i].seq == prop) {
                                state.sessions[0].messages[i].arrived = true
                            }
                        }
                        state.sessions[0].commands[prop].status = true
                    }
                }
            }
        }
    },
    update_connect_status(state, status) {
        state.status = status
    },
}

function Message() {
    this.timestamp = ''
    this.content = ''
    this.fromClient = false
    this.formatedTime = ''
    this.arrived = true
    this.seq = -1
}
