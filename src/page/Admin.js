import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API_BASE = (
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com"
).replace(/\/+$/, "");

function Admin() {
	const navigate = useNavigate();
	const [teamName, setTeamName] = useState("");
	const [member1, setMember1] = useState("");
	const [member2, setMember2] = useState("");
	const [member3, setMember3] = useState("");
	const [member4, setMember4] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const rLocation = async (event) => {
		event.preventDefault(); // Prevent form submission
		const memberName = [member1, member2, member3, member4];
		setIsSubmitting(true);

		try {
			const response = await fetch(`${API_BASE}/save-locations`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					team: teamName,
					members: memberName,
				}),
			});

			const data = await response.json();
			
			if (response.ok) {
				// Navigate to confirmation page with team data
				navigate("/team-confirmation", {
					state: {
						teamId: data.teamId,
						teamName: teamName,
						members: memberName.filter(m => m.trim() !== ""),
						locations: data.locations,
					},
				});
			} else {
				alert(data.error || data.message || "Failed to create team.");
				setIsSubmitting(false);
			}
		} catch (error) {
			console.error("Error sending data:", error);
			alert("An error occurred while creating the team.");
			setIsSubmitting(false);
		}
	};

	return (
		<div className="admin-container">
			<h2 className="admin-heading">Admin</h2>
			<form className="admin-form" onSubmit={rLocation}>
				<div className="form-group">
					<label className="form-label">Team Name:</label>
					<input
						type="text"
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
						className="form-input"
						required
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Member Name:</label>
					<input
						type="text"
						value={member1}
						onChange={(e) => setMember1(e.target.value)}
						className="form-input"
						required
					/>
					<label className="form-label">Member Name:</label>
					<input
						type="text"
						value={member2}
						onChange={(e) => setMember2(e.target.value)}
						className="form-input"
						required
					/>
					<label className="form-label">Member Name:</label>
					<input
						type="text"
						value={member3}
						onChange={(e) => setMember3(e.target.value)}
						className="form-input"
						required
					/>
					<label className="form-label">Member Name:</label>
					<input
						type="text"
						value={member4}
						onChange={(e) => setMember4(e.target.value)}
						className="form-input"
						required
					/>
				</div>
				<button type="submit" className="admin-button" disabled={isSubmitting}>
					<span>{isSubmitting ? "Creating Team..." : "Generate and Save Locations"}</span>
				</button>
			</form>
		</div>
	);
}

export default Admin;
