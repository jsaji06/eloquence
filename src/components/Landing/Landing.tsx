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
            <a>Eloquence</a>
          </div>
          <br />
          <div className="burgerLink" onClick={() => navigate("/login")}>
            <a>Login</a>
          </div>
          <br />
          <div className="burgerLink" onClick={() => navigate("/signup")}>
            <a>Signup</a>
          </div>
          <br />
          <div className="burgerLink" onClick={() => navigate("/guesteditor")}>
            <a>Use as Guest</a>
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
      <div className="main" style={{display:collapsed ? "none" : "block"}}>
        <div className="one">
          <h1>Eloquence: A writing tool that questions your ideas</h1>
          <p>Get AI feedback that challenges your arguments, not just your grammar.</p>
          <button onClick={() => navigate("/guesteditor")}>See it in action</button>
          <div className="mainImage">
            <img src={mainImg} />
          </div>
        </div>
        <div className="two">
          <h2>Core Features</h2>
          <div className="features">
            <div className="feature">
              <div className="featureContainer">
                <div className="featureHeader">
              <h3><FontAwesomeIcon icon={faBrain} /></h3>
              <h4>A.I That Challenges Your Writing</h4>
              </div>
              <p>Get direct, Socratic-style feedback that challenges even your smallest ideas through probing questions, dilemmas, counterpoints and refutations. </p>
              </div>
            </div>
            <div className="feature">
              <div className="featureContainer">
                <div className="featureHeader">
              <h3><FontAwesomeIcon icon={faComment} /></h3>
              <h4>Real, authentic analysis</h4>
              </div>
              <p>Eloquence isn't here to sugarcoat. It offers candid feedback and pinpoints any pitfalls in your ideas for you to critically think and expand upon them.</p>
              </div>

            </div>
            <div className="feature">
              <div className="featureContainer">
                <div className="featureHeader">
              <h3><FontAwesomeIcon icon={faEdit} /></h3>
              <h4>Elegant Writing Interface</h4>
              </div>
              <p>Offers a simple, rich text editor for distraction-less writing and thinking.</p>
              </div>
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
