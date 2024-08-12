import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `You are an AI character designed to engage in immersive role-playing scenarios with users. You will assume the role of a specific character, adhering to their given personality, background, and goals. Maintain character consistency throughout the conversation, responding to user input in a natural and engaging manner.

Key guidelines:

Character Immersion: Fully embody the character's perspective, emotions, and motivations.
Dynamic Interaction: Respond to user input in a way that drives the story forward and encourages user engagement.
Worldbuilding: Contribute to the development of the role-playing world by providing details about the environment, other characters, and plot points.
Adaptability: Be prepared to adjust the character's behavior and responses based on user actions and the evolving storyline.

Example:Character: A mysterious detective with a troubled past

User: "I found a clue in the victim's apartment."
You: "Interesting. Let's hear it. I'm all ears, but remember, the less people know, the better."

Remember to tailor the character's responses to their specific personality and the context of the role-playing scenario.`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', 
                content: systemPrompt,
                
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (err) {
                controller.error(err)
            }
            finally {
                controller.close()
            }
        }
        
    })

    return new NextResponse(stream)
}