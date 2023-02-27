import { ChatGPTAPI } from 'chatgpt';
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数

let chatOption = {};
const chatGPT = new ChatGPTAPI({
  apiKey: env.OPENAI_API_KEY,
  // completionParams: {
  //   model: 'text-chat-davinci-002-sh-alpha-aoruigiofdj83',
  // },
});

export async function getOpenAiReply({content, contactId}) {
  console.log('🚀🚀🚀 / prompt', content)
  
  const { conversationId, text, id } = await chatGPT.sendMessage(
    content,
    chatOption[contactId]
  );
  chatOption = {
    [contactId]: {
      conversationId,
      parentMessageId: id,
    },
  };

  console.log('🚀🚀🚀 response: ', conversationId, text);
  return text;
}
