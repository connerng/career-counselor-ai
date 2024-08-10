'use client'
import Image from "next/image"
import {useState} from 'react'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import "./globals.css"


export default function Home() {
  const [messages, setMessages] = useState ([{
    role: 'assistant',
    content: `Hi! I'm an AI-powered support agent, how can I assist you today?`,
  }])

  const [message, setMessage] = useState ('')

  const sendMessage = async() => {
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
        <Typography
          sx={{
            fontSize: '1cm',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '1px 1px 1px black',
          }}
        >AI CHATBOT</Typography>
        <Stack
          direction="column"
          width="600px"
          height="700px"
          border="2px solid white"
          borderRadius="3%"
          p={2}
          spacing={3}
          sx={{
            backdropFilter: 'blur(5px)'
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
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
                    borderRadius={16}
                    p={3}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))
            }
          </Stack>
          <Stack
            direction="row"
            spacing={2}
          >
            <Box bgcolor='white' width="70vw">
              <TextField
                variant="filled"
                label="Type Message"
                fullWidth
                sx={{
                  color: 'white',
                  border: '2px solid black'
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Box>
            <Button 
              variant="contained"
              sx={{
                backgroundColor: 'black'
              }}
              onClick={sendMessage}
              >Send</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
      
    
  )
}
