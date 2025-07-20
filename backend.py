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

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_headers=['*'],
    allow_methods=['*']
)

class UserInput(TypedDict):
    writing:str

class Subsection(TypedDict):
    header:str
    content:str

class SubsectionList(BaseModel):
    subsections: list[Subsection]
    # @field_validator("subsections", mode="before")
    # @classmethod
    # def parse_subsections(cls, value):
    #     if isinstance(value, str):
    #         try:
    #             # Clean up common JSON issues
    #             value = value.strip()
    #             if not value.startswith('['):
    #                 # Maybe it's wrapped in extra text
    #                 import re
    #                 json_match = re.search(r'\[.*\]', value, re.DOTALL)
    #                 if json_match:
    #                     value = json_match.group()
    #                 else:
    #                     raise ValueError("No valid JSON array found")
                
    #             parsed = json.loads(value)
    #             if not isinstance(parsed, list):
    #                 raise ValueError("Expected JSON array")
    #             return parsed
    #         except json.JSONDecodeError as e:
    #             raise ValueError(f"Invalid JSON string for subsections: {e}")
    #     elif isinstance(value, list):
    #         return value
    #     else:
    #         raise ValueError("subsections must be a list or valid JSON string")
    

class Point(TypedDict):
    type_of_point: Literal['refutation', 'counterpoint', 'question', 'dilemma']
    content:str
    highlighted_text:list[str]
    # remove later on
    color:str

class Advice(BaseModel):
    advice:list[str]
    
class Response(BaseModel):
    header: str
    points: list[Point]

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
    ["#3e0f1c", "#5a1a2a", "#822c3f"],
    ["#0d2a20", "#124636", "#1e5d47"],
    ["#161731", "#25264c", "#393868"],
    ["#3b2b0d", "#59421a", "#80601e"],
    ["#0c2a2b", "#145153", "#227171"],
    ["#2c102c", "#4a1b4a", "#6a2e6a"],
    ["#331b12", "#512a1d", "#703b2b"],
    ["#1b1f23", "#2f353c", "#49535c"],
    ["#1a1f16", "#2f3726", "#475439"],
    ["#111c2e", "#1d2e4a", "#2e4670"]
]
def create_socrates():
    try:
        socrates = init_chat_model("anthropic:claude-3-5-sonnet-20241022", max_tokens=5000, max_retries=2, timeout=60)
        return socrates
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to initialize model.")

def divide_text(essay:str):
    sentences = re.sub(r'<[^>]+>', '', essay).split(".")
    word_count = len(re.sub(r'<[^>]+>', '', essay).split(" "))
    model = SentenceTransformer("all-MiniLM-L6-v2")

    embeddings = model.encode(sentences)
    subsections = []
    # Wrap embeddings in a list to simulate 1 document with all sentence embeddings
    docmats = [embeddings]  # ✅ This is what get_penalty expects
    try:
        penalty = get_penalty(docmats, max(word_count // 100, 1))  # ✅ FIXED
        splits = split_optimal(embeddings, penalty=penalty)
        segments = get_segments(sentences, splits)
        return segments
    except ValueError:
        raise Exception("The structure of your writing is not valid. The AI feature works best with essays/writing pieces.")
    
    
    for i, segment in enumerate(segments):
        print(f"\n--- Segment {i+1} ---")
        condition = "".join(segment)
        print(condition)
        if condition != "":
            subsections.append("<NEW_SENTENCE>".join(segment))
    
    return subsections

def retrieve_points(state:SocratesState):
    subsections = divide_text(state['user_essay']['writing'])
    print(subsections)
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


workflow = StateGraph(SocratesState)
# workflow.add_node("divide_text", divide_text)
workflow.add_node("get_points", retrieve_points)

# workflow.add_edge(START, "divide_text")
# workflow.add_edge("divide_text", "get_points")
workflow.add_edge(START, "get_points")
workflow.add_edge("get_points", END)

workflow = workflow.compile()

@app.post("/get_points")
def get_points(writing:UserInput):
   print("starting workflow")
   output = workflow.invoke({"user_essay":writing})
   return output['response']

@app.post("/get_advice")
def get_advice(points:FeedbackInput):
    
    advices = retrieve_advice(points['points'])
    print("advices", advices, len(advices))
    response = []
    for i in range(len(advices)):
        test = {"advice": advices[i], "point": points['points'][i]}
        response.append(test)
    print(len(response), response)
    return {"response":response}
    # res = [{"advices": advices[i], "point": points['points'][i]} for i in range(len(points))]
    # print(res)
    # return {"response":res}
    
        