'use client'
import Image from "next/image"
import { useEffect, useRef, useState } from 'react'
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import SendIcon from "@mui/icons-material/Send"
import "./globals.css"


export default function Home() {
  const [messages, setMessages] = useState ([{
    role: 'assistant',
    content: `Hi! I'm an AI-powered career counselor, how can I assist you today?`,
  }])

  const [message, setMessage] = useState ('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const autoScroll = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth'})
  }

  useEffect(() => {
    autoScroll()
  }, [messages])

  const sendMessage = async() => {
    if (!message.trim() || isLoading) {
      return
    };
    setIsLoading(true)

    setMessage('')
    setMessages((messages)=>[
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content: ''},

    ])
    const response = fetch('api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}])
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream: true})
        setMessages((messages)=>{
          let lastMessage = messages[messages.length-1]
          let otherMessages = messages.slice(0, messages.length-1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            }
          ]
        })
        return reader.read().then(processText)
      })
    })
    
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }


  return (
    <Box className="background">
      <Box 
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justify-content="center"
        alignItems="center"
        padding="10px"
      >
        <Box
          display="flex"
          flexDirection="row"
          gap="5px"
          justify-content="center"
          alignItems="center">
          <Typography
            sx={{
              fontFamily: 'sans-serif',
              fontSize: '1.2cm',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 1px black',
            }}
          >GAIDO</Typography>
          <Typography
            sx={{
              fontFamily: 'sans-serif',
              fontSize: '1.2cm',
              fontWeight: 'bold',
              color: 'black',
              textShadow: '2px 2px 1px white',
            }}
          >AI</Typography>
        </Box>
        <Stack
          direction="column"
          width="600px"
          height="85vh"
          border="2px solid white"
          borderRadius="3%"
          p={2}
          spacing={3}
          sx={{
            backdropFilter: 'blur(5px)'
          }}
        >
          <Stack id="messages"
            direction="column"
            spacing={2}
            overflow="auto"
            minHeight="85%"
            maxHeight="85%"
          >
            {
              messages.map((message, index)=>(
                <Box 
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role=== 'assistant' ? 'flex-start' : 'flex-end'
                  }
                >
                  <Box
                    bgcolor={
                      message.role==='assistant' ? 'primary.main' : 'secondary.main'
                    }
                    color='white'
                    borderRadius={12}
                    maxWidth="80%"
                    p={3}
                    boxShadow="1px 1px 1px black"
                  >
                    {message.content}
                  </Box>
                </Box>
              ))
            }
            <div ref={messagesEndRef} />
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            width="100%"
          >
            <Box bgcolor='white' width="40vw">
              <TextField
                variant="filled"
                label="Type Message"
                fullWidth
                sx={{
                  color: 'white',
                  border: '2px solid black',
                }}
                value={message}
                onKeyPress={handleKeyPress}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
              />
            </Box>
            <IconButton
              sx={{
                width: '80px',
                bgcolor: '#1872f6',
                borderRadius: '100%',
                color: 'white',
                fontWeight: 'bold',
                opacity: '0.8',
                ':hover': {
                  bgcolor: 'white',
                  color: '#1872f6',
                  scale: '1.1'
                }
              }}
              onClick={sendMessage}
              
              >
                <SendIcon/>
              </IconButton>
          </Stack>
        </Stack>
        <Typography fontSize="small" textAlign="center" color="white" p="">POWERED BY <a href="https://openai.com/">OpenAI</a></Typography>
      </Box>
    </Box>
      
    
  )
}
