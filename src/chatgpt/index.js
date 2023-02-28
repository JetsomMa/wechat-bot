import { ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { oraPromise } from 'ora'
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数

let chatOption = {};
const chatGPT = new ChatGPTUnofficialProxyAPI({
  accessToken: env.OPENAI_ACCESS_TOKEN
})

export async function getChatGPTReply({content, contactId}) {
  console.log('🚀🚀🚀 / prompt', content)
  
  const { conversationId, text, parentMessageId } = await oraPromise(
    chatGPT.sendMessage(content, {
      conversationId: chatOption.conversationId,
      parentMessageId: chatOption.parentMessageId
    }),
    {
      text: content
    }
  )

  chatOption = {
    conversationId,
    parentMessageId
  }

  console.log('🚀🚀🚀 response: ', conversationId, text);
  return text;
}
