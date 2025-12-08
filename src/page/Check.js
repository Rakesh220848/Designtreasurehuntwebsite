import React, { useEffect, useState } from "react";
import "./Check.css";

const API_BASE =
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com";

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

	return (
		<div className="check-page">
			<h1>Location Visited with Time</h1>
			<button onClick={pingBackend} hidden>
				Ping Backend
			</button>
			<h2>Leaderboard</h2>
			<table border="1">
				<thead>
					<tr>
						<th>Rank</th>
						<th>Team</th>
						<th>Progress</th>
						<th>Last Update</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((row, idx) => (
						<tr key={row.team}>
							<td>{idx + 1}</td>
							<td>{row.team}</td>
							<td>{row.progress}/6</td>
							<td>{row.lastTime ? new Date(row.lastTime).toLocaleTimeString() : "-"}</td>
							<td>{row.status}</td>
						</tr>
					))}
				</tbody>
			</table>

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
