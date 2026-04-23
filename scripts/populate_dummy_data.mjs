// KabaddiHub — Mass Dummy Data Population Script
// Goal: 6 Teams per Tenant, 7 Unique Players per Team (Total 60 Teams, 420 Players)

const SUPABASE_URL = "https://ayuwvopuwqaqzenzwmee.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: SUPABASE_SECRET_KEY environment variable is not set.");
  process.exit(1);
}

// Predefined themes for team generation
const THEMES = [
  "Warriors", "Panthers", "Rhinos", "Stallions", "Bulls", "Titans", 
  "Eagles", "Steelers", "Giants", "Kings", "Wolves", "Sharks", 
  "Hawks", "Rangers", "Storm", "Thunder", "Blaze", "Strikers"
];

const COLORS = [
  "#f97316", "#dc2626", "#2563eb", "#16a34a", "#9333ea", "#db2777", 
  "#0891b2", "#ea580c", "#4f46e5", "#b45309", "#be123c", "#15803d"
];

const FIRST_NAMES = ["Amit", "Rahul", "Sandeep", "Pawan", "Naveen", "Deepak", "Manish", "Sunil", "Ravinder", "Mohit", "Sagar", "Ajith", "Vikash", "Ankush", "Parvesh", "Surjeet", "Girish", "Sahil", "Mahender", "Nitesh"];
const LAST_NAMES = ["Kumar", "Singh", "Yadav", "Dahiya", "Narwal", "Hooda", "Rathee", "Gill", "Pawar", "Deshwal", "Sharma", "Bhardwaj", "Chhillar", "Atrachali", "Nabibakhsh", "Tanwar", "Gulia", "Dhul", "Malik", "Sehrawat"];

async function api(path, method = "GET", body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
      "Prefer": "return=representation"
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`API Error on ${path}: ${err}`);
    return null;
  }
  return res.json();
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  console.log("🚀 Starting Mass Population Task...");

  // 1. Get all tenants
  const tenants = await api("tenants?select=id,name");
  if (!tenants || tenants.length === 0) {
    console.error("No tenants found. Run migrate.mjs first.");
    return;
  }
  console.log(`🏢 Found ${tenants.length} Organisations. Starting build phase...`);

  let totalTeams = 0;
  let totalPlayers = 0;

  for (const t of tenants) {
    console.log(`\n📦 Processing Organisation: ${t.name}`);
    
    for (let i = 1; i <= 6; i++) {
      // 2. Create Teams
      const theme = getRandom(THEMES);
      const teamName = `${t.name.split(' ')[0]} ${theme} ${i}`;
      const shortName = (t.name.charAt(0) + theme.charAt(0) + i).toUpperCase();
      
      const teams = await api("teams", "POST", {
        tenant_id: t.id,
        name: teamName,
        short_name: shortName,
        primary_color: getRandom(COLORS),
        city: t.city || "Pro-Circuit"
      });

      if (!teams || teams.length === 0) continue;
      const team = teams[0];
      totalTeams++;

      // 3. Create Players for this team
      const squad = [];
      for (let j = 1; j <= 7; j++) {
        const firstName = getRandom(FIRST_NAMES);
        const lastName = getRandom(LAST_NAMES);
        const role = j <= 3 ? "RAIDER" : j <= 6 ? "DEFENDER" : "ALL_ROUNDER";
        
        const athletes = await api("athletes", "POST", {
          name: `${firstName} ${lastName}`,
          number: Math.floor(Math.random() * 99).toString().padStart(2, '0'),
          role: role,
          raid_points: Math.floor(Math.random() * 100),
          tackle_points: Math.floor(Math.random() * 50),
          matches_played: Math.floor(Math.random() * 20),
          kyc_status: "VERIFIED",
          status: "ENABLED"
        });

        if (athletes && athletes.length > 0) {
          const athlete = athletes[0];
          totalPlayers++;
          
          // 4. Connect to Team
          await api("team_athletes", "POST", {
            team_id: team.id,
            athlete_id: athlete.id
          });
        }
      }
      process.stdout.write("⚡");
    }
  }

  console.log(`\n\n✅ DATA SYNC COMPLETE!`);
  console.log(`---------------------------------`);
  console.log(`Created Teams:   ${totalTeams}`);
  console.log(`Created Players: ${totalPlayers}`);
  console.log(`Total Athletes Enrolled in Leagues.`);
}

run().catch(console.error);
