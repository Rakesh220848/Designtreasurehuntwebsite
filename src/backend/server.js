require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5050;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
// Allow local dev plus the hosted frontend by default; can be overridden via env
const allowedOrigins = (
	process.env.ALLOWED_ORIGINS ||
	"http://localhost:3000,https://event-site-x3qm.onrender.com"
)
	.split(",")
	.map((o) => o.trim());

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
	})
);
app.use(bodyParser.json());

// Route to handle the location check and verification
// Route to handle the location check and verification
app.post("/check", async (req, res) => {
	const { qrData, teamNumber, deviceId, memberName } = req.body;

	// Normalize strings to reduce false negatives from casing/whitespace
	const normalize = (val) =>
		(val === null || val === undefined ? "" : String(val))
			.trim()
			.toUpperCase();

	if (!deviceId) {
		return res
			.status(400)
			.json({ message: "Missing device identifier. Please rescan." });
	}

	try {
		// Step 1: Retrieve team data from setlocation table
		const { data: setlocationData, error: teamError } = await supabase
			.from("setlocation")
			.select(
				"start, location1, location2, location3, location4, location5, end_location"
			)
			.eq("team", teamNumber)
			.single();

		if (teamError || !setlocationData) {
			return res.status(400).json({ message: "Invalid team number" });
		}

		// Step 2: Retrieve current status from verifylocation table
		const { data: verifylocationData, error: verifyError } = await supabase
			.from("verifylocation")
			.select(
				"start, location1, location2, location3, location4, location5, end_location, locked_device, locked_member, start_time, location1_time, location2_time, location3_time, location4_time, location5_time, restricted"
			)
			.eq("team", teamNumber)
			.single();

		if (verifyError || !verifylocationData) {
			return res.status(500).json({ message: "Unexpected error occurred" });
		}

		// Step 2.5: Check if team is restricted
		if (verifylocationData.restricted) {
			return res.status(403).json({
				message: "This team has been disqualified and cannot scan QR codes.",
			});
		}

		// Step 3: Enforce single-device lock per team
		if (verifylocationData.locked_device) {
			if (verifylocationData.locked_device !== deviceId) {
				return res.status(403).json({
					message:
						"Scanning is locked to a different device for this team. Please use the original device.",
				});
			}
		} else {
			const { error: lockError } = await supabase
				.from("verifylocation")
				.update({
					locked_device: deviceId,
					locked_member: memberName || "Unknown",
				})
				.eq("team", teamNumber);
			if (lockError) {
				return res
					.status(500)
					.json({ message: "Failed to lock device for this team" });
			}
		}

		// Step 4: Check if the start location is verified
		if (!verifylocationData.start) {
			if (normalize(qrData) === normalize(setlocationData.start)) {
				// Fetch hint for the first location
				const { data: locationHintData, error: hintError } = await supabase
					.from("location")
					.select("location_hint")
					.eq("location_code", setlocationData.location1)
					.single();

				if (hintError || !locationHintData) {
					return res
						.status(500)
						.json({ message: "Failed to fetch location hint" });
				}

				// Update start location in verifylocation
				const { error: updateError } = await supabase
					.from("verifylocation")
					.update({
						start: setlocationData.start,
						start_time: new Date().toISOString(),
					})
					.eq("team", teamNumber);

				if (updateError) {
					return res
						.status(500)
						.json({ message: "Failed to update start location" });
				}

				return res.status(200).json({
					correct: true,
					nextHint: `${locationHintData.location_hint}`,
				});
			} else {
				return res
					.status(400)
					.json({ correct: false, message: "Incorrect start location" });
			}
		}

		// Step 4: Check the next location to verify (location1 to location5)
		let locationIndex = null;
		let locationField = null;
		let nextHint = null;

		for (let i = 1; i <= 5; i++) {
			if (!verifylocationData[`location${i}`]) {
				locationIndex = i;
				locationField = `location${i}`;

				// Fetch hint for the next location
				const { data: nextLocationHintData, error: nextHintError } =
					await supabase
						.from("location")
						.select("location_hint")
						.eq("location_code", setlocationData[`location${i + 1}`])
						.single();

				nextHint =
					nextHintError || !nextLocationHintData
						? "Congo"
						: `${nextLocationHintData.location_hint}`;
				break;
			}
		}

		if (!locationField) {
			return res
				.status(400)
				.json({ message: "All locations have already been visited" });
		}

		// Step 4.1: Compare QR data with the current location field
		if (normalize(qrData) === normalize(setlocationData[locationField])) {
			// Convert current time to IST
			const currentTimeIST = new Date(
				new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
			).toISOString();

			// Update the verified location in verifylocation
			const { error: updateError } = await supabase
				.from("verifylocation")
				.update({
					[locationField]: setlocationData[locationField],
					[`${locationField}_time`]: currentTimeIST,
				})
				.eq("team", teamNumber);

			if (updateError) {
				return res.status(500).json({ message: "Failed to update location" });
			}

			// Insert the same data into the "check" table
			const { error: insertError } = await supabase.from("register").insert({
				team_name: teamNumber,
				time: new Date(
					new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
				)
					.toTimeString()
					.split(" ")[0], // Save only the time
				location: setlocationData[locationField],
			});

			if (insertError) {
				return res
					.status(500)
					.json({ message: "Failed to log data in check table" });
			}

			return res.status(200).json({ correct: true, nextHint });
		} else {
			// Incorrect QR data
			return res
				.status(400)
				.json({ correct: false, message: "Wrong location" });
		}
	} catch (error) {
		console.error("Error processing request:", error.message);
		return res.status(500).json({ message: "Unexpected error occurred" });
	}
});

// Cache for locations to avoid fetching every time
let locationsCache = null;
let locationsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get locations (with caching)
async function getLocations() {
	const now = Date.now();
	if (locationsCache && (now - locationsCacheTime) < CACHE_DURATION) {
		return locationsCache;
	}

	const { data, error } = await supabase
		.from("location")
		.select("location_code")
		.neq("location_code", "CLG");

	if (error) {
		console.error("Supabase location fetch error:", {
			message: error.message,
			code: error.code,
			details: error.details,
		});
		throw new Error(`Failed to fetch locations: ${error.message}`);
	}

	if (!data || data.length === 0) {
		console.warn("No location data found in database");
		throw new Error("No locations available in database");
	}

	locationsCache = data.map((loc) => loc.location_code);
	locationsCacheTime = now;
	console.log(`Cached ${locationsCache.length} locations:`, locationsCache);
	return locationsCache;
}

// Helper function to generate meaningful Team_ID
function generateTeamId() {
	// Format: TR-XXXXXX (Treasure Run - Random 6 digits)
	// This is more memorable and meaningful
	const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
	return `TR-${randomNum}`;
}

// Optimized route to save locations to setlocation table
app.post("/save-locations", async (req, res) => {
	const { team, members } = req.body;

	if (!team || !members || members.length === 0) {
		return res.status(400).json({ error: "Invalid input data" });
	}

	try {
		// Step 1: Get locations (cached) and generate Team_ID in parallel
		const [availableLocations, teamId] = await Promise.all([
			getLocations(),
			Promise.resolve(generateTeamId()),
		]);

		// Step 2: Shuffle and pick 5 unique locations (optimized shuffle)
		const shuffled = [...availableLocations];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		const uniqueLocations = shuffled.slice(0, 5);

		if (uniqueLocations.length !== 5) {
			return res
				.status(500)
				.json({ error: "Failed to generate unique locations" });
		}

		// Step 3: Structure all data for parallel insertion
		const locationData = {
			team: team,
			start: "CLG",
			location1: uniqueLocations[0],
			location2: uniqueLocations[1],
			location3: uniqueLocations[2],
			location4: uniqueLocations[3],
			location5: uniqueLocations[4],
			end_location: "CLG",
		};

		const teamData = {
			team: team,
			team_id: teamId, // Include team_id in initial insert
			member1: members[0] || null,
			member2: members[1] || null,
			member3: members[2] || null,
			member4: members[3] || null,
		};

		const verifyData = {
			team: team,
			team_id: teamId,
			start: "CLG",
			location1: null,
			location2: null,
			location3: null,
			location4: null,
			location5: null,
			end_location: null,
			restricted: false,
		};

		// Step 4: Execute all inserts in parallel for maximum speed
		const [teamResult, locationResult, verifyResult] = await Promise.all([
			supabase.from("team_no").insert([teamData]),
			supabase.from("setlocation").insert([locationData]),
			supabase.from("verifylocation").insert([verifyData]),
		]);

		// Check for errors
		if (teamResult.error) {
			console.error("Error adding team:", teamResult.error);
			console.error("Error details:", {
				message: teamResult.error.message,
				code: teamResult.error.code,
				details: teamResult.error.details,
			});
			return res.status(500).json({ error: "Failed to add team", details: teamResult.error.message });
		}

		if (locationResult.error) {
			console.error("Error saving locations:", locationResult.error);
			console.error("Error details:", {
				message: locationResult.error.message,
				code: locationResult.error.code,
				details: locationResult.error.details,
			});
			return res.status(500).json({ error: "Failed to save locations", details: locationResult.error.message });
		}

		if (verifyResult.error) {
			console.error("Error initializing verification:", verifyResult.error);
			console.error("Error details:", {
				message: verifyResult.error.message,
				code: verifyResult.error.code,
				details: verifyResult.error.details,
			});
			return res
				.status(500)
				.json({ error: "Failed to initialize verification", details: verifyResult.error.message });
		}

		// Return success response immediately
		res.status(200).json({
			message: "Locations assigned successfully",
			teamId: teamId,
			locations: locationData,
		});
	} catch (error) {
		console.error("Unexpected error:", error.message);
		res.status(500).json({ error: "Unexpected error occurred" });
	}
});

app.get("/api/registered", async (req, res) => {
	try {
		const { data, error } = await supabase.from("register").select("*");
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.all("/api/ping", (req, res) => {
	console.log("Keep-alive ping successful.");
	res.json({ status: "ok" });
});

app.get("/api/health", async (req, res) => {
	try {
		const { error } = await supabase
			.from("location")
			.select("location_code", { count: "exact", head: true });
		if (error) {
			return res.status(500).json({ status: "error", detail: error.message });
		}
		return res.json({ status: "ok" });
	} catch (err) {
		return res.status(500).json({ status: "error", detail: err.message });
	}
});

app.get("/api/leaderboard", async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("verifylocation")
			.select(
				"team, team_id, start, location1, location2, location3, location4, location5, end_location, start_time, location1_time, location2_time, location3_time, location4_time, location5_time, restricted"
			);

		if (error) {
			return res.status(500).json({ message: error.message });
		}

		const computeProgress = (row) => {
			const checkpoints = [
				row.start,
				row.location1,
				row.location2,
				row.location3,
				row.location4,
				row.location5,
			];
			return checkpoints.filter(Boolean).length;
		};

		const computeLastTime = (row) => {
			const times = [
				row.location5_time,
				row.location4_time,
				row.location3_time,
				row.location2_time,
				row.location1_time,
				row.start_time,
			].filter(Boolean);
			return times.length ? times[0] : null;
		};

		const leaderboard = data
			.filter((row) => !row.restricted) // Filter out restricted teams
			.map((row) => ({
				team: row.team,
				teamId: row.team_id,
				progress: computeProgress(row),
				lastTime: computeLastTime(row),
				status: row.location5 ? "Finished" : "In Progress",
			}))
			.sort((a, b) => {
				if (b.progress !== a.progress) return b.progress - a.progress;
				if (a.lastTime && b.lastTime)
					return new Date(a.lastTime) - new Date(b.lastTime);
				return 0;
			});

		return res.json({ leaderboard });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// Get all teams for SuperAdmin
app.get("/api/all-teams", async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("verifylocation")
			.select("team, team_id, restricted");

		if (error) {
			return res.status(500).json({ message: error.message });
		}

		return res.json({ teams: data || [] });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// Restrict/Unrestrict team
app.post("/api/restrict-team", async (req, res) => {
	const { teamId, restricted } = req.body;

	if (!teamId) {
		return res.status(400).json({ message: "Team ID is required" });
	}

	try {
		// Find team by team_id or team name
		const { data: teamData, error: findError } = await supabase
			.from("verifylocation")
			.select("team, team_id")
			.or(`team_id.eq.${teamId},team.eq.${teamId}`)
			.limit(1)
			.single();

		if (findError || !teamData) {
			return res.status(404).json({ message: "Team not found" });
		}

		const { error: updateError } = await supabase
			.from("verifylocation")
			.update({ restricted: restricted === true })
			.eq("team", teamData.team);

		if (updateError) {
			return res.status(500).json({ message: updateError.message });
		}

		return res.json({
			message: `Team ${restricted ? "restricted" : "unrestricted"} successfully`,
			teamId: teamData.team_id || teamData.team,
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// Get team locations for admin view
app.get("/api/team-locations/:teamName", async (req, res) => {
	const { teamName } = req.params;

	if (!teamName) {
		return res.status(400).json({ message: "Team name is required" });
	}

	try {
		const { data: locations, error } = await supabase
			.from("setlocation")
			.select("location1, location2, location3, location4, location5, end_location")
			.eq("team", teamName)
			.single();

		if (error || !locations) {
			return res.status(404).json({ message: "Team locations not found" });
		}

		return res.json({ locations });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
