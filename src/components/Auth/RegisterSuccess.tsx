import type React from "react"
import { Link } from "react-router-dom"
import "./Auth.css"

const RegisterSuccess: React.FC = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
            <span className="logo-text">P</span>
        </div>
        
        <h1 className="auth-title">REGISTERED</h1>
        <h1 className="auth-title"> SUCCESSFULLY</h1>

        <div className="success-message">
            <p>Thank you to intersted in our service!</p>
            <br />
            <p>Now your document are in reviewing process
            You will get notification when the process done.</p><br />
            
            <p> If you have any questions.</p>
            <p> Please contact us</p>
            <p> Email : placeholer@gmail.com</p>
        </div>
        

      <Link to="/login">
        <button className="auth-button">Go to Login</button>
      </Link>
      </div>
    </div>
  )
}

export default RegisterSuccess

