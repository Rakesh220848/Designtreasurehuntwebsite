import React, { useState, useEffect } from "react";
import "./SuperAdmin.css";

const API_BASE = (
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com"
).replace(/\/+$/, "");

const ADMIN_CODE = process.env.REACT_APP_ADMIN_CODE || "ADMIN2024XYZ";

const SuperAdmin = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [adminCode, setAdminCode] = useState("");
	const [teams, setTeams] = useState([]);
	const [teamIdToRestrict, setTeamIdToRestrict] = useState("");
	const [expandedTeam, setExpandedTeam] = useState(null);
	const [teamLocations, setTeamLocations] = useState({});
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [systemHealth, setSystemHealth] = useState({
		backend: "checking...",
		frontend: "checking...",
		database: "checking...",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Check if already authenticated
		const authStatus = sessionStorage.getItem("superAdminAuth");
		if (authStatus === "true") {
			setIsAuthenticated(true);
			fetchTeams();
			checkSystemHealth();
		}
	}, []);

	const handleLogin = (e) => {
		e.preventDefault();
		if (adminCode.toUpperCase() === ADMIN_CODE.toUpperCase()) {
			setIsAuthenticated(true);
			sessionStorage.setItem("superAdminAuth", "true");
			fetchTeams();
			checkSystemHealth();
		} else {
			alert("Invalid admin code. Access denied.");
			setAdminCode("");
		}
	};

	const handleLogout = () => {
		setIsAuthenticated(false);
		sessionStorage.removeItem("superAdminAuth");
		setAdminCode("");
	};

	const fetchTeams = async () => {
		try {
			const response = await fetch(`${API_BASE}/api/all-teams`);
			if (response.ok) {
				const data = await response.json();
				setTeams(data.teams || []);
			}
		} catch (error) {
			console.error("Error fetching teams:", error);
		}
	};

	const fetchTeamLocations = async (teamName) => {
		if (teamLocations[teamName]) {
			return; // Already fetched
		}
		setLoadingLocations(true);
		try {
			const response = await fetch(`${API_BASE}/api/team-locations/${teamName}`);
			if (response.ok) {
				const data = await response.json();
				setTeamLocations((prev) => ({
					...prev,
					[teamName]: data.locations || {},
				}));
			}
		} catch (error) {
			console.error("Error fetching team locations:", error);
		} finally {
			setLoadingLocations(false);
		}
	};

	const toggleTeamExpand = async (teamName) => {
		if (expandedTeam === teamName) {
			setExpandedTeam(null);
		} else {
			setExpandedTeam(teamName);
			await fetchTeamLocations(teamName);
		}
	};

	const handleRestrictTeam = async (teamId, restrict) => {
		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/api/restrict-team`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					teamId: teamId || teamIdToRestrict,
					restricted: restrict,
				}),
			});

			const data = await response.json();
			if (response.ok) {
				alert(
					restrict
						? `Team ${teamId || teamIdToRestrict} has been disqualified.`
						: `Team ${teamId || teamIdToRestrict} has been reinstated.`
				);
				setTeamIdToRestrict("");
				fetchTeams();
			} else {
				alert(data.message || "Failed to update team status.");
			}
		} catch (error) {
			console.error("Error restricting team:", error);
			alert("An error occurred while updating team status.");
		} finally {
			setLoading(false);
		}
	};

	const checkSystemHealth = async () => {
		// Check Backend
		try {
			const res = await fetch(`${API_BASE}/api/health`);
			const data = await res.json();
			setSystemHealth((prev) => ({
				...prev,
				backend: res.ok && data.status === "ok" ? "operational" : "degraded",
				database: res.ok && data.status === "ok" ? "connected" : "disconnected",
			}));
		} catch (error) {
			setSystemHealth((prev) => ({
				...prev,
				backend: "offline",
				database: "disconnected",
			}));
		}

		// Check Frontend
		setSystemHealth((prev) => ({
			...prev,
			frontend: window.navigator.onLine ? "operational" : "offline",
		}));
	};

	if (!isAuthenticated) {
		return (
			<div className="super-admin-container">
				<div className="auth-card">
					<h1 className="auth-title">Super Admin Access</h1>
					<p className="auth-subtitle">Enter admin code to continue</p>
					<form onSubmit={handleLogin} className="auth-form">
						<input
							type="password"
							value={adminCode}
							onChange={(e) => setAdminCode(e.target.value)}
							placeholder="Enter Admin Code"
							className="auth-input"
							required
							autoFocus
						/>
						<button type="submit" className="auth-button">
							Authenticate
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="super-admin-container">
			<div className="super-admin-card">
				<div className="admin-header">
					<h1>Super Admin Panel</h1>
					<button onClick={handleLogout} className="logout-btn">
						<span>Logout</span>
					</button>
				</div>

				{/* System Health Check */}
				<div className="health-section">
					<h2>System Health</h2>
					<div className="health-grid">
						<div className="health-item">
							<span className="health-label">Backend:</span>
							<span
								className={`health-status ${
									systemHealth.backend === "operational"
										? "status-ok"
										: "status-error"
								}`}
							>
								{systemHealth.backend}
							</span>
						</div>
						<div className="health-item">
							<span className="health-label">Frontend:</span>
							<span
								className={`health-status ${
									systemHealth.frontend === "operational"
										? "status-ok"
										: "status-error"
								}`}
							>
								{systemHealth.frontend}
							</span>
						</div>
						<div className="health-item">
							<span className="health-label">Database:</span>
							<span
								className={`health-status ${
									systemHealth.database === "connected"
										? "status-ok"
										: "status-error"
								}`}
							>
								{systemHealth.database}
							</span>
						</div>
					</div>
					<button onClick={checkSystemHealth} className="refresh-health-btn">
						<span>Refresh Status</span>
					</button>
				</div>

				{/* Team Restriction */}
				<div className="restrict-section">
					<h2>Disqualify/Restore Team</h2>
					<div className="restrict-form">
						<input
							type="text"
							value={teamIdToRestrict}
							onChange={(e) => setTeamIdToRestrict(e.target.value.toUpperCase())}
							placeholder="Enter Team ID"
							className="restrict-input"
							maxLength={12}
						/>
						<div className="restrict-buttons">
							<button
								onClick={() => handleRestrictTeam("", true)}
								className="restrict-btn restrict"
								disabled={!teamIdToRestrict || loading}
							>
								Disqualify
							</button>
							<button
								onClick={() => handleRestrictTeam("", false)}
								className="restrict-btn restore"
								disabled={!teamIdToRestrict || loading}
							>
								Restore
							</button>
						</div>
					</div>
				</div>

				{/* Teams List */}
				<div className="teams-section">
					<div className="teams-header">
						<h2>All Teams</h2>
						<button onClick={fetchTeams} className="refresh-btn">
							<span>Refresh</span>
						</button>
					</div>
					<div className="teams-table-container">
						<table className="teams-table">
							<thead>
								<tr>
									<th style={{ width: "30px" }}></th>
									<th>Team Name</th>
									<th>Team ID</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{teams.length === 0 ? (
									<tr>
										<td colSpan="5" className="no-teams">
											No teams found
										</td>
									</tr>
								) : (
									teams.map((team) => (
										<React.Fragment key={team.team_id || team.team}>
											<tr className="team-row">
												<td className="expand-cell">
													<button
														className={`expand-btn ${
															expandedTeam === team.team ? "expanded" : ""
														}`}
														onClick={() => toggleTeamExpand(team.team)}
														aria-label="Toggle team details"
													>
														▶
													</button>
												</td>
												<td>{team.team}</td>
												<td className="team-id-cell">{team.team_id || "N/A"}</td>
												<td>
													<span
														className={`status-badge ${
															team.restricted ? "restricted" : "active"
														}`}
													>
														{team.restricted ? "Disqualified" : "Active"}
													</span>
												</td>
												<td>
													<button
														onClick={() =>
															handleRestrictTeam(team.team_id || team.team, !team.restricted)
														}
														className={`action-btn ${
															team.restricted ? "restore" : "restrict"
														}`}
														disabled={loading}
													>
														{team.restricted ? "Restore" : "Disqualify"}
													</button>
												</td>
											</tr>
											{expandedTeam === team.team && (
												<tr className="expandable-row">
													<td colSpan="5">
														<div className="team-locations-container">
															<h3>Assigned Locations</h3>
															{loadingLocations ? (
																<div className="loading-spinner">Loading...</div>
															) : teamLocations[team.team] ? (
																<div className="locations-flow">
																	<div className="location-item start">
																		<span className="location-label">START</span>
																		<span className="location-code">CLG</span>
																	</div>
																	{[1, 2, 3, 4, 5].map((num) => {
																		const locCode = teamLocations[team.team][`location${num}`];
																		return (
																			<React.Fragment key={`loc${num}`}>
																				<span className="flow-arrow">→</span>
																				<div className="location-item">
																					<span className="location-label">LOC {num}</span>
																					<span className="location-code">{locCode || "N/A"}</span>
																				</div>
																			</React.Fragment>
																		);
																	})}
																	<span className="flow-arrow">→</span>
																	<div className="location-item end">
																		<span className="location-label">END</span>
																		<span className="location-code">{teamLocations[team.team].end_location || "N/A"}</span>
																	</div>
																</div>
															) : (
																<div className="no-locations">No locations found</div>
															)}
														</div>
													</td>
												</tr>
											)}
										</React.Fragment>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SuperAdmin;

