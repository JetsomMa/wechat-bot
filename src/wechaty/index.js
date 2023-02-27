import { WechatyBuilder, ScanStatus } from 'wechaty'
import qrTerminal from 'qrcode-terminal'
import { getOpenAiReply as getReply } from '../openai/index.js'
import { botName } from '../../config.js'

let bot = {};
initProject()
// 扫码
function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
    console.log('onScan:', qrcodeImageUrl, ScanStatus[status], status)
  } else {
    console.log('onScan: %s(%s)', ScanStatus[status], status)
  }
}

// 登录
function onLogin(user) {
  console.log(`${user} has logged in`)
  const date = new Date()
  console.log(`Current time:${date}`)
  console.log(`Automatic robot chat mode has been activated`)
}

// 登出
function onLogout(user) {
  console.log(`${user} has logged out`)
}

// 收到好友请求
async function onFriendShip(friendship) {
  const frienddShipRe = /chatgpt|chat/
  if (friendship.type() === 2) {
    if (frienddShipRe.test(friendship.hello())) {
      await friendship.accept()
    }
  }
}

/**
 * 消息发送
 * @param msg
 * @param isSharding
 * @returns {Promise<void>}
 */
const pre = `[旺柴][chatgpt response][旺柴] \n`
const chatMap = new Map()
const startTime = new Date().getTime();
let contactSelf = {}
async function onMessage(msg) {
  // 避免重复发送
  let msgTime = msg.date().getTime()
  if (msgTime < startTime) {
    return;
  }

  const contact = msg.talker() // 发消息人
  if (msg.self()) {
    contactSelf = contact
  }

  const receiver = msg.to() // 消息接收人
  const content = msg.text() // 消息内容
  const room = msg.room() // 是否是群消息
  const roomName = (await room?.topic()) || null // 群名称
  const aliasName = await contact.alias() // 备注名称
  const name = await contact.name() // 微信名称
  const isText = msg.type() === bot.Message.Type.Text // 消息类型是否为文本
  // TODO 你们可以根据自己的需求修改这里的逻辑
  if (isText && content) {
    let notification = `发送“${botName}【问题】”可开启chatgpt智能会话，例如“${botName} 老婆和我妈同时掉河里，先救谁？”`
    const callChat = content.includes(`${botName}`) // 艾特了机器人
    try {
      // 区分群聊和私聊
      if (callChat) {
        if(content == notification || content.includes("[chatgpt response]")){
          return 
        }

        let contentString = content.replace(`${botName}`, '').trim()
        if(room){
          await room.say(pre + await getReply(contentString))
          return
        } else {
          if(!chatMap.has(name)){
            chatMap.set(name, new Date().getTime())
          }
          await contact.say(pre + await getReply(contentString))
        }
      } else {
        let nowTime = new Date().getTime()
        for(let name of chatMap.keys()){
          if(nowTime - chatMap.get(name) > 1000 * 60 * 60 * 24){
            chatMap.delete(name)
          }
        }

        if(!room){
          if(!chatMap.has(name)){
            chatMap.set(name, new Date().getTime())
            await contact.say(notification)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
}

// 初始化机器人
async function initProject() {
  bot = WechatyBuilder.build({
    name: 'WechatEveryDay',
    puppet: 'wechaty-puppet-wechat', // 如果有token，记得更换对应的puppet
    puppetOptions: {
      uos: true,
      stealthless: true
    },
  });

  // 扫码
  bot.on('scan', onScan)
  // 登录
  bot.on('login', onLogin)
  // 登出
  bot.on('logout', onLogout)
  // 收到消息
  bot.on('message', onMessage)
  // 添加好友
  bot.on('friendship', onFriendShip)

  // 启动微信机器人
  bot
    .start()
    .then(() => console.log('Start to log in wechat...'))
    .catch((e) => console.error(e))
}
