// fetchOpenAIChatAPI.js

export async function fetchOpenAIChatAPI(conversation, language, isMakingFinalGuess) {
    console.log('language', language);
    const instructionsToOpenAI = [
        `I only communicate in the language ${language}.`,
        "Lets play the 20 questions game. I will try to guess what you're thinking of by asking deductive questions.",
        "I will ask many questions, before making attemt at guess",
        "When I am reasonably confident that I understand what you are thinking, based on the abstraction principle, I will respond with a sentence that starts with 'Making a guess:'.",
        "My questions use reduction sentences. EG, instead of typing 'Is the think you are thinking of an animal?' I write 'Is it an animal?'",
        "I use max 6 words pr questions",
        "I will now ask you first question.",
    ];
    // Format the instructions for use in the API response
    const formattedInstructions = instructionsToOpenAI.map((message) => ({
        role: 'system', content: message
    }));

    let conversationWithInstructions = [...formattedInstructions];

    if (isMakingFinalGuess) {
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
