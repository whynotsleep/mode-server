const fs = require('fs')
const {
    dateFormat
} = require('./utils')

const ACTION = {
    reset: '\033[0m', // 关闭所有属性
    highlight: '\033[1m', // 设置高亮度
    italic: '\x1B[3m', // 斜体
    underline: '\x1B[4m', // 下划线
    glint: '\033[5m', // 闪烁
    reverse: '\x1B[7m', // 反显
    hidden: '\x1B[8m', // 隐藏
    up: '\033[nA', //光标上移n行
    down: '\033[nB', //光标下移n行
    right: '\033[nC', //光标右移n列
    left: '\033[nD', //光标左移n列
    move: '\033[y;xH', //移动光标到坐标x,y位置
    clear: '\033[2J', //清屏
    clearEnd: '\033[K', //清除从光标到行尾的内容
    black: '\x1B[30m', //黑
    red: '\x1B[31m', //红
    green: '\x1B[32m', //绿
    yellow: '\x1B[33m', //黄
    blue: '\x1B[34m', //蓝
    purple: '\x1B[35m', //紫
    darkGreen: '\x1B[36m', //深绿
    white: '\x1B[37m', //白
    blackBg: '\x1B[40m', //背景色 黑
    redBg: '\x1B[41m', //背景色 红
    greenBg: '\x1B[42m', //背景色 绿
    yellowBg: '\x1B[43m', //背景色 黄
    blueBg: '\x1B[44m', //背景色 蓝
    purpleBg: '\x1B[45m', //背景色 紫
    darkGreenBg: '\x1B[46m', //背景色 深绿
    whiteBg: '\x1B[47m' //背景色 白
}

const PintType = {
    info: 'white',
    success: 'green',
    error: 'red',
    warn: 'purple'
}

class Print {
    constructor(option = {}) {
        this.path =  option.path //日志路径
        this.errorPath =  option.errorPath //错误日志路径
    }

    out() {
        console.log(...arguments)
    }

    error(msg) {
        this.out(ACTION.red, msg, ACTION.reset)
    }

    success(msg) {
        this.out(ACTION.green, msg, ACTION.reset)
    }

    date() {
        this.out(ACTION.yellow, dateFormat())
    }

    write({path, msg, date=true, newline=true}) {
        if(date) {
            msg = dateFormat() + ' ' + msg
        }
        if(newline) {
            msg += '\r\n'
        }
        fs.appendFile(path, msg, err => {
            if(err) {
               console.error(err)
            }
        })
    }

    log({type='success', msg='', date=true, newline=true}) {
        const msgAction = ACTION[PintType[type]]
        const args = [msgAction, msg]

        if(date) {
            args.unshift(dateFormat())
            args.unshift(ACTION.yellow)
        }
        if(newline) {
            args.push(ACTION.reset)
        }
        
        this.out(...args)
    }

    all({type, msg, date=true, newline=true}) {
        const path = type === 'error' ? this.errorPath : this.path

        this.log({type, msg, date, newline})
        this.write({msg, path, date, newline })
    }
}

module.exports = {
    ACTION,
    Print
}