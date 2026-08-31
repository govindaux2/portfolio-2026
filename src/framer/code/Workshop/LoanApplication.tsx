// @ts-nocheck
// Bank loan application prototype with multi-step form
import { useState, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

interface LoanApplicationProps {
	primaryColor: string
	backgroundColor: string
	textColor: string
	headingFont: any
	bodyFont: any
	buttonFont: any
	style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function LoanApplication(props: LoanApplicationProps) {
	const { primaryColor, backgroundColor, textColor, headingFont, bodyFont, buttonFont } = props

	const [step, setStep] = useState(1)
	const [formData, setFormData] = useState({
		loanAmount: "",
		loanPurpose: "home",
		income: "",
		employment: "employed",
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	})

	const totalSteps = 3

	const handleInputChange = (field: string, value: string) => {
		startTransition(() => {
			setFormData((prev) => ({ ...prev, [field]: value }))
		})
	}

	const nextStep = () => {
		if (step < totalSteps) {
			startTransition(() => setStep(step + 1))
		}
	}

	const prevStep = () => {
		if (step > 1) {
			startTransition(() => setStep(step - 1))
		}
	}

	const handleSubmit = () => {
		startTransition(() => setStep(4))
	}

	const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			action()
		}
	}

	const inputStyle: CSSProperties = {
		width: "100%",
		padding: "12px 16px",
		borderRadius: 8,
		border: `1px solid ${textColor}33`,
		...bodyFont,
		fontSize: 15,
		color: textColor,
		backgroundColor: "#FFFFFF",
		outline: "none",
	}

	const labelStyle: CSSProperties = {
		display: "block",
		marginBottom: 8,
		...bodyFont,
		fontSize: 14,
		color: textColor,
		fontWeight: 500,
	}

	const buttonStyle: CSSProperties = {
		padding: "14px 28px",
		borderRadius: 8,
		border: "none",
		cursor: "pointer",
		...buttonFont,
		fontSize: 15,
		transition: "all 0.2s ease",
	}

	return (
		<div
			style={{
				...props.style,
				position: "relative",
				width: "100%",
				height: "100%",
				backgroundColor,
				display: "flex",
				flexDirection: "column",
				padding: 40,
				overflow: "auto",
			}}
			role="application"
			aria-label="Bank loan application form"
		>
			{/* Header */}
			<div style={{ marginBottom: 32 }}>
				<h1
					style={{
						margin: 0,
						marginBottom: 8,
						color: textColor,
						...headingFont,
					}}
					id="form-title"
				>
					Loan Application
				</h1>
				<div 
					style={{ display: "flex", gap: 8, marginTop: 16 }}
					role="progressbar"
					aria-valuenow={step}
					aria-valuemin={1}
					aria-valuemax={totalSteps}
					aria-label={`Step ${step} of ${totalSteps}`}
				>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							style={{
								flex: 1,
								height: 4,
								borderRadius: 2,
								backgroundColor: i <= step ? primaryColor : `${textColor}20`,
								transition: "background-color 0.3s ease",
							}}
							aria-hidden="true"
						/>
					))}
				</div>
			</div>

			{/* Step 1: Loan Details */}
			{step === 1 && (
				<div 
					style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}
					role="form"
					aria-labelledby="form-title"
					aria-describedby="step-description"
				>
					<div id="step-description" className="sr-only">
						Step 1 of 3: Enter your loan details
					</div>
					<div>
						<label style={labelStyle} htmlFor="loanAmount">
							Loan Amount
						</label>
						<input
							id="loanAmount"
							type="number"
							placeholder="Enter amount"
							value={formData.loanAmount}
							onChange={(e) => handleInputChange("loanAmount", e.target.value)}
							style={inputStyle}
							aria-required="true"
							aria-describedby="loanAmount-hint"
						/>
						<span id="loanAmount-hint" className="sr-only">
							Enter the loan amount you wish to apply for
						</span>
					</div>
					<div>
						<label style={labelStyle} htmlFor="loanPurpose">
							Loan Purpose
						</label>
						<select
							id="loanPurpose"
							value={formData.loanPurpose}
							onChange={(e) => handleInputChange("loanPurpose", e.target.value)}
							style={inputStyle}
							aria-required="true"
						>
							<option value="home">Home Purchase</option>
							<option value="car">Car Purchase</option>
							<option value="business">Business</option>
							<option value="education">Education</option>
							<option value="personal">Personal</option>
						</select>
					</div>
					<div>
						<label style={labelStyle} htmlFor="income">
							Annual Income
						</label>
						<input
							id="income"
							type="number"
							placeholder="Enter annual income"
							value={formData.income}
							onChange={(e) => handleInputChange("income", e.target.value)}
							style={inputStyle}
							aria-required="true"
							aria-describedby="income-hint"
						/>
						<span id="income-hint" className="sr-only">
							Enter your total annual income
						</span>
					</div>
					<div>
						<label style={labelStyle} htmlFor="employment">
							Employment Status
						</label>
						<select
							id="employment"
							value={formData.employment}
							onChange={(e) => handleInputChange("employment", e.target.value)}
							style={inputStyle}
							aria-required="true"
						>
							<option value="employed">Employed</option>
							<option value="self-employed">Self-Employed</option>
							<option value="unemployed">Unemployed</option>
							<option value="retired">Retired</option>
						</select>
					</div>
				</div>
			)}

			{/* Step 2: Personal Information */}
			{step === 2 && (
				<div 
					style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}
					role="form"
					aria-labelledby="form-title"
					aria-describedby="step-description"
				>
					<div id="step-description" className="sr-only">
						Step 2 of 3: Enter your personal information
					</div>
					<div>
						<label style={labelStyle} htmlFor="firstName">
							First Name
						</label>
						<input
							id="firstName"
							type="text"
							placeholder="Enter first name"
							value={formData.firstName}
							onChange={(e) => handleInputChange("firstName", e.target.value)}
							style={inputStyle}
							aria-required="true"
							autoComplete="given-name"
						/>
					</div>
					<div>
						<label style={labelStyle} htmlFor="lastName">
							Last Name
						</label>
						<input
							id="lastName"
							type="text"
							placeholder="Enter last name"
							value={formData.lastName}
							onChange={(e) => handleInputChange("lastName", e.target.value)}
							style={inputStyle}
							aria-required="true"
							autoComplete="family-name"
						/>
					</div>
					<div>
						<label style={labelStyle} htmlFor="email">
							Email Address
						</label>
						<input
							id="email"
							type="email"
							placeholder="Enter email"
							value={formData.email}
							onChange={(e) => handleInputChange("email", e.target.value)}
							style={inputStyle}
							aria-required="true"
							autoComplete="email"
							aria-describedby="email-hint"
						/>
						<span id="email-hint" className="sr-only">
							We'll use this email to contact you about your application
						</span>
					</div>
					<div>
						<label style={labelStyle} htmlFor="phone">
							Phone Number
						</label>
						<input
							id="phone"
							type="tel"
							placeholder="Enter phone number"
							value={formData.phone}
							onChange={(e) => handleInputChange("phone", e.target.value)}
							style={inputStyle}
							aria-required="true"
							autoComplete="tel"
						/>
					</div>
				</div>
			)}

			{/* Step 3: Review */}
			{step === 3 && (
				<div 
					style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}
					role="region"
					aria-labelledby="review-heading"
					aria-describedby="step-description"
				>
					<div id="step-description" className="sr-only">
						Step 3 of 3: Review your application before submitting
					</div>
					<h2
						id="review-heading"
						style={{
							margin: 0,
							marginBottom: 16,
							color: textColor,
							...headingFont,
							fontSize: 22,
						}}
					>
						Review Your Application
					</h2>
					<div
						style={{
							padding: 20,
							borderRadius: 8,
							backgroundColor: "#FFFFFF",
							border: `1px solid ${textColor}20`,
						}}
						role="group"
						aria-label="Application summary"
					>
						<div style={{ marginBottom: 16 }}>
							<span style={{ ...bodyFont, fontSize: 14, color: `${textColor}80` }}>Loan Amount</span>
							<p style={{ margin: "4px 0 0 0", ...bodyFont, fontSize: 16, color: textColor }}>
								${formData.loanAmount || "0"}
							</p>
						</div>
						<div style={{ marginBottom: 16 }}>
							<span style={{ ...bodyFont, fontSize: 14, color: `${textColor}80` }}>Purpose</span>
							<p style={{ margin: "4px 0 0 0", ...bodyFont, fontSize: 16, color: textColor }}>
								{formData.loanPurpose}
							</p>
						</div>
						<div style={{ marginBottom: 16 }}>
							<span style={{ ...bodyFont, fontSize: 14, color: `${textColor}80` }}>Annual Income</span>
							<p style={{ margin: "4px 0 0 0", ...bodyFont, fontSize: 16, color: textColor }}>
								${formData.income || "0"}
							</p>
						</div>
						<div style={{ marginBottom: 16 }}>
							<span style={{ ...bodyFont, fontSize: 14, color: `${textColor}80` }}>Name</span>
							<p style={{ margin: "4px 0 0 0", ...bodyFont, fontSize: 16, color: textColor }}>
								{formData.firstName} {formData.lastName}
							</p>
						</div>
						<div style={{ marginBottom: 16 }}>
							<span style={{ ...bodyFont, fontSize: 14, color: `${textColor}80` }}>Email</span>
							<p style={{ margin: "4px 0 0 0", ...bodyFont, fontSize: 16, color: textColor }}>
								{formData.email}
							</p>
						</div>
						<div>
							<span style={{ ...bodyFont, fontSize: 14, color: `${textColor}80` }}>Phone</span>
							<p style={{ margin: "4px 0 0 0", ...bodyFont, fontSize: 16, color: textColor }}>
								{formData.phone}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Step 4: Success */}
			{step === 4 && (
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
						gap: 16,
					}}
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					<div
						style={{
							width: 80,
							height: 80,
							borderRadius: "50%",
							backgroundColor: primaryColor,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginBottom: 16,
						}}
						aria-hidden="true"
					>
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
							<title>Success checkmark</title>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>
					<h2
						style={{
							margin: 0,
							color: textColor,
							...headingFont,
							fontSize: 28,
						}}
					>
						Application Submitted!
					</h2>
					<p
						style={{
							margin: 0,
							color: `${textColor}80`,
							...bodyFont,
							fontSize: 16,
							maxWidth: 400,
						}}
					>
						Thank you for applying. We'll review your application and get back to you within 2-3 business days.
					</p>
				</div>
			)}

			{/* Navigation Buttons */}
			{step < 4 && (
				<div 
					style={{ display: "flex", gap: 12, marginTop: 32 }}
					role="navigation"
					aria-label="Form navigation"
				>
					{step > 1 && (
						<button
							onClick={prevStep}
							onKeyDown={(e) => handleKeyDown(e, prevStep)}
							style={{
								...buttonStyle,
								backgroundColor: "transparent",
								color: textColor,
								border: `1px solid ${textColor}33`,
							}}
							aria-label="Go back to previous step"
						>
							Back
						</button>
					)}
					<button
						onClick={step === 3 ? handleSubmit : nextStep}
						onKeyDown={(e) => handleKeyDown(e, step === 3 ? handleSubmit : nextStep)}
						style={{
							...buttonStyle,
							backgroundColor: primaryColor,
							color: "#FFFFFF",
							flex: 1,
						}}
						aria-label={step === 3 ? "Submit your loan application" : "Continue to next step"}
					>
						{step === 3 ? "Submit Application" : "Continue"}
					</button>
				</div>
			)}

			{/* Screen reader only styles */}
			<style>{`
				.sr-only {
					position: absolute;
					width: 1px;
					height: 1px;
					padding: 0;
					margin: -1px;
					overflow: hidden;
					clip: rect(0, 0, 0, 0);
					white-space: nowrap;
					border-width: 0;
				}
			`}</style>
		</div>
	)
}

addPropertyControls(LoanApplication, {
	primaryColor: {
		type: ControlType.Color,
		title: "Primary Color",
		defaultValue: "#0099FF",
	},
	backgroundColor: {
		type: ControlType.Color,
		title: "Background",
		defaultValue: "#F5F5F5",
	},
	textColor: {
		type: ControlType.Color,
		title: "Text Color",
		defaultValue: "#000000",
	},
	headingFont: {
		type: ControlType.Font,
		title: "Heading Font",
		controls: "extended",
		defaultFontType: "sans-serif",
		defaultValue: {
			fontSize: "32px",
			variant: "Bold",
			letterSpacing: "-0.03em",
			lineHeight: "1em",
		},
	},
	bodyFont: {
		type: ControlType.Font,
		title: "Body Font",
		controls: "extended",
		defaultFontType: "sans-serif",
		defaultValue: {
			fontSize: "15px",
			variant: "Medium",
			letterSpacing: "-0.01em",
			lineHeight: "1.3em",
		},
	},
	buttonFont: {
		type: ControlType.Font,
		title: "Button Font",
		controls: "extended",
		defaultFontType: "sans-serif",
		defaultValue: {
			fontSize: "15px",
			variant: "Semibold",
			letterSpacing: "-0.01em",
			lineHeight: "1em",
		},
	},
})