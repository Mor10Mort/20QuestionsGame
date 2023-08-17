import fetch from 'isomorphic-unfetch';

const maxQuestions = 20;
let maxRounds = 1;
const sessions = {};

const instructionsToOpenAI = [
    "Welcome to the 20 Questions Game!",
    "You think of anything in the world",
    "I guess by using yes/no questions only",
    "I use your earlier answers to resonate to new questions to better determine it is what you are thinking of",
    "Answer with 'yes', 'no' or 'maybe' only.",
    "I am an no point allowed to give up",
    "I'll use max 5 words per question.",
    "Great! Let's start playing the 20 Questions Game!"
];

const instruksjonerTilAPI = [
    "Velkommen til 20 Spørsmål-spillet!",
    "Du kan tenke på hva som helst i verden",
    "Jeg gjetter ved å bruke bare ja/nei-spørsmål",
    "Jeg bruker dine tidligere svar og deduktiv tankegang for komme på neste spørsmål",
    "Svar med 'ja', 'nei' eller 'kanskje'",
    "Jeg har veldig kreative spørsmål",
    "Jeg bruker maksimalt 5 ord per spørsmål.",
    "Supert! La oss begynne å spille 20 Spørsmål-spillet!",
];

let instructions;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { sessionId, controller, answer, language } = req.body; // Include 'language' here

    console.log('language', language);
    // Determine which set of instructions to use based on the language parameter
    if (language === 'norwegian') {
        instructions = instruksjonerTilAPI;
    } else {
        instructions = instructionsToOpenAI;
    }

    // Create a session-specific conversation array
    let conversation = sessions[sessionId] || [];
    if (!sessions[sessionId]) {
        sessions[sessionId] = conversation;
    }

    if (controller === 'start') {
        console.log('Reset');
        conversation.length = 0;
        //conversation = []; // Reset the conversation array
        const response = await fetchOpenAIChatAPI([]); // Initial empty conversation
        conversation.push(response);

        // Append the questionNumber field to the gptResponse object
        const addNumbering = {
            ...response,
            questionNumber: 1,
        };

        res.status(200).json(addNumbering); // Send the response here once
        return;
    }

    if (controller === 'playing') {
        conversation.push({ role: 'user', content: answer });

        let response;

        let assistantMessageCount = conversation.filter(message => message.role === 'user').length;
        console.log('Number of assistant messages:', assistantMessageCount);
        console.log('maxRounds', maxRounds);
        if (assistantMessageCount >= maxQuestions && maxRounds == 1) {
            console.log("Max questions");

            const makeAGuessInstructions = [

                ...conversation,
                {
                    role: 'system',
                    content: "As a gameshow host, make specific guess of what you think it is. Its okay to be wrong. go crazy."
                },

            ];

            //console.log("makeAGuessInstructions", makeAGuessInstructions);

            // Clear the conversation array
            conversation.length = 0;
            assistantMessageCount = 0;
            const makeGuess = await fetchOpenAIChatAPI(makeAGuessInstructions, true);
            // Add the additional parameter to the response

            conversation.push(makeGuess);
            makeGuess.step = 'makingGuess';
            makeGuess.questionNumber = 20;
            response = makeGuess;
            /*response = {
                role: 'assistant',
                content: "Ops, my 20 questions are up. Is it okay we keep playing?"
            };*/
            maxRounds++; // Increment maxRounds when starting a new round
        }
        //gjøre denne ikke sp avhengig av maxQ?
        else if (assistantMessageCount >= maxQuestions && maxRounds == 2) {
            response = {
                role: 'assistant',
                content: "Holy cow, this is too hard 😂 I give up. You win 🏆"
            };
            // Clear the conversation array
            conversation.length = 0;
            maxRounds = 1;
            assistantMessageCount = 0;
        }
        else {
            const gptResponse = await fetchOpenAIChatAPI(conversation);
            conversation.push(gptResponse);

            // Calculate the number of assistant questions
            const numberOfAssistantQuestions = conversation.filter(message => message.role === 'assistant').length;

            // Append the questionNumber field to the gptResponse object
            const appendResponseNumbered = {
                ...gptResponse,
                questionNumber: numberOfAssistantQuestions,
            };

            response = appendResponseNumbered;
        }

        res.status(200).json(response);
        return;
    }

    if (controller === 'correct') {
        console.log('AI guessed it');
        const response = {  // Declare the 'response' variable
            role: 'assistant',
            content: "YES! I knew I could read your mind!"
        };
        // Clear the conversation array to stop the chat with OpenAI
        conversation.length = 0;
        res.status(200).json(response); // Send the response to the client
        return;
    }

    res.status(400).json({ error: 'Invalid controller' });
}



async function fetchOpenAIChatAPI(conversation, isMakingGuess) {
    // Format the instructions for use in the API response
    const formattedInstructions = instructions.map((message) => ({
        role: 'system', content: message
    }));
    console.log('API conversation', conversation);
    let conversationWithInstructions = [...formattedInstructions];
    let makeAGuessInstructions = []; // Initially empty

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

    //console.log('conversationWithInstructions', conversationWithInstructions);

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
        //console.log('conversation', conversation);

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

