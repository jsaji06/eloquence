from pydantic import BaseModel, field_validator
from typing import Optional, Literal, TypedDict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
import json

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
    @field_validator("subsections", mode="before")
    @classmethod
    def parse_subsections(cls, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON string for subsections")
        return value
    

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
    
def create_socrates():
    try:
        socrates = init_chat_model("anthropic:claude-3-5-sonnet-20241022", max_tokens=5000, max_retries=2, timeout=60)
        return socrates
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to initialize model.")

def divide_text(state:SocratesState):
    try:
        print("Divide text started")
        DIVIDE_TEXT_PROMPT = PromptTemplate.from_template("""
        You are a careful, exact, and hyper-precise assistant. Divide this text into clear subsections with titles and content.

        Text to analyze:
        <writing_content>
        {writing}
        </writing_content>

        Instructions:
        - Create 3-6 subsections maximum
        - Keep titles brief (under 8 words)
        - Parse the exact subsection that matches above. If there are two paragraphs under one section, include both.
        - Focus on main themes and arguments
        
        CRITICAL CHARACTER PRESERVATION:
        - DO NOT alter or stylize any characters, punctuation, or quotation marks.
        - If the original text contains "hello world" it must appear as "hello world" (not 'hello world' or "hello world")
        - The output must contain exact substrings from the original text.
        - This is a strict token-preserving task. Do not rephrase anything.
        - Copy and paste the text exactly as it appears.
        """)
        socrates = create_socrates()
        
        prompt = DIVIDE_TEXT_PROMPT.invoke({"writing": state['user_essay']})
        subsections = socrates.with_structured_output(SubsectionList).invoke(prompt).subsections
        state = {**state, "subsections": subsections}
        return state
    except Exception as e:
        print(e)
        raise

def retrieve_points(state:SocratesState):
    try:
        print("starting to retrieve points")
        PROMPT = PromptTemplate.from_template("""
        You are Socrates. Analyze this subsection and create exactly 3 critical points.

        Subsection to analyze:
        <writing_content>
        {writing}
        </writing_content>

        BEFORE analyzing, first list out 3-5 key phrases or sentences from the subsection above. Write them exactly as they appear:

        Key phrases from text:
        1. "[copy exact phrase 1]"
        2. "[copy exact phrase 2]"
        3. "[copy exact phrase 3]"

        Now generate exactly 3 critical points that challenge, question, or explore this content. Each point should be:
        - One of: refutation, counterpoint, question, or dilemma
        - Concise but thoughtful
        - Directly related to the content

        For EACH point, reference ONE of the key phrases you listed above. Use the EXACT same text you copied - do not modify it.

        It's possible for each subsection to have multiple refutations, dilemmas, counterpoints, etc. What's most important is that you reflect upon what you have read, and come up with reasonable challenges for the writer to think about.

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
        print('generating model')
        socrates = create_socrates()
        points = []
        print('retrieving subsections')
        subsections = state['subsections']
        print(subsections)
        for i in range(len(subsections)):
            print(i + 1, " / ", len(subsections))
            prompt = PROMPT.invoke({"subsection_number": i + 1, "writing": subsections[i]['content']})
            point = socrates.with_structured_output(Response).invoke(prompt)
            points.append(point)
            print("done, proceeding")
        print("finished gen points, returning")
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
workflow.add_node("divide_text", divide_text)
workflow.add_node("get_points", retrieve_points)

workflow.add_edge(START, "divide_text")
workflow.add_edge("divide_text", "get_points")
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
    
        