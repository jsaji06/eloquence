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
    highlighted_text:list[str]
    color:str

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
- Parse the exact subsection that matches above. If there are two paragraphs under one section, include both. 
- Focus on main themes and arguments
""")     

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



def get_suggestions(state):
    print(state['messages'])
    sections = socrates.with_structured_output(SectionList).invoke(state['messages']).sections
    print(sections)
    subsections = []
    for i in range(len(sections)):
        print(sections[i].content)
        new_prompt = PROMPT.invoke({"writing": sections[i].content, "subsection_number": i+1})
        header = sections[i].title
        content = sections[i].content
        response = socrates.with_structured_output(Subsection).invoke(new_prompt)
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

