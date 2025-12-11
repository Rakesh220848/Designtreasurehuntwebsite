import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TeamConfirmation.css";

const TeamConfirmation = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { teamId, teamName, members, locations } = location.state || {};

	if (!teamId) {
		return (
			<div className="confirmation-container">
				<div className="confirmation-card">
					<h2>Error</h2>
					<p>No team data found.</p>
					<button onClick={() => navigate("/register")}>Go Back</button>
				</div>
			</div>
		);
	}

	return (
		<div className="confirmation-container">
			<div className="confirmation-card">
				<div className="success-icon">✓</div>
				<h1 className="confirmation-title">Team Created Successfully!</h1>
				<div className="team-details">
					<div className="detail-section">
						<label>Team Name:</label>
						<p className="detail-value">{teamName}</p>
					</div>
					<div className="detail-section highlight">
						<label>Team ID:</label>
						<p className="detail-value team-id">{teamId}</p>
					</div>
					<div className="detail-section">
						<label>Team Members:</label>
						<div className="members-list">
							{members.map((member, idx) => (
								<span key={idx} className="member-tag">
									{member}
								</span>
							))}
						</div>
					</div>
				</div>
				<div className="confirmation-actions">
					<button className="primary-btn" onClick={() => navigate("/scan")}>
						Start Scanning
					</button>
					<button className="secondary-btn" onClick={() => navigate("/register")}>
						Create Another Team
					</button>
				</div>
			</div>
		</div>
	);
};

export default TeamConfirmation;

