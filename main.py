"""
This is the backend file for Eloquence. Below, you will see how I have established the LangGraph workflow that this application utilizes, as well as a relatively simple API I have created that puts said workflow to use.

Application powered by Claude Sonnet 3.5 by Anthropic.
"""

from pydantic import BaseModel, field_validator
from typing import Optional, Literal, TypedDict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
import json
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from textsplit.tools import get_penalty, get_segments
from textsplit.algorithm import split_optimal
import re
from functools import lru_cache

# Create FastAPI backend and connect to React
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://eloquence-eight.vercel.app",
    "https://eloquence-68ro.onrender.com",
        "https://eloquence-joshua-sajis-projects.vercel.app",
        "https://eloquence-git-main-joshua-sajis-projects.vercel.app"
    ],
    allow_headers=["*"],
    allow_methods=["*"],
    # allow_credentials=True,
)
class UserInput(TypedDict):
    writing:str

class Subsection(TypedDict):
    header:str
    content:str

class SubsectionList(BaseModel):
    subsections: list[Subsection]
    

class Point(TypedDict):
    type_of_point: Literal['refutation', 'counterpoint', 'question', 'dilemma']
    content:str
    highlighted_text:list[str]
    color:str
    active:bool = True

class Advice(BaseModel):
    advice:list[str]
    
class Response(BaseModel):
    header: str
    points: list[Point]
    collapsed:bool = False

class FeedbackInput(TypedDict):
    points:list[Point]

class SocratesState(TypedDict):
    user_essay:str
    subsections:SubsectionList
    points:list[Point]
    requested_feedback:bool
    advice:list[Advice]
    user_selected_points:list[Point]
    response:list[Response]
    
COLORS = [
    ["#2e1a26", "#472b3a", "#6b3e53"], 
    ["#123029", "#1c4a3f", "#2e6c5b"], 
    ["#1c1c2e", "#2c2c4a", "#45456d"],
    ["#2d1c10", "#4a2f1f", "#6e442e"],
    ["#12282b", "#1f484e", "#30686f"], 
    ["#2a1a2f", "#442a4c", "#6c3e73"],  
    ["#2e2017", "#4c392a", "#6d513f"],  
    ["#1a232a", "#2e3a45", "#445867"], 
    ["#1e2916", "#33452a", "#4f653d"],  
    ["#131d30", "#243458", "#375187"], 
    ["#3e0f1c", "#5a1a2a", "#822c3f"],
    ["#0d2a20", "#124636", "#1e5d47"],
    ["#161731", "#25264c", "#393868"],
    ["#3b2b0d", "#59421a", "#80601e"],
    ["#0c2a2b", "#145153", "#227171"],
    ["#2c102c", "#4a1b4a", "#6a2e6a"],
    ["#331b12", "#512a1d", "#703b2b"],
    ["#1b1f23", "#2f353c", "#49535c"],
    ["#1a1f16", "#2f3726", "#475439"],
    ["#111c2e", "#1d2e4a", "#2e4670"],
    
]

@lru_cache(maxsize=1)
def get_sentence_transformer():
    return SentenceTransformer("paraphrase-MiniLM-L3-v2")

"""
Initializes Claude Sonnet 3.5 model.
"""
def create_socrates():
    try:
        socrates = init_chat_model("anthropic:claude-3-5-sonnet-20241022", max_tokens=5000, max_retries=2, timeout=60)
        return socrates
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to initialize model.")

"""
This method is responsible for intelligently dividing the user's writing into subsections using a pre-trained machine learning model. 
"""
def divide_text(state:SocratesState):
    print("DIVIDING TEXT")
    essay = state['user_essay']
    sentences = re.sub(r'<[^>]+>', '', essay).split(".")
    word_count = len(re.sub(r'<[^>]+>', '', essay).split(" "))
    print("INITIATING MODEL")
    model = get_sentence_transformer()
    print("MODEL INITIATED")
    embeddings = model.encode(sentences)
    subsections = []
    docmats = [embeddings]
    print("ATTEMPTING TO DIVIDE")  
    try:
        print("GETTING PENALTIES")
        penalty = get_penalty(docmats, max((word_count // 100) + 3, 1)) # ✅ FIXED
        splits = split_optimal(embeddings, penalty=penalty)
        segments = get_segments(sentences, splits)
        print("RETRIEVEED SEGMENTS")
        return {"subsections":segments}
    except ValueError:
        raise Exception("The structure of your writing is not valid. The AI feature works best with essays/writing pieces.")

"""
Method to retreive initial feedback on user's writings.

Each subsection will contain at most 3 critical points. These points come under the form of questions, refutations, dilemmas, and/or counterpoints, in hopes of getting the user to think deeper about their ideas/arguments they want to discuss in their writings.
"""
def retrieve_points(state:SocratesState):
    subsections = state['subsections']
    try:
        print("starting to retrieve points")
        PROMPT = PromptTemplate.from_template("""
        You are Socrates. Analyze this subsection and create exactly 3 critical points.

        Subsection to analyze:
        <writing_content>
        {writing}
        </writing_content>

        BEFORE analyzing, please provide a concise header for the subsection provided. It should be brief but to the point. 

        Next, READ THE TEXT FROM LEFT TO RIGHT and identify 3-5 DISTINCT key phrases or sentences as they appear in order. You must select these phrases in the exact sequence they appear in the text - from beginning to end. Write them exactly as they appear:

        Key phrases from text (in order of appearance):
        1. "[copy exact phrase 1 - from early in text]"
        2. "[copy exact phrase 2 - from middle of text]"
        3. "[copy exact phrase 3 - from later in text]"

        DO NOTE: New sentences are separated by the flag <NEW_SENTENCE>. DO NOT repeat the same sentences for the points you want to make - each sentence you choose should be different.

        Now generate exactly 3 critical points that challenge, question, or explore this content. Each point should be:
        - One of: refutation, counterpoint, question, or dilemma
        - Concise but thoughtful
        - Directly related to the content

        CRITICAL REQUIREMENT: For EACH point, you must reference the phrases IN THE SAME ORDER they appear in the text:
        - Point 1 must reference phrase 1 (earliest in text)
        - Point 2 must reference phrase 2 (middle of text)  
        - Point 3 must reference phrase 3 (latest in text)

        Use the EXACT same text you copied - do not modify it.

        Color Assignment Rules:
        - Subsection 1: Use blue tones
        - Subsection 2: Use green tones
        - Subsection 3: Use red tones
        - Subsection 4: Use purple tones
        - Subsection 5: Use orange tones
        - Subsection 6: Use yellow tones
        - The colors should be light but distinct from one another.

        This subsection number is #{subsection_number}

        Format each point as:
        Point [X] (Color: [hex_code]): [Your critical point]
        Referenced text: "[exact phrase from your list above]"

        Be concise in your analysis.
        """)
        socrates = create_socrates()
        points = []
        for i in range(len(subsections)):
            if subsections[i] != [""]:
                print(i + 1, " / ", len(subsections), subsections[i])
                prompt = PROMPT.invoke({"subsection_number": i + 1, "writing": subsections[i]})
                point = socrates.with_structured_output(Response).invoke(prompt)
                point_list = point.points
                new_list = []
                seen_list = set()
                for j in range(len(point_list)):
                    point_list[j]['color'] = COLORS[i][j]
                for j in range(len(point_list)):
                    highlights = tuple(point_list[j]["highlighted_text"])
                    if highlights not in seen_list:
                        point_list[j]["color"] = COLORS[i][j]
                        new_list.append(point_list[j])
                        seen_list.add(highlights)
                point.points = new_list
                points.append(point)
            else: print("ldk")
            
        state = {**state, "response":points}
        return state
    except Exception as e:
        print(e)
        raise
    
"""
As mentioned above, each subsection contains three points for the user to think about. 

The user has the ability to choose up to 3 points to gain more specifc feedback on deepening the substance of their writings & potentially overcome the specific pitfall that the AI had detected initially.
"""

def retrieve_advice(selected_points):
    try:
        MORE_ADVICE_PROMPT = PromptTemplate.from_template("""
        You are Socrates and have been requested to provide more insightful advice on the user's writing. The user has selected this for you to review and elaborate on:
        {advice}

        Provide the user 3–5 more specific, actionable suggestions that build on this feedback. Also take one or two bullet points to specifically outline your line of reasoning behind this piece of advice you have generated. Focus on helping me improve my writing by identifying precise areas to revise, clarify, or strengthen, and suggest what they could add, cut, or reframe.
        
        Return only a JSON object with a single key `advice` containing a list of strings.
        """)
        print("create model")
        socrates = create_socrates()
        advices = []
        print(len(selected_points), selected_points)
        for point in selected_points:
            print(point)
            prompt = MORE_ADVICE_PROMPT.invoke({'advice':point['content']})
            advice = socrates.with_structured_output(Advice).invoke(prompt).advice
            print(advice)
            advices.append(advice)
        return advices
    except Exception as e:
        print(e)
        raise

# Establish LangGraph workflow (divide text into subsections -> retrieve analysis on each subsection)
workflow = StateGraph(SocratesState)
workflow.add_node("divide_text", divide_text)
workflow.add_node("get_points", retrieve_points)

workflow.add_edge(START, "divide_text")
workflow.add_edge("divide_text", "get_points")
workflow.add_edge("get_points", END)

workflow = workflow.compile()

# API Endpoint to retrieve points / start intitial workflow
from fastapi import Request
@app.post("/get_points")
async def get_points(writing:Request):
   body = await writing.json()
   writing = body.get("writing")
   if not writing:
        raise HTTPException(status_code=400, detail="No writing content provided")
   output = workflow.invoke({"user_essay":writing})
   return output['response']

# API Endpoint to get more extensive feedback 
@app.post("/get_advice")
async def get_advice(request: Request):
    body = await request.json()
    points = body.get("points")
    
    if not points:
        raise HTTPException(status_code=400, detail="No valid points provided")

    advices = retrieve_advice(points)
    response = []
    for i in range(len(advices)):
        res = {"advice": advices[i], "point": points[i]}
        response.append(res)
    
    return {"response": response}
