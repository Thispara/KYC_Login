import type React from "react"

interface RegisterStepsProps {
  currentStep: number
}

const RegisterSteps: React.FC<RegisterStepsProps> = ({ currentStep }) => {
  return (
    <div className="steps-container">
      <div className={`step ${currentStep >= 1 ? "active" : ""}`}>1</div>
      <div className={`step ${currentStep >= 2 ? "active" : ""}`}>2</div>
      <div className={`step ${currentStep >= 3 ? "active" : ""}`}>3</div>
    </div>
  )
}

export default RegisterSteps

