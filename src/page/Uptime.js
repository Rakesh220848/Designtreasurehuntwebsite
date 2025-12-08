import React, { useEffect, useState } from "react";

const API_BASE =
	process.env.REACT_APP_API_BASE_URL ||
	"https://backend-service-9to0.onrender.com";

const Uptime = () => {
	const [status, setStatus] = useState("checking...");
	const [detail, setDetail] = useState("");

	const checkHealth = async () => {
		try {
			const res = await fetch(`${API_BASE}/api/health`);
			const data = await res.json();
			if (res.ok && data.status === "ok") {
				setStatus("ok");
				setDetail("");
			} else {
				setStatus("degraded");
				setDetail(data.detail || "Unknown issue");
			}
		} catch (err) {
			setStatus("error");
			setDetail(err.message);
		}
	};

	useEffect(() => {
		checkHealth();
		const interval = setInterval(checkHealth, 15000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div style={{ padding: "1rem" }}>
			<h1>Uptime / Health</h1>
			<p>
				Status: <strong>{status}</strong>
			</p>
			{detail && <p>Detail: {detail}</p>}
			<button onClick={checkHealth}>Recheck</button>
		</div>
	);
};

export default Uptime;

