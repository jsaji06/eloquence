from pydantic import BaseModel
from typing import Optional, Literal, TypedDict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver



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

class SubsectionList(TypedDict):
    subsections:list[Subsection]

class Point(TypedDict):
    type_of_point: Literal['refutation', 'counterpoint', 'question', 'dilemma']
    content:str
    highlighted_text:list[str]
    # remove later on
    color:str

class Advice:
    advice:list[str]

class SocratesState(TypedDict):
    user_essay:str
    subsections:SubsectionList
    points:list[Point]
    requested_feedback:bool
    advice:list[Advice]
    user_selected_points:list[Point]

socrates = init_chat_model("anthropic:claude-3-5-sonnet-20241022", max_tokens=5000)

def divide_text(state:SocratesState):
    DIVIDE_TEXT_PROMPT = PromptTemplate.from_template("""
    You are Socrates. Divide this text into clear subsections with titles and content.

    Text to analyze:
    <writing_content>
    {writing}
    </writing_content>

    Instructions:
    - Create 3-6 subsections maximum
    - Keep titles brief (under 8 words)
    - Parse the exact subsection that matches above. If there are two paragraphs under one section, include both.
    - Focus on main themes and arguments
    """)

    prompt = DIVIDE_TEXT_PROMPT.invoke({"writing": state['user_essay']})
    subsections = socrates.with_structured_output(SubsectionList).invoke(prompt)
    state = {**state, "subsections": subsections}
    return state

def retrieve_points(state:SocratesState):
    PROMPT = PromptTemplate.from_template("""
    You are Socrates. Analyze this subsection and create exactly 3 critical points.

    Subsection to analyze:
    <writing_content>
    {writing}
    </writing_content>

    BEFORE analyzing, first list out 5-10 key phrases or sentences from the subsection above. Write them exactly as they appear:

    Key phrases from text:
    1. "[copy exact phrase 1]"
    2. "[copy exact phrase 2]"
    3. "[copy exact phrase 3]"
    4. "[copy exact phrase 4]"
    5. "[copy exact phrase 5]"

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
    points = []
    subsections = state['subsections']
    for i in range(len(subsections)):
        prompt = PROMPT.invoke({subsection_number: i + 1, writing: subsections[i]})
        point = socrates.with_structured_output(Point).invoke(prompt)
        points.append(point)
    state = {**state, "points":points}
    return state
def retrieve_advice(selected_points):
    MORE_ADVICE_PROMPT = """
    You are Socrates and have been requested to provide more insightful advice on the user's writing. The user has selected this for you to review and elaborate on:
    {advice}

    Provide the user 3–5 more specific, actionable suggestions that build on this feedback. Also take one or two bullet points to specifically outline your line of reasoning behind this piece of advice you have generated. Focus on helping me improve my writing by identifying precise areas to revise, clarify, or strengthen, and suggest what they could add, cut, or reframe.
    """
    advices = []
    selected_points = state['user_selected_points']
    for point in selected_points:
        prompt = MORE_ADVICE_PROMPT.invoke({'advice':point})
        advice = socrates.with_structured_output(Advice).invoke(prompt)
        advices.append(advice)
    state = {**state, "advice": advices}
    return state

def reroute(state:SocratesState):
    if state['requested_feedback']:
        return "proceed"
    else: return "hold"

workflow = StateGraph(SocratesState)
workflow.add_node("divide_text", divide_text)
workflow.add_node("get_points", retrieve_points)

workflow.add_edge(START, "divide_text")
workflow.add_edge("divide_text", "get_points")
workflow.add_edge("get_points", END)

workflow = workflow.compile(checkpointer=MemorySaver())
config = {"configurable": {"thread_id":"1"}}

@app.post("/get_points")
def get_points(writing:UserInput):
   print(writing)
   output = workflow.invoke({"user_essay":writing}, config=config)
   return output

@app.post("/get_advice")
def get_advice(points:list[Point]):
    print(retrieve_advice(points))
#     cur_state = workflow.get_state(config).values
#     state = {**cur_state, "requested_feedback":True}
#     test = workflow.invoke(state, config=config)

#     pieces_of_advice = []
#     for point in points.points:
#         input_prompt = MORE_ADVICE_PROMPT.format(advice=point)
#         output = socrates.with_structured_output(MoreAdviceResponse).invoke(input_prompt)
#         res = {"point": point, "advices":output}
#         pieces_of_advice.append(res)
#     return {"response": pieces_of_advice}