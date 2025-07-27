import "../../index.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import { faBrain } from "@fortawesome/free-solid-svg-icons"
import { faComment } from "@fortawesome/free-solid-svg-icons"
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import mainImg from './mainimg.png'
import { faBars } from "@fortawesome/free-solid-svg-icons"

export default function Landing() {

  useEffect(() => {
    AOS.init({
      duration: 600, // Animation duration in ms
      once: true, // Whether animation should happen only once
      mirror: true // animate on scroll up too

    })

  }, []);
  const navigate = useNavigate();
  let [collapsed, setCollapsed] = useState(false);
  return (
    <div className="landingPage" data-aos="fade-up">
      <nav className="hamburger" data-aos="fade-up">
        <div className="navLink">
          <FontAwesomeIcon icon={faBars} style={{display:collapsed ? "none" : "block"}} className="bars" onClick={() => setCollapsed(collapsed => !collapsed)} />
        </div>
        <div className="collapsedLinks" style={{ display: collapsed ? "block" : "none" }}>
          <br />
          <div className="burgerLink" onClick={() => setCollapsed(false)}>
            <a href="/">Eloquence</a>
          </div>
          <br />
          <div className="burgerLink" onClick={() => navigate("/login")}>
            <a href="/login">Login</a>
          </div>
          <br />
          <div className="burgerLink" onClick={() => navigate("/signup")}>
            <a href="/signup">Signup</a>
          </div>
          <br />
          <div className="burgerLink" onClick={() => navigate("/guesteditor")}>
            <a href='/guesteditor'>Use as Guest</a>
          </div>
        </div>
      </nav>
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
      <main className="main" style={{display:collapsed ? "none" : "block"}}>
        <div aria-label="Intro to Eloquence" className="one">
          <h1 role="banner">Eloquence: A writing tool that questions your ideas</h1>
          <p role="contentinfo">Get AI feedback that challenges your arguments, not just your grammar.</p>
          <button aria-label="Try Eloquence under guest mode" onClick={() => navigate("/guesteditor")}>See it in action</button>
          <div className="mainImage">
            <img alt="Image of sample feedback for dummy paragraph" src={mainImg} />
          </div>
        </div>
        <div aria-label="Key features of Eloquence" className="two">
          <h2>Core Features</h2>
          <div className="features">
            <div className="feature" aria-label="Key feature of Eloquence - A.I that challenges your writing">
              <div className="featureContainer">
                <div className="featureHeader">
              <h3><FontAwesomeIcon icon={faBrain} /> A.I that challenges your writing</h3>
              </div>
              <p>Get direct, Socratic-style feedback that challenges even your smallest ideas through probing questions, dilemmas, counterpoints and refutations. </p>
              </div>
            </div>
            <div className="feature" aria-label="Key feature of Eloquence - Real, authentic analysis">
              <div className="featureContainer">
                <div className="featureHeader">
              <h3><FontAwesomeIcon icon={faComment} /> Real, authentic analysis</h3>
              </div>
              <p>Eloquence isn't here to sugarcoat. It offers candid feedback and pinpoints any pitfalls in your ideas for you to critically think and expand upon them.</p>
              </div>

            </div>
            <div className="feature" aria-label="Key feature of Eloquence - Elegant writing interface">
              <div className="featureContainer">
                <div className="featureHeader">
              <h3><FontAwesomeIcon icon={faEdit} /> Elegant writing interface </h3>
              
              </div>
              <p>Offers a simple, rich text editor for distraction-less writing and thinking.</p>
              </div>
            </div>
          </div>
        </div>
        <div aria-label="Start using Eloquence" className="three">
          <h2>Become a better writer today.</h2>
          <button aria-label="Create an account and start using Eloquence" className="getStarted" onClick={() => navigate("/signup")}>Sign up for free</button>
        </div>
      </main>
    </div>
  )
}
