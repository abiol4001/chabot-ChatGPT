import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { MainContainer, ChatContainer, Message, MessageList, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'

const API_KEY = process.env.REACT_APP_API_KEY;
function App() {


  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT",
      sender: "ChatGPT",
    }
  ])


  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]

    setMessages(newMessages)

    setTyping(true)

    await processMessageToChatGPT(newMessages)
  }

  async function processMessageToChatGPT(chatMessages) {

    let apiMessages = chatMessages.map(messageObject => {
      let role = ""
      if (messageObject.sender === "ChatGPT") {
        role = "assistant"
      } else {
        role = "user"
      }
      return {role: role, content: messageObject.message}
    })

    const systemMessage = {
      role: "system",
      content: "Explain all concepts professionally"
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify(apiRequestBody)
    })
    .then(data => data.json())
    .then(result => result.choices[0].message.content)
  }

  return (
    <div className='App'>
      <div style={{position: "relative", height: "800px", width: "700px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={typing && <TypingIndicator content="ChatGPT is typing..." /> }>
              {messages.map((message, i) => (
                <Message key={i} model={message} /> 
              ))}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App