const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: 'uploads/' });

let assistantId = null;
let vectorStoreId = null;

// Persistent state mock (in real apps, use a DB)
const STATE_FILE = path.join(__dirname, 'state.json');

async function saveState() {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ assistantId, vectorStoreId }));
}

async function loadState() {
    if (fs.existsSync(STATE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STATE_FILE));
        assistantId = data.assistantId;
        vectorStoreId = data.vectorStoreId;
    }
}

// Initialize Assistant and Vector Store
async function initAssistant() {
    await loadState();
    
    if (assistantId && vectorStoreId) return;

    console.log("Initializing new AI Assistant...");
    
    try {
        const assistant = await openai.beta.assistants.create({
            name: "CEO Knowledge AI",
            instructions: "You are an AI assistant that answers questions based on uploaded company documents. Be professional, accurate, and concise. Always prioritize information from the uploaded documents. If the answer is not in the documents, mention that it's not found in the provided company lore, but try to give a general answer if appropriate while clearly stating it's general knowledge.",
            tools: [{ type: "file_search" }],
            model: "gpt-4o",
        });
        assistantId = assistant.id;

        const vectorStore = await openai.beta.vectorStores.create({
            name: "Company Documents Store",
        });
        vectorStoreId = vectorStore.id;

        await openai.beta.assistants.update(assistantId, {
            tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
        });

        await saveState();
        console.log(`Assistant created: ${assistantId}`);
        console.log(`Vector Store created: ${vectorStoreId}`);
    } catch (err) {
        console.error("Error creating assistant:", err);
    }
}

// Upload file endpoint (CEO tool)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        await initAssistant();
        const { file } = req;
        if (!file) return res.status(400).json({ error: "No file provided" });

        // Upload to OpenAI
        const openaiFile = await openai.files.create({
            file: fs.createReadStream(file.path),
            purpose: "assistants",
        });

        // Add to Vector Store
        await openai.beta.vectorStores.files.create(vectorStoreId, {
            file_id: openaiFile.id,
        });

        // Cleanup local file
        fs.unlinkSync(file.path);

        res.json({ success: true, fileId: openaiFile.id, filename: file.originalname });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Chat endpoint (CEO and User)
app.post('/api/ask', async (req, res) => {
    try {
        await initAssistant();
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        // Create a thread
        const thread = await openai.beta.threads.create({
            messages: [{ role: "user", content: message }],
        });

        // Run the assistant
        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: assistantId,
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            const content = messages.data[0].content[0].text.value;
            res.json({ answer: content });
        } else {
            res.status(500).json({ error: `Assistant run failed: ${run.status}` });
        }
    } catch (error) {
        console.error("Query Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    await initAssistant();
    if (vectorStoreId) {
      const files = await openai.beta.vectorStores.files.list(vectorStoreId);
      res.json({ fileCount: files.data.length, active: true });
    } else {
      res.json({ fileCount: 0, active: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
