import "../../index.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import { faBrain } from "@fortawesome/free-solid-svg-icons"
import { faComment } from "@fortawesome/free-solid-svg-icons"
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import mainImg from './mainimg.png'
export default function Landing() {

useEffect(() => {
  AOS.init({
    duration: 600, // Animation duration in ms
    once: true, // Whether animation should happen only once
    mirror: true // animate on scroll up too
    
  })

}, []);
  const navigate = useNavigate();
  return (
    <div className="landingPage" data-aos="fade-up">
      <nav className="landingNav" data-aos="fade-up">
        <div className="left">
          <a>Eloquence</a>
        </div>
        <div className="right">
          <a href="/login">Login</a>
          <a href="/signup">Signup</a>
          <a href="/guesteditor">Use as Guest</a>
        </div>
      </nav>
      <div className="main">
        <div className="one">
          <h1>Eloquence: Where Better Writing Begins</h1>
          <p>Eloquence pushes you beyond grammar into the heart of your ideas—where true clarity lives.</p>
          <div className="mainImage">
            <img src={mainImg} />
          </div>
          <button onClick={() => navigate("/signup")}>Get started</button>
        </div>
        <div className="two">
          <h2>Core Features</h2>
          <div className="features">
            <div className="feature">
              <h3><FontAwesomeIcon icon={faEdit} /></h3>
              <h4> Rich Text Editor</h4>
              <p>A sleek, minimal text editor aimed to make your writing experience simple.</p>
            </div>
            <div className="feature">
            <h3><FontAwesomeIcon icon={faBrain} /></h3>
            <h4>Socratic-based Feedback</h4>
            <p>Powered using Anthropic's Claude AI model, your writing will receive feedback in the form of questions, counterpoints, refutations, and dilemmas. This feedback doesn't just make you a better writer: it makes you a better thinker.</p>

            </div>
            <div className="feature">
            <h3><FontAwesomeIcon icon={faComment} /></h3>
            <h4>High-Quality, no B.S Advice</h4>
            <p>Get honest, quality feedback that helps make your writings clear, succinct, and of substance.</p>
            </div>
          </div>
        </div>
        <div className="three">
          <h2>Become a better writer today.</h2>
          <button className="getStarted" onClick={() => navigate("/signup")}>Sign up for free</button>
        </div>
      </div>
    </div>
  )
}
