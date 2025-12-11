import React, { useState, useEffect } from "react";
import Scanner from "./Scanner";
import "./Scan.css"; // Import the CSS file

const API_BASE = (
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com"
).replace(/\/+$/, "");

const Scan = () => {
	const [scannedData, setScannedData] = useState("No result");
	const [teamNumber, setTeamNumber] = useState("");
	const [memberName, setMemberName] = useState("");
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [nextLocationHint, setNextLocationHint] = useState(
		localStorage.getItem("nextLocationHint") // Retrieve data from local storage
	);
	const [userLocation, setUserLocation] = useState(null);
	const [locationError, setLocationError] = useState(null);
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

	// Geolocation Effect
	useEffect(() => {
		if (navigator.geolocation) {
			const watchId = navigator.geolocation.watchPosition(
				(position) => {
					setUserLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						accuracy: position.coords.accuracy,
					});
					setLocationError(null);
				},
				(error) => {
					setLocationError(error.message);
					console.error("Geolocation error:", error);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				}
			);
			return () => navigator.geolocation.clearWatch(watchId);
		} else {
			setLocationError("Geolocation not supported by your browser");
		}
	}, []);

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

		if (!userLocation) {
			alert("Unable to get your location. Please enable location services.");
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
					latitude: userLocation.latitude,
					longitude: userLocation.longitude,
				}),
			});
			const result = await response.json();

			if (response.ok) {
				if (result.correct) {
					alert("Correct location! Proceed to the next.");
					setNextLocationHint(result.nextHint);

					// Save the hint to local storage
					localStorage.setItem("nextLocationHint", result.nextHint);
					setScannedData("No result"); // Reset for next scan
				} else {
					alert(result.message || "Wrong location! Please try again.");
				}
			} else {
				alert(result.message || "An error occurred");
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
				<label>Team ID:</label>
				<input
					type="text"
					value={teamNumber}
					onChange={(e) => setTeamNumber(e.target.value.toUpperCase())}
					placeholder="Enter your Team ID"
					required
					style={{ textTransform: "uppercase", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}
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
			
			{/* Location Status Display */}
			<div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem", padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: "10px" }}>
				{locationError ? (
					<p style={{ color: "#ff4444", margin: "0" }}>
						📍 Location Error: {locationError}
					</p>
				) : userLocation ? (
					<div>
						<p style={{ color: "#00d9ff", margin: "5px 0" }}>
							✓ Location Active
						</p>
						<p style={{ fontSize: "0.8rem", color: "#aaa", margin: "5px 0" }}>
							Accuracy: {Math.round(userLocation.accuracy)}m
						</p>
					</div>
				) : (
					<p style={{ color: "#ffaa00", margin: "0" }}>📍 Getting location...</p>
				)}
			</div>

			{nextLocationHint === "Congo" ? (
				<p>
					Congratulations on finishing the Track Run event! Now, it's time to
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
