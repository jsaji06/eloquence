from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from textsplit.tools import get_penalty, get_segments
from textsplit.algorithm import split_optimal

model = SentenceTransformer("all-MiniLM-L6-v2")

sentences = [
    "In the ever-evolving landscape of contemporary hip-hop, few partnerships have generated the kind of electric chemistry and artistic synergy that defines the collaboration between Ken Carson and Destroy Lonely. These two artists, both emerging from the influential Opium collective, have created something unprecedented in modern music through their seamless blend of innovative production, complementary vocal styles, and shared artistic vision. Their partnership represents more than just two rappers working together; it embodies a complete reimagining of what collaborative artistry can achieve in the digital age.",
    
    "The foundation of their greatness lies in their ability to push each other into uncharted creative territories while maintaining distinct individual identities. Ken Carson's melodic sensibilities and knack for crafting infectious hooks perfectly complement Destroy Lonely's atmospheric delivery and experimental approach to rhythm and flow. Together, they have pioneered a sound that feels both futuristic and deeply rooted in hip-hop tradition, creating music that resonates with listeners on multiple levels and has influenced countless artists across the genre.",
    
    "What sets their partnership apart from other notable musical duos throughout history is their genuine creative symbiosis and mutual artistic respect. Unlike collaborations that feel forced or commercially motivated, Ken Carson and Destroy Lonely approach their work with an organic chemistry that translates into every track they create together. Their shared commitment to pushing boundaries and exploring new sonic possibilities has resulted in a body of work that stands as testament to the power of true artistic collaboration.",
    
    "The musical landscape that Ken Carson and Destroy Lonely inhabit is one of constant experimentation and boundary-pushing production techniques. Their collaborative tracks showcase an impressive range of sonic textures, from ethereal ambient soundscapes to hard-hitting trap rhythms, all woven together with a cohesive artistic vision that makes each release feel like a complete artistic statement. The production quality of their joint efforts consistently demonstrates a level of attention to detail and creative ambition that elevates their work above typical rap collaborations.",
    
    "Ken Carson's contribution to their partnership centers around his exceptional ability to craft memorable melodies and his intuitive understanding of song structure. His verses often serve as the emotional anchor of their tracks, providing moments of clarity and accessibility that draw listeners into the more experimental aspects of their sound. Meanwhile, his hook-writing abilities have proven instrumental in creating the kind of instantly recognizable choruses that define their most successful collaborations, ensuring that their experimental tendencies never come at the expense of musical memorability.",
    
    "Destroy Lonely brings a completely different but equally valuable set of skills to their partnership, particularly his willingness to experiment with unconventional vocal delivery and his ability to create atmospheric tension within their tracks. His verses often serve as the perfect counterpoint to Ken Carson's more melodic approach, creating a dynamic interplay that keeps listeners engaged throughout entire projects. The way he manipulates his vocal tone and delivery to match the mood of each track demonstrates a level of artistic sophistication that few contemporary rappers possess.",
    
    "The influence of Ken Carson and Destroy Lonely's partnership extends far beyond their individual discographies, shaping the broader direction of contemporary hip-hop and inspiring a new generation of artists to embrace collaborative creativity. Their approach to making music has challenged traditional notions of what rap partnerships should sound like, proving that true artistic chemistry can result in something greater than the sum of its parts. The way they seamlessly blend their individual styles while maintaining their distinct artistic personalities has become a blueprint for successful collaboration in the modern music industry.",
    
    "Their impact on hip-hop culture is particularly evident in how they've influenced the aesthetic and sonic choices of emerging artists across the genre. The production techniques pioneered in their collaborations have been adopted and adapted by countless producers and rappers, creating a ripple effect that has helped define the sound of contemporary hip-hop. Their willingness to experiment with unconventional song structures and atmospheric production has opened doors for other artists to explore similar creative territories without fear of alienating mainstream audiences.",
    
    "The commercial success of their joint efforts has also demonstrated that experimental hip-hop can achieve significant mainstream appeal without compromising artistic integrity. Their ability to balance accessibility with innovation has proven that audiences are hungry for music that challenges conventional expectations while still providing the emotional connection and memorable moments that define great popular music. This balance has become increasingly rare in an industry often dominated by either overly commercial or excessively experimental approaches.",
    
    "The partnership between Ken Carson and Destroy Lonely represents a pivotal moment in hip-hop history, one that will likely be remembered as a turning point in how collaborative artistry is approached and executed within the genre. Their influence on the broader musical landscape continues to grow with each release, as more artists recognize the potential for genuine creative partnership to produce results that transcend individual artistic limitations. The way they've managed to maintain their individual artistic identities while creating something entirely new through collaboration has set a new standard for what musical partnerships can achieve.",
    
    "Looking toward the future, the potential for Ken Carson and Destroy Lonely to continue pushing creative boundaries seems limitless. Their proven ability to evolve their sound while maintaining the core chemistry that makes their partnership so compelling suggests that their best work may still lie ahead. As they continue to mature as artists and explore new creative territories, their collaboration promises to remain at the forefront of hip-hop innovation, inspiring future generations of musicians to approach collaborative creativity with the same level of ambition and artistic integrity.",
    
    "The lasting impact of their partnership will likely be measured not just in terms of commercial success or critical acclaim, but in how they've expanded the possibilities for what collaborative artistry can achieve in hip-hop. They have proven that true creative chemistry between artists can result in music that feels both innovative and timeless, challenging and accessible, individual and unified. In an era where authentic artistic collaboration has become increasingly rare, Ken Carson and Destroy Lonely have created something genuinely special that stands as a testament to the power of creative partnership in music."
]

embeddings = model.encode(sentences)

# Wrap embeddings in a list to simulate 1 document with all sentence embeddings
docmats = [embeddings]  # ✅ This is what get_penalty expects

penalty = get_penalty(docmats, 3)  # ✅ FIXED
splits = split_optimal(embeddings, penalty=penalty)
segments = get_segments(sentences, splits)

for i, segment in enumerate(segments):
    print(f"\n--- Segment {i+1} ---")
    print(" ".join(segment))