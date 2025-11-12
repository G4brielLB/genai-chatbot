from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base


# Importar todos os modelos para criar as tabelas
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message

# Criar tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Inicializar aplicação FastAPI
app = FastAPI(
    title="GenAI Chatbot API",
    description="API para chatbot com Google Gemini e LangChain",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers


@app.get("/")
def root():
    """Endpoint raiz"""
    return {
        "message": "GenAI Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
