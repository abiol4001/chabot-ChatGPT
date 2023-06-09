import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  Message,
  MessageList,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = import.meta.env.VITE_SOME_KEY;


const messageHistory = JSON.parse(localStorage.getItem('messageHistory'))

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(messageHistory || [
    {
      message: "Hello, I am ChatGPT",
      sender: "ChatGPT",
    },
  ]);
  

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setTyping(true);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    try {
      let apiMessages = chatMessages.map((messageObject) => {
        let role = "";
        if (messageObject.sender === "ChatGPT") {
          role = "assistant";
        } else {
          role = "user";
        }
        return { role: role, content: messageObject.message };
      });

      const systemMessage = {
        role: "system",
        content: "Explain all concepts professionally",
      };

      const apiRequestBody = {
        model: "gpt-3.5-turbo",
        messages: [systemMessage, ...apiMessages],
      };

      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + API_KEY,
        },
        body: JSON.stringify(apiRequestBody),
      })
        .then((data) => data.json())
        .then((data) => {
          // console.log(data.choices[0].message.content);
          setMessages([
            ...chatMessages,
            {
              message: data.choices[0].message.content,
              sender: "ChatGPT",
            },
          ])
        })
        .catch((err) => console.log(err));
      setTyping(false);
    } catch (error) {
      console.log(error)
    }
  }
  localStorage.setItem("messageHistory", JSON.stringify(messages));

  function clearHistory() {
    localStorage.clear()
    location.reload()
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "750px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                typing && <TypingIndicator content="ChatGPT is typing..." />
              }
            >
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
          <button type="reset" onClick={clearHistory} style={{background: "skyblue", color: "grey", fontWeight: "300", marginTop: "10px"}}>Clear</button>
      </div>
    </div>
  );
}

export default App;
