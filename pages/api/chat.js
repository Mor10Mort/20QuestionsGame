import fetch from 'isomorphic-unfetch';
import { handleStartController, handlePlayingController, handleRespondToGuessController } from './controllers';

const sessions = {};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { sessionId, controller, language, answer } = req.body; // Include 'language' here
    let maxRounds = 1;
    // Create a session-specific conversation array
    let conversation = sessions[sessionId] || [];
    if (!sessions[sessionId]) {
        sessions[sessionId] = conversation;
    }


    if (controller === 'start') {
        const startResponse = await handleStartController(conversation, language);
        res.status(200).json(startResponse);
        return;
    }

    if (controller === 'playing') {
        const playingResponse = await handlePlayingController(conversation, answer, maxRounds);
        res.status(200).json(playingResponse);
        return;
    }

    if (controller === 'respondToGuess') {
        const respondToGuessResponse = await handleRespondToGuessController(conversation, answer, maxRounds);
        res.status(200).json(respondToGuessResponse);
        return;
    }

    res.status(400).json({ error: 'Invalid controller' });
}