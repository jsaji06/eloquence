"""
This is the backend file for Eloquence. Below, you will see how I have established the LangGraph workflow that this application utilizes, as well as a relatively simple API I have created that puts said workflow to use.

Application powered by Claude Sonnet 3.5 by Anthropic.
"""
import sys
from pydantic import BaseModel, field_validator
from pydantic_core._pydantic_core import ValidationError
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
import asyncio

# Create FastAPI backend and connect to React
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "www.eloquenceai.org",
        "https://www.eloquenceai.org",
        "https://eloquenceai.org",
        "https://eloquence-eight.vercel.app",
    "https://eloquence-68ro.onrender.com",
        "https://eloquence-joshua-sajis-projects.vercel.app",
        "https://eloquence-git-main-joshua-sajis-projects.vercel.app"
    ],
    allow_headers=["*"],
    allow_methods=["*"],
    allow_credentials=True,
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
    
    @field_validator('points', mode='before')
    def parse_points(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

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
    summaries:list[str]
    prompt:str

class Context(BaseModel):
    summaries:list[str]
    
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
    return SentenceTransformer("all-MiniLM-L6-v2")

"""
Initializes Claude Sonnet 3.5 model.
"""
def create_socrates():
    try:
        socrates = init_chat_model("anthropicclaude-sonnet-4-5", max_tokens=5000, max_retries=2, timeout=60)
        return socrates
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to initialize model.")

def valid_prompt(user_prompt:str):
    try:
        socrates = create_socrates()
        prompt = PromptTemplate.from_template("""
        You are Socrates. A writer has begun writing their piece and has specifically advised you to tailor feedback you'll give upon request based on their following descriptions:
        
        {description}
        Please return only one of the following responses: "YES" for if this prompt is valid/relevant for tailored feedback, or "NO" if this prompt is nonsensical or cannot be used for tailored feedback.
        """)
        prompt = prompt.invoke({"description":user_prompt})
        response = socrates.invoke(prompt)
        return {"response":response}
    except:
        raise Exception("An error occured; try again soon")
        
    

"""
This method is responsible for intelligently dividing the user's writing into subsections using a pre-trained machine learning model. 
"""
def divide_text(state:SocratesState):
    essay = state['user_essay']
    sentences = re.sub(r'<[^>]+>', '', essay).split(".")
    word_count = len(re.sub(r'<[^>]+>', '', essay).split(" "))
    model = get_sentence_transformer()
    embeddings = model.encode(sentences)
    subsections = []
    docmats = [embeddings]
    try:
        penalty = get_penalty(docmats, 10) # ✅ FIXED
        splits = split_optimal(embeddings, penalty=penalty)
        segments = get_segments(sentences, splits)
        return {"subsections":segments}
    except ValueError as e:
        if "too short for given segment_len" in str(e):
        # Fallback: treat entire text as one segment
            return {"subsections": [sentences]}  # or however you want to handle short docs
    else:
        raise Exception("The structure of your writing is not valid. The AI feature works best with essays/writing pieces.")

"""
Method to retreive initial feedback on user's writings.

Each subsection will contain at most 3 critical points. These points come under the form of questions, refutations, dilemmas, and/or counterpoints, in hopes of getting the user to think deeper about their ideas/arguments they want to discuss in their writings.
"""
async def call_model(subsection:str, index:int, summary:str, user_prompt:str):
    print(summary, "WEEE", user_prompt)
    PROMPT = PromptTemplate.from_template("""
You are Socrates. You are tasked to analyze a complete essay that's been broken down to subsections to make your job easier.

To better understand the context behind the essay, here is a brief, one sentence summary of the subsection preceding this one: {summary}

In addition, please tailor the feedback based off of the user's description of the general writing they are working with: {writing_desc}

If there's NO INFORMATION to tailor feedback from, please assess the type of writing based on the context that was already provided. Do not provide overly deep/pretentiously-sounding feedback if it's not necessary (i.e. don't unnecessarily philosophize over the user's personal experiences in their college essays).

NOTE: If there was NO context provided, this implies that this is the introductory paragraph to the essay, so please treat this as such.

Analyze this subsection and create exactly 3 critical points with consideration of the context of the previous subsection, if included.

Subsection to analyze:
<writing_content>
{writing}
</writing_content>

Generate exactly 3 critical points that challenge, question, or explore this content.

IMPORTANT: You must respond with a JSON object matching this exact structure:
{{
  "header": "Brief header for this subsection",
  "points": [
    {{
      "type_of_point": "refutation|counterpoint|question|dilemma",
      "content": "Your critical point here",
      "highlighted_text": ["exact phrase from text"],
      "color": "#hexcolor",
      "active": true
    }}
  ],
  "collapsed": false
}}

This subsection number is #{subsection_number}

Rules:
- Each point must be one of: refutation, counterpoint, question, or dilemma
- highlighted_text should contain exact phrases from the original text
- Use appropriate colors for subsection {subsection_number}
- Be concise but thoughtful
""")
    socrates = create_socrates()
    MAX_TRIES = 5
    for i in range(MAX_TRIES):
        if subsection != [""]:
            try:
                prompt = await PROMPT.ainvoke({"subsection_number": index + 1, "writing": subsection, "writing_desc": user_prompt, "summary":summary})
                point = await socrates.with_structured_output(Response).ainvoke(prompt)
                point_list = point.points
                new_list = []
                seen_list = set()
                for j in range(len(point_list)):
                    point_list[j]['color'] = COLORS[index][j]
                for j in range(len(point_list)):
                    highlights = tuple(point_list[j]["highlighted_text"])
                    if highlights not in seen_list:
                        point_list[j]["color"] = COLORS[index][j]
                        new_list.append(point_list[j])
                        seen_list.add(highlights)
                point.points = new_list
                return point
            except ValidationError:
                raise
                # if i < MAX_TRIES - 1:
                #     await asyncio.sleep(1)
                # else: raise
    

async def retrieve_points(state:SocratesState):
    subsections = state['subsections']
    summaries = state['summaries']
    try:
        
        points = [call_model(subsection, i, summaries[i-1] if i >= 1 else "No previous context provided.", state['prompt']) for i, subsection in enumerate(subsections)]
        results = await asyncio.gather(*points)
        state = {**state, "response":results}
        return state
    except Exception as e:
        raise
    
"""
As mentioned above, each subsection contains three points for the user to think about. 

The user has the ability to choose up to 3 points to gain more specifc feedback on deepening the substance of their writings & potentially overcome the specific pitfall that the AI had detected initially.
"""

async def call_advice_model(advice:str):
    MORE_ADVICE_PROMPT = PromptTemplate.from_template("""
        You are Socrates and have been requested to provide more insightful advice on the user's writing. The user has selected this for you to review and elaborate on:
        {advice}

        Provide the user 3–5 more specific, actionable suggestions that build on this feedback. Also take one or two bullet points to specifically outline your line of reasoning behind this piece of advice you have generated. Focus on helping me improve my writing by identifying precise areas to revise, clarify, or strengthen, and suggest what they could add, cut, or reframe.
        
        Return only a JSON object with a single key `advice` containing a list of strings.
        """)
    socrates = create_socrates()
    prompt = await MORE_ADVICE_PROMPT.ainvoke({'advice':advice})
    advice = await socrates.with_structured_output(Advice).ainvoke(prompt)
    return advice.advice

async def retrieve_advice(selected_points):
    try:
        MORE_ADVICE_PROMPT = PromptTemplate.from_template("""
        You are Socrates and have been requested to provide more insightful advice on the user's writing. The user has selected this for you to review and elaborate on:
        {advice}

        Provide the user 3–5 more specific, actionable suggestions that build on this feedback. Also take one or two bullet points to specifically outline your line of reasoning behind this piece of advice you have generated. Focus on helping me improve my writing by identifying precise areas to revise, clarify, or strengthen, and suggest what they could add, cut, or reframe.
        
        Return only a JSON object with a single key `advice` containing a list of strings.
        """)
        socrates = create_socrates()
        advices = [call_advice_model(point['content']) for point in selected_points]
        advices = await asyncio.gather(*advices)
        return advices
    except Exception as e:
        raise
    # except InternalServerError as e:
        
async def retrieve_context(state:SocratesState):
    subsections = state['subsections']
    CONTEXT_PROMPT = PromptTemplate.from_template("""
    You are being provided an essay that has been broken down into subsections. You are responsible for briefly summarizing each subsection into one sentence. 
    
    The subsection in question: {subsection}
    """)
    model = create_socrates()
    summaries = [model.ainvoke(CONTEXT_PROMPT.invoke({"subsection": subsection})) for subsection in subsections]
    summaries = await asyncio.gather(*summaries)
    return {**state, "summaries":[summary.content for summary in summaries]}

# Establish LangGraph workflow (divide text into subsections -> retrieve analysis on each subsection)
workflow = StateGraph(SocratesState)
workflow.add_node("divide_text", divide_text)
workflow.add_node("retrieve_context", retrieve_context)
workflow.add_node("get_points", retrieve_points)

workflow.add_edge(START, "divide_text")
workflow.add_edge("divide_text", "retrieve_context")
workflow.add_edge("retrieve_context", "get_points")
workflow.add_edge("get_points", END)

workflow = workflow.compile()

# API Endpoint to retrieve points / start intitial workflow
from fastapi import Request
@app.post("/get_points")
async def get_points(writing:Request):
    try: 
       body = await writing.json()
       writing = body.get("writing")
       prompt = body.get("prompt")
       # context = body.get("context")
       if not writing:
            raise HTTPException(status_code=400, detail="No writing content provided")
       output = await workflow.ainvoke({"user_essay":writing, "prompt": prompt})
       return output['response']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API Endpoint to get more extensive feedback 
@app.post("/get_advice")
async def get_advice(request: Request):
    body = await request.json()
    points = body.get("points")
    
    if not points:
        raise HTTPException(status_code=400, detail="No valid points provided")

    advices = await retrieve_advice(points)
    response = []
    for i in range(len(advices)):
        res = {"advice": advices[i], "point": points[i]}
        response.append(res)
    
    return {"response": response}

@app.post("/validate_prompt")
async def get_points(request:Request):
    
   body = await request.json()
   writing = body.get("prompt")
   # context = body.get("context")
   if not writing:
        raise HTTPException(status_code=400, detail="No writing content provided")
   output = valid_prompt(writing)
   return output['response']
