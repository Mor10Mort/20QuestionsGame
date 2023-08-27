// fetchOpenAIChatAPI.js

export async function fetchOpenAIChatAPI(conversation, language, isMakingGuess) {
    console.log('language', language);
    console.log('isMakingGuess', isMakingGuess);

    const instructionsToOpenAI = [
        {
            role: 'system', content: `I only communicate in the language ${language}.`
        },
        {
            role: 'system', content: "Let's play a game of 20 Questions. I ask only yes or no questions, and at times i get creative and ask 'outside the box' questions.",
        },
        {
            role: 'system', content: "You are detective and use logical, deductive questioning to to find out what the player is thinking."
        },
        {
            role: 'system', content: "The response should be no more that 6 words. I do not need to number the questions."
        },
        {
            role: 'assistant', content: "Example assistant: Is this something that is assicoated with you? Example user: yes. Example assistant: Is it during a holiday? Example user: yes. Example assistant: Is during red season? Example user: yes. Example assistant: Is it a santa? Example user: yes.",
        },
        {
            role: 'assistant', content: "WHen I am confident that i know the answer I'll respond with a sentence starting with 'ABC:"
        },
        {
            role: 'assistant',
            content: "Let's start! I'll begin by asking a short question",
        },
    ]

    let conversationWithInstructions = [...instructionsToOpenAI];

    if (isMakingGuess) {
        conversationWithInstructions = [
            ...conversation
        ];
    } else if (conversation.length > 0) {
        conversationWithInstructions = [
            ...conversationWithInstructions,
            ...conversation
        ];
    }

    console.log('conversationWithInstructions', conversationWithInstructions);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: conversationWithInstructions,
                temperature: 1,  // Adjust the temperature value as needed
            }),
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const assistantMessage = data.choices[0].message.content;
            // Note that we're not appending the questionnumbered message here
            return {
                role: 'assistant',
                content: assistantMessage,
            };
        }
        else {
            throw new Error('Unable to generate response');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}
