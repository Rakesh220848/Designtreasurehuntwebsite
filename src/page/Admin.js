import React, { useState } from "react";
import "./Admin.css";

const API_BASE =
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com";

function Admin() {
	const [teamName, setTeamName] = useState("");
	const [member1, setMember1] = useState("");
	const [member2, setMember2] = useState("");
	const [member3, setMember3] = useState("");
	const [member4, setMember4] = useState("");

	const rLocation = (event) => {
		event.preventDefault(); // Prevent form submission
		const memberName = [member1, member2, member3, member4];

		fetch(`${API_BASE}/save-locations`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				team: teamName,
				members: memberName,
			}),
		})
			.then(async (response) => {
				const data = await response.json();
				if (response.ok) {
					alert(`Team ${teamName} created successfully.`);
				} else {
					alert(data.error || data.message || "Failed to create team.");
				}
				return data;
			})
			.then((data) => console.log("Server Response:", data))
			.catch((error) => console.error("Error sending data:", error));
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
				<button type="submit" className="admin-button">
					Generate and Save Locations
				</button>
			</form>
		</div>
	);
}

export default Admin;
