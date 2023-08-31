// fetchOpenAIChatAPI.js

export async function fetchOpenAIChatAPI(conversation, language, normalGamePlay, gameEnd, guessedWrong) {

    const innitialInstructionsToOpenAI = [
        {
            role: 'system', content: `I only communicate in the language ${language}.`
        },
        {
            role: 'system', content: "Your role is a clever quiz master. Lets play the 20 questions game. Example, 'Is it a something hard?'",
        },
        {
            role: 'assistant',
            content: "Let's start! I'll begin by asking a short question",
        },
    ]

    let conversationWithInstructions = [...innitialInstructionsToOpenAI];

    //alle prompts sent til Open AI
    if (normalGamePlay) {
        conversationWithInstructions = [

            {
                role: 'assistant',
                content: "Feel free to take your time and ask thoughtful questions to narrow down the possibilities. It's better to ask broad questions initially before getting into specific items. Remember, the goal is to guess the player's thought in 20 questions by making logical deductions.",
            },
            {
                role: 'system',
                content: "During the final phase, only make a guess if the player has answered 'yes' to the last 5 questions consecutively. Your guess should start with 'ABC:' and contain only 1 specific item or category.",
            },
            ...conversation,
        ];
    } else if (gameEnd) {
        conversationWithInstructions = [
            ...conversation,
            {
                role: 'system',
                content: "I will now make a final guess. I will ask no follow-up questions."
            },
            {
                role: 'system',
                content: "It's okay for me to guess wrong, but I will use our conversation to make a deductive guess."
            },
            {
                role: 'system',
                content: "My guess is brief. 5 word."
            },
        ]
    } else if (guessedWrong) {
        conversationWithInstructions = [
            {
                role: 'system', content: `I only communicate in the language ${language}.`
            },
            ...conversation,
            {
                role: 'user',
                content: 'no'
            },
            {
                role: 'system',
                content: "Last question was wrong guess. I am on the wrong path. I need to ask a little broader questions to get back on track. Feel free to take your time and ask thoughtful questions to narrow down the possibilities.It's better to ask broad questions initially before getting into specific items. Remember, the goal is to guess the player's thought in 20 questions by making logical deductions."
            },
            {
                role: 'system',
                content: "This is hard, but I am not allowed to give up. I will continue ask questions so i can win the game."
            },
            {
                role: 'assistant',
                content: 'Thank you for patience. Lets keep trying.'
            },
        ]
    } else if (conversation.length > 0) {
        //denne trigges kun første runde/spm
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
                max_tokens: 50,
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
