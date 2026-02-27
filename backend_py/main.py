from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import shutil
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# State management
STATE_FILE = "state.json"
STATE = {"assistant_id": None, "vector_store_id": None}

def load_state():
    global STATE
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            STATE = json.load(f)

def save_state():
    with open(STATE_FILE, "w") as f:
        json.dump(STATE, f)

async def init_assistant():
    load_state()
    if STATE["assistant_id"] and STATE["vector_store_id"]:
        return

    print("Initializing OpenAI Assistant...")
    assistant = client.beta.assistants.create(
        name="CEO Knowledge AI",
        instructions="You are an AI assistant that answers questions based on uploaded company documents. Be professional, accurate, and concise.",
        tools=[{"type": "file_search"}],
        model="gpt-4o",
    )
    
    vector_store = client.vector_stores.create(name="Company Documents Store")
    
    client.beta.assistants.update(
        assistant.id,
        tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
    )
    
    STATE["assistant_id"] = assistant.id
    STATE["vector_store_id"] = vector_store.id
    save_state()

@app.on_event("startup")
async def startup_event():
    await init_assistant()

class ChatRequest(BaseModel):
    message: str

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not os.path.exists("uploads"):
            os.makedirs("uploads")
        
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Upload to OpenAI
        with open(file_path, "rb") as f:
            openai_file = client.files.create(file=f, purpose="assistants")
        
        # Add to Vector Store
        client.vector_stores.files.create(
            vector_store_id=STATE["vector_store_id"],
            file_id=openai_file.id
        )
        
        os.remove(file_path)
        return {"success": True, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask")
async def ask_question(request: ChatRequest):
    try:
        # Create thread
        thread = client.beta.threads.create(
            messages=[{"role": "user", "content": request.message}]
        )
        
        # Run assistant
        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread.id,
            assistant_id=STATE["assistant_id"]
        )
        
        if run.status == 'completed':
            messages = client.beta.threads.messages.list(thread_id=thread.id)
            answer = messages.data[0].content[0].text.value
            return {"answer": answer}
        else:
            raise HTTPException(status_code=500, detail=f"Assistant run failed: {run.status}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    try:
        if STATE["vector_store_id"]:
            files = client.vector_stores.files.list(STATE["vector_store_id"])
            return {"fileCount": len(list(files)), "active": True}
        return {"fileCount": 0, "active": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
