// fetchOpenAIChatAPI.js

export async function fetchOpenAIChatAPI(conversation, language, isMakingGuess) {
    console.log('language', language);
    console.log('isMakingGuess', isMakingGuess);

    const instructionsToOpenAI = [
        `I only communicate in the language ${language}.`,
        "Lets play the 20 question game. I will guess what you're thinking of by asking deductive yes or no questions.",
        "I am not allowed to give up or ask for hints",
        "By using deductive reasoning, I will review earlier asked question to comeup with next question",
        "When I feel game is coming to end, I will respond with a sentence that starts with 'ABC:'.",
        "Instead of typing 'Is the think you are thinking of an animal?' I write 'Is it an animal?'",
        "I use max 5 words pr questions",
        "I will now ask you first question.",
    ];
    // Format the instructions for use in the API response
    const formattedInstructions = instructionsToOpenAI.map((message) => ({
        role: 'system', content: message
    }));

    let conversationWithInstructions = [...formattedInstructions];

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
                model: 'gpt-3.5-turbo-0613',
                messages: conversationWithInstructions,
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
