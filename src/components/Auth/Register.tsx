"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/axios"
import "./Register.css"
import "./Auth.css"

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    idNumber: "",
    address: "",
    idFile: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target

    if (name === "idFile" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        idFile: files[0],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSubmit(e)
    }
  }

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData()

      // Map frontend field names to backend field names
      formDataToSend.append("email", formData.email)
      formDataToSend.append("username", formData.username)
      formDataToSend.append("password", formData.password)
      formDataToSend.append("firstName", formData.firstName)
      formDataToSend.append("lastName", formData.lastName)
      formDataToSend.append("id_number", formData.idNumber)
      formDataToSend.append("address", formData.address)

      // Add the file with the correct field name
      if (formData.idFile) {
        formDataToSend.append("idfile", formData.idFile)
      }

      // Send registration data to API
      await api.post("/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      navigate("/register/success")
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError("An error occurred during registration")
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="step-title">Fill your information.</div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email :
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username :
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password :
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="next-button">
              NEXT
            </button>
          </>
        )
      case 2:
        return (
          <>
            <div className="step-title">Fill your information.</div>
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name :
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <label htmlFor="lastName" className="form-label">
                Last Name :
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <label htmlFor="idNumber" className="form-label">
                ID No./Passport No. :
              </label>
              <input
                id="idNumber"
                name="idNumber"
                type="text"
                className="form-input"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
              <label htmlFor="address" className="form-label">
                Address :
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="next-button">
              NEXT
            </button>
          </>
        )
      case 3:
        return (
          <>
            <div className="step-title">Upload your indentification document</div>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <input
                id="idFile"
                name="idFile"
                type="file"
                className="form-input"
                onChange={handleChange}
                required
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <button type="submit" className="next-button" disabled={isLoading}>
              {isLoading ? "SUBMITTING..." : "REGISTER"}
            </button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-text">P</span>
        </div>

        <h1 className="auth-title">REGISTER</h1>

        <div className="steps-container">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        <form className="register-form" onSubmit={handleNext}>
          {renderStepContent()}
        </form>
      </div>
    </div>
  )
}

