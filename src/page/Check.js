import React, { useEffect, useState } from "react";
import "./Check.css";

const API_BASE = (
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com"
).replace(/\/+$/, "");

const Check = () => {
	const [data, setData] = useState([]);
	const [leaderboard, setLeaderboard] = useState([]);

	// Function to fetch registered data
	const fetchData = () => {
		fetch(`${API_BASE}/api/registered`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => setData(data))
			.catch((error) => console.error("Error fetching data:", error));
	};

	const fetchLeaderboard = () => {
		fetch(`${API_BASE}/api/leaderboard`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => setLeaderboard(data.leaderboard || []))
			.catch((error) => console.error("Error fetching leaderboard:", error));
	};

	// Function to ping the backend
	const pingBackend = () => {
		fetch(`${API_BASE}/api/ping`, {
			method: "POST", // Accepts POST/GET
			headers: { "Content-Type": "application/json" },
			// body: JSON.stringify({ /* any required data */ }), // Include if needed
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Ping failed");
				}
				return response.json();
			})
			.then((data) => {
				console.log("Ping successful:", data);
				// Optionally handle the response data
			})
			.catch((error) => console.error("Error pinging backend:", error));
	};

	useEffect(() => {
		// Fetch initial data
		fetchData();
		fetchLeaderboard();

		// Set up interval to ping backend every 30 seconds (30000 ms)
		const intervalId = setInterval(() => {
			pingBackend();
		}, 5000);

		// Optional: Fetch data periodically as well (e.g., every 30 seconds)
		const dataIntervalId = setInterval(() => {
			fetchData();
			fetchLeaderboard();
		}, 60000);

		// Clean up intervals on component unmount
		return () => {
			clearInterval(intervalId);
			clearInterval(dataIntervalId);
		};
	}, []);

	const leadingTeam = leaderboard.length > 0 ? leaderboard[0] : null;
	const maxProgress = leadingTeam ? leadingTeam.progress : 0;

	return (
		<div className="check-page">
			<h1>Location Visited with Time</h1>
			<button onClick={pingBackend} hidden>
				Ping Backend
			</button>
			
			{/* Leading Team Highlight */}
			{leadingTeam && maxProgress > 0 && (
				<div className="leader-highlight">
					<div className="leader-badge">🏆</div>
					<div className="leader-info">
						<h3>Current Leader</h3>
						<p className="leader-team">{leadingTeam.team}</p>
						<p className="leader-progress">{leadingTeam.progress}/6 locations completed</p>
					</div>
				</div>
			)}

			<h2>Leaderboard</h2>
			<div className="table-container">
				<table className="leaderboard-table">
					<thead>
						<tr>
							<th>Rank</th>
							<th>Team</th>
							<th>Team ID</th>
							<th>Progress</th>
							<th>Last Update</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{leaderboard.length === 0 ? (
							<tr>
								<td colSpan="6" className="no-data">No teams on leaderboard yet</td>
							</tr>
						) : (
							leaderboard.map((row, idx) => (
								<tr key={row.team} className={idx === 0 ? "top-team" : ""}>
									<td className="rank-cell">
										{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
									</td>
									<td>{row.team}</td>
									<td className="team-id-cell">{row.teamId || "N/A"}</td>
									<td>
										<div className="progress-container">
											<span className="progress-text">{row.progress}/6</span>
											<div className="progress-bar">
												<div 
													className="progress-fill" 
													style={{ width: `${(row.progress / 6) * 100}%` }}
												></div>
											</div>
										</div>
									</td>
									<td>{row.lastTime ? new Date(row.lastTime).toLocaleTimeString() : "-"}</td>
									<td>
										<span className={`status-badge ${row.status === "Finished" ? "finished" : "in-progress"}`}>
											{row.status}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<h2>Activity Log</h2>
			<table border="1">
				<thead>
					<tr>
						<th>ID</th>
						<th>Team Name</th>
						<th>Location</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<tr key={row.id}>
							<td>{row.id}</td>
							<td>{row.team_name}</td>
							<td>{row.location}</td>
							<td>{row.time}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Check;
