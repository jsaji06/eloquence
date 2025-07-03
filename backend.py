from pydantic import BaseModel
from typing import Optional, Literal, TypedDict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_headers=['*'],
    allow_methods=['*']
)

class WritingInput(BaseModel):
    writing:str

class Point(BaseModel):
    type_of_point:Literal['refutation', 'counterpoint', 'question', 'dilemma']
    content:str

class Subsection(BaseModel):
    points:list[Point]

class ResponseTemplate(BaseModel):
    subsections:list[Subsection]
    
    
class SuggestionState(MessagesState):
    subsections:list[Subsection]

class Section(BaseModel):
    title:str
    content:str
class SectionList(BaseModel):
    sections:list[Section]
    
socrates = init_chat_model("anthropic:claude-3-5-sonnet-20241022", max_tokens=5000)
     
DIVIDE_TEXT_PROMPT = PromptTemplate.from_template("""
You are Socrates. Divide this text into clear subsections with titles and content.

Text to analyze:
<writing_content>
{writing}
</writing_content>

Instructions:
- Create 3-6 subsections maximum
- Keep titles brief (under 8 words)
- Include key content for each section
- Focus on main themes and arguments
""")     

PROMPT = PromptTemplate.from_template("""
You are Socrates. Analyze this subsection and create exactly 3 critical points.

Subsection to analyze:
<writing_content>
{writing}
</writing_content>

Generate exactly 3 points that challenge, question, or explore this content. Each point should be:
- One of: refutation, counterpoint, question, or dilemma
- Concise but thoughtful
- Directly related to the content

Be concise in your analysis.
""")



def get_suggestions(state):
    print(state['messages'])
    sections = socrates.with_structured_output(SectionList).invoke(state['messages']).sections
    print(sections)
    subsections = []
    for i in range(len(sections)):
        new_prompt = PROMPT.invoke({"writing": sections[i].content})
        header = sections[i].title
        content = sections[i].content
        response = socrates.with_structured_output(Subsection).invoke(new_prompt)
        print(response)
        dictionary = {"header": header, "points":response.points}
        subsections.append(dictionary)
    print(subsections)
    return {"subsections":subsections}
    
    

graph = StateGraph(SuggestionState)
graph.add_edge(START, "get_suggestions")
graph.add_node("get_suggestions", get_suggestions)
graph.add_edge("get_suggestions", END)
graph = graph.compile()

@app.post("/get_points")
def get_points(writing:WritingInput):
   input_prompt = DIVIDE_TEXT_PROMPT.format(writing=writing.writing)
    
   output = graph.invoke({"messages": [HumanMessage(input_prompt)]})
    
   return output['subsections']
    

@app.get("/")
def home():
    return {"data": "Hello, world!"}

