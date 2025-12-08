import React, { useState, useEffect } from "react";
import Scanner from "./Scanner";
import "./Scan.css"; // Import the CSS file

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const Scan = () => {
	const [scannedData, setScannedData] = useState("No result");
	const [teamNumber, setTeamNumber] = useState("");
	const [memberName, setMemberName] = useState("");
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [nextLocationHint, setNextLocationHint] = useState(
		localStorage.getItem("nextLocationHint") // Retrieve data from local storage
	);
	const [deviceId, setDeviceId] = useState(() => {
		const existing = localStorage.getItem("deviceId");
		if (existing) return existing;
		const generated =
			(typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: Math.random().toString(36).slice(2)) + Date.now().toString(36);
		return generated;
	});

	useEffect(() => {
		localStorage.setItem("deviceId", deviceId);
	}, [deviceId]);

	const handleScanData = (data) => {
		setScannedData(data);
		setIsScannerOpen(false);
	};

	const handleError = (error) => {
		console.error("Error:", error);
	};

	const openScanner = () => {
		setIsScannerOpen(true);
	};

	const closeScanner = () => {
		setIsScannerOpen(false);
	};

	const handleSendData = async (e) => {
		e.preventDefault(); // Prevent default form submission behavior

		if (scannedData === "No result" || !teamNumber || !memberName) {
			alert("Please provide scanned data, team number, and member name.");
			return;
		}

		try {
			const response = await fetch(`${API_BASE}/check`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					qrData: scannedData,
					teamNumber: teamNumber,
					deviceId,
					memberName,
				}),
			});
			const result = await response.json();

			if (response.ok) {
				if (result.correct) {
					alert("Correct location! Proceed to the next.");
					setNextLocationHint(result.nextHint);

					// Save the hint to local storage
					localStorage.setItem("nextLocationHint", result.nextHint);
				} else {
					alert("Wrong location! Please try again.");
				}
			} else {
				alert(result.message);
			}
		} catch (error) {
			console.error("Error sending data:", error);
			alert("An error occurred while sending data.");
		}
	};

	// Clear local storage if no hint is available
	useEffect(() => {
		if (!nextLocationHint) {
			localStorage.removeItem("nextLocationHint");
		}
	}, [nextLocationHint]);

	return (
		<div className="container">
			<h1>Track Run</h1>
			<form onSubmit={handleSendData}>
				{scannedData !== "No result" ? (
					<div className="success-message">Scan successful!</div>
				) : (
					<button className="scan-button" type="button" onClick={openScanner}>
						Scan
					</button>
				)}
				<br />
				<label>Team Number:</label>
				<input
					type="text"
					value={teamNumber}
					onChange={(e) => setTeamNumber(e.target.value)}
					required
				/>
			<br />
			<label>Member Name (locked to this device):</label>
			<input
				type="text"
				value={memberName}
				onChange={(e) => setMemberName(e.target.value)}
				required
			/>
				<br />
				<button className="send-button" type="submit">
					Submit
				</button>
			</form>
			{nextLocationHint === "Congo" ? (
				<p>
					Congratulations on finishing the Track Run event! Now, it’s time to
					make your way back to the starting point and celebrate your
					achievement! 🎉
				</p>
			) : (
				<p>Next Location Hint: {nextLocationHint}</p>
			)}
			{isScannerOpen && (
				<div className="modal">
					<div className="modal-content">
						<button className="close-button" onClick={closeScanner}>
							Close
						</button>
						<Scanner onScanData={handleScanData} onError={handleError} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Scan;
