import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import { IamAuthenticator } from 'ibm-watson/auth';
import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1';

const app = express();

app.use(express.json());
dotenv.config();
app.use(cookieParser());

// Your routes and other logic go here

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,              
}));

const __dirname = path.resolve();
if (process.env.NODE_ENV === "production"){
    console.log(process.env.NODE_ENV);
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


class LangflowClient {
    constructor(baseURL, applicationToken) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }

    async post(endpoint, body, headers = { "Content-Type": "application/json" }) {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;
        headers["Content-Type"] = "application/json";
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
            }
            return responseMessage;
        } catch (error) {
            console.error('Request Error:', error.message);
            throw error;
        }
    }

    async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
    }

    handleStream(streamUrl, onUpdate, onClose, onError) {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = event => {
            const data = JSON.parse(event.data);
            onUpdate(data);
        };

        eventSource.onerror = event => {
            console.error('Stream Error:', event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener("close", () => {
            onClose('Stream closed');
            eventSource.close();
        });

        return eventSource;
    }

    async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
        try {
            const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, stream, tweaks);
            console.log('Init Response:', initResponse);
            if (stream && initResponse && initResponse.outputs && initResponse.outputs[0].outputs[0].artifacts.stream_url) {
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                console.log(`Streaming from: ${streamUrl}`);
                this.handleStream(streamUrl, onUpdate, onClose, onError);
            }
            return initResponse;
        } catch (error) {
            console.error('Error running flow:', error);
            onError('Error initiating session');
        }
    }
}

async function main(inputValue, inputType = 'chat', outputType = 'chat', stream = false) {
    const flowIdOrName = process.env.flowid;
    const langflowId = process.env.langid;
    const applicationToken = process.env.apptoken;
    const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com', applicationToken);

    try {
        const tweaks = {
            "ChatInput-Nk68d": {},
            "Prompt-aoi9v": {},
            "OpenAIModel-5Usjw": {},
            "ChatOutput-Avhiv": {}
        };

        // Declare the response variable
        let response = await langflowClient.runFlow(
            flowIdOrName,
            langflowId,
            inputValue,
            inputType,
            outputType,
            tweaks,
            stream,
            (data) => console.log("Received:", data.chunk), // onUpdate
            (message) => console.log("Stream Closed:", message), // onClose
            (error) => console.log("Stream Error:", error) // onError
        );

        if (!stream && response && response.outputs) {
            const flowOutputs = response.outputs[0];
            const firstComponentOutputs = flowOutputs.outputs[0];
            const output = firstComponentOutputs.outputs.message;

            console.log("Final Output:", output.message.text);
            return output.message.text;

        }
    } catch (error) {
        console.error('Main Error', error.message);
    }
}


app.post('/api', async (req, res) => {
    const { inputValue, inputType, outputType, stream } = req.body;
    try {
        let output = await main(inputValue, inputType, outputType, stream);
        res.status(200).send({ success: true ,output });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/fetch-caption', async (req, res) => {
    const { videoUrl } = req.body; // Expecting video URL in request body
  
    if (!videoUrl) {
      return res.status(400).json({ error: 'YouTube video URL is required' });
    }
  
    try {
      // Extract video ID from the YouTube URL
      const videoId = new URL(videoUrl).searchParams.get('v');
  
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }
  
      // Fetch the transcript
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  
      res.json({ transcript });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transcript', message: error.message });
    }
  });





const apiKey = process.env.IBM_API_KEY;
const serviceUrl = process.env.IBM_URL;

// Initialize the Watson Speech-to-Text client
const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({ apikey: apiKey }),
  serviceUrl: serviceUrl,
});

app.use(express.json());

app.post('/convert-audio-to-text', async (req, res) => {
  const { audioUrl } = req.body; // The URL of the audio file from Cloudinary

  try {
    console.log("Received audio URL: ", audioUrl);

    // Fetch the audio file from the provided URL
    const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });

    const audioBuffer = audioResponse.data;
    console.log("Audio fetched successfully");

    // Prepare the audio for transcription
    const recognizeParams = {
      audio: audioBuffer,
      contentType: 'audio/mp3',  // Adjust this based on the file format
      model: 'en-US_BroadbandModel', // Choose the model you want to use
    };

    // Make the API request to IBM Watson
    const { result } = await speechToText.recognize(recognizeParams);
    const transcription = result.results.map(result => result.alternatives[0].transcript).join('\n');

    // console.log("Transcription: ", transcription);

    // Send the transcription back to the frontend
    res.status(200).json({ transcription });
  } catch (error) {
    console.error("Error during transcription:", error);
    res.status(500).json({ error: 'Error converting audio to text', details: error.message });
  }
});




const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});