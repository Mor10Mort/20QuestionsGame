import { fetchOpenAIChatAPI } from './fetchOpenAIChatAPI'; // Import the function

export async function handleStartController(conversation, language) {
    console.log('Reset');
    conversation.length = 0;
    const response = await fetchOpenAIChatAPI([], language, false);
    conversation.push(response);

    const addNumbering = {
        ...response,
        questionNumber: 1,
        makingGuess: false,
        finalGuess: false
    };
    return addNumbering;
}

export async function handlePlayingController(conversation, answer, language) {
    console.log("playing controller");
    const maxQuestions = 20;

    conversation.push({ role: 'user', content: answer });

    let response;

    let countQuestions = conversation.filter(message => message.role === 'assistant').length;
    if (countQuestions >= maxQuestions) {
        console.log("20 up");
        const makeAGuessInstructions = [
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

        ];

        const justMakeGuess = await fetchOpenAIChatAPI(makeAGuessInstructions, language, false);
        //Fjerner "making a guess" fra setning
        let openAImakingGuess = justMakeGuess.content.includes("ABC");
        if (openAImakingGuess) {
            justMakeGuess.content = justMakeGuess.content.replace(/ABC:\s*/i, '');
        }
        conversation.push(justMakeGuess);
        justMakeGuess.makingGuess = false;
        justMakeGuess.finalGuess = true;
        justMakeGuess.questionNumber = 20;
        response = justMakeGuess;
    } else {
        const gptResponse = await fetchOpenAIChatAPI(conversation, language, false);

        //Fjerner "making a guess" fra setning
        let openAImakingGuess = gptResponse.content.includes("ABC");
        if (openAImakingGuess) {
            gptResponse.content = gptResponse.content.replace(/ABC:\s*/i, '');
        }

        conversation.push(gptResponse);

        const numberOfAssistantQuestions = conversation.filter(message => message.role === 'assistant').length;
        let appendResponseNumbered = {
            ...gptResponse,
            questionNumber: numberOfAssistantQuestions,
            makingGuess: openAImakingGuess,
            finalGuess: false
        };

        response = appendResponseNumbered;
    }
    return response;
}

export async function handleRespondToGuessController(conversation, answer, language) {
    console.log("handleRespondToGuessController");
    let response;

    let countQuestions = conversation.filter(message => message.role === 'assistant').length;
    console.log('countQuestions', countQuestions);
    //OPEN AI WINS!
    if (answer === 'yes') {
        console.log("YES U DID IT!");

        response = {
            role: 'assistant',
            content: "I knew I could read your 🧠",
            gameComplete: true
        };
        return response;
    }
    //20 questions up. OPEN AI LOST!
    else if (countQuestions >= 20) {
        console.log("20 q up. GAME OVER!");

        response = {
            role: 'assistant',
            content: "I give up 😂 You win 🏆",
            gameComplete: true
        };
        // Clear the conversation array
        conversation.length = 0;
        return response;
    } else {
        //OPEN AI GUESSED WRONG, but still has questions left
        console.log("< 20 q. Game continues");

        const guessedWrong = [
            ...conversation,
            {
                role: 'user',
                content: 'no'
            },
            {
                role: 'system',
                content: "Last question was wrong guess. I am on the wrong path. I need to ask a little broader questions to get back on track."
            },
            {
                role: 'system',
                content: "This is hard, but I am not allowed to give up. I will continue ask questions so i can win the game."
            },
            {
                role: 'assistant',
                content: 'Thank you for patience. Lets keep trying.'
            }
        ];

        const keepTrying = await fetchOpenAIChatAPI(guessedWrong, language, false);
        conversation.push(keepTrying);
        const numberOfAssistantQuestions = conversation.filter(message => message.role === 'assistant').length;


        let appendResponseNumbered = {
            ...keepTrying,
            questionNumber: numberOfAssistantQuestions,
            makingGuess: false,
            finalGuess: false

        };


        response = appendResponseNumbered;

    }
    return response;
}