import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print(f"Client dir: {[m for m in dir(client) if not m.startswith('_')]}")
