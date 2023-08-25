import { fetchOpenAIChatAPI } from './fetchOpenAIChatAPI'; // Import the function

export async function handleStartController(conversation, language) {
    console.log('Reset');
    conversation.length = 0;
    const response = await fetchOpenAIChatAPI([], language);
    conversation.push(response);

    const addNumbering = {
        ...response,
        questionNumber: 1,
        makingGuess: false,
        finalGuess: false
    };
    return addNumbering;
}

export async function handlePlayingController(conversation, answer) {
    console.log("playing controller");
    const maxQuestions = 20;

    conversation.push({ role: 'user', content: answer });

    let response;

    let countQuestions = conversation.filter(message => message.role === 'assistant').length;
    if (countQuestions >= maxQuestions) {
        const makeAGuessInstructions = [
            ...conversation,
            {
                role: 'system',
                content: "Make guess of what you think it is. No follow-up questions."
            },
            {
                role: 'system',
                content: "Just take a guess. Its okay to be wrong."
            },
            {
                role: 'system',
                content: "My guess is brief. 5 word."
            },

        ];

        const justMakeGuess = await fetchOpenAIChatAPI(makeAGuessInstructions, true);
        //Fjerner "making a guess" fra setning
        let openAImakingGuess = justMakeGuess.content.includes("Making a guess:");
        if (openAImakingGuess) {
            justMakeGuess.content = justMakeGuess.content.replace(/Making a guess:\s*/i, '');
        }
        conversation.push(justMakeGuess);
        justMakeGuess.makingGuess = false;
        justMakeGuess.finalGuess = true;
        justMakeGuess.questionNumber = 20;
        response = justMakeGuess;
    } else {
        const gptResponse = await fetchOpenAIChatAPI(conversation);

        //Fjerner "making a guess" fra setning
        let openAImakingGuess = gptResponse.content.includes("Making a guess:");
        if (openAImakingGuess) {
            gptResponse.content = gptResponse.content.replace(/Making a guess:\s*/i, '');
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

export async function handleRespondToGuessController(conversation, answer) {
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
                content: "No, it was incorrect. Let me keep trying asking. I will ask a little broader questions."
            },
        ];

        const keepTrying = await fetchOpenAIChatAPI(guessedWrong);
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