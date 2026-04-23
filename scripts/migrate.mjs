// KabaddiHub — Supabase Database Migration Script
// Run with: node scripts/migrate.mjs

const SUPABASE_URL = "https://ayuwvopuwqaqzenzwmee.supabase.co";

// Now reading from environment variables for security. 
// Use your new 'sb_secret_...' key here.
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: SUPABASE_SECRET_KEY environment variable is not set.");
  console.log("Run with: $env:SUPABASE_SECRET_KEY='your_new_secret_key'; node scripts/migrate.mjs");
  process.exit(1);
}

// Use Supabase's pg connection via the REST API for raw SQL
async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SQL Error: ${err}`);
  }
  return res.json().catch(() => "OK");
}

async function insertRow(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
      "Prefer": "resolution=ignore-duplicates",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`  ⚠ Insert to ${table} warning: ${err}`);
  }
}

async function checkTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
    },
  });
  return res.ok;
}

const TENANTS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Pro Kabaddi Official", slug: "pkl", primary_color: "#f97316", secondary_color: "#0f172a", subscription_tier: "ENTERPRISE", admin_email: "admin@pkl.com", admin_password: "admin123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Bengaluru Bulls Franchise", slug: "bengaluru-bulls", primary_color: "#dc2626", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@bulls.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000003", name: "Dabang Delhi KC", slug: "dabang-delhi", primary_color: "#2563eb", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@delhi.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000004", name: "Gujarat Giants", slug: "gujarat-giants", primary_color: "#ea580c", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@gujarat.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000005", name: "Haryana Steelers", slug: "haryana-steelers", primary_color: "#0891b2", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@haryana.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000006", name: "Jaipur Pink Panthers", slug: "jaipur-pink-panthers", primary_color: "#db2777", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@jaipur.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000007", name: "Patna Pirates", slug: "patna-pirates", primary_color: "#16a34a", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@patna.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000008", name: "Puneri Paltan", slug: "puneri-paltan", primary_color: "#f59e0b", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@puneri.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000009", name: "Tamil Thalaivas", slug: "tamil-thalaivas", primary_color: "#0369a1", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@tamil.com", admin_password: "password123", status: "ENABLED" },
  { id: "00000000-0000-0000-0000-000000000010", name: "Telugu Titans", slug: "telugu-titans", primary_color: "#e11d48", secondary_color: "#1e293b", subscription_tier: "PRO", admin_email: "admin@telugu.com", admin_password: "password123", status: "ENABLED" },
];

const ATHLETES = [
  { name: "Pawan Sehrawat", number: "17", role: "RAIDER", raid_points: 120, tackle_points: 5, matches_played: 20, super_raids: 10, super_tackles: 0, super_tens: 10, high_fives: 0, kyc_status: "VERIFIED", status: "ENABLED", city: "Bangalore", email: "pawan@kabaddi.in" },
  { name: "Naveen Kumar", number: "10", role: "RAIDER", raid_points: 115, tackle_points: 2, matches_played: 18, super_raids: 8, super_tackles: 0, super_tens: 11, high_fives: 0, kyc_status: "VERIFIED", status: "ENABLED", city: "Delhi", email: "naveen@kabaddi.in" },
  { name: "Maninder Singh", number: "09", role: "RAIDER", raid_points: 110, tackle_points: 1, matches_played: 19, super_raids: 7, super_tackles: 0, super_tens: 9, high_fives: 0, kyc_status: "VERIFIED", status: "ENABLED", city: "Punjab", email: "maninder@kabaddi.in" },
  { name: "Pardeep Narwal", number: "01", role: "RAIDER", raid_points: 130, tackle_points: 0, matches_played: 22, super_raids: 15, super_tackles: 0, super_tens: 12, high_fives: 0, kyc_status: "VERIFIED", status: "ENABLED", city: "UP", email: "pardeep@kabaddi.in" },
  { name: "Arjun Deshwal", number: "04", role: "RAIDER", raid_points: 105, tackle_points: 3, matches_played: 17, super_raids: 6, super_tackles: 0, super_tens: 8, high_fives: 0, kyc_status: "VERIFIED", status: "ENABLED", city: "Haryana", email: "arjun@kabaddi.in" },
  { name: "Fazel Atrachali", number: "07", role: "DEFENDER", raid_points: 0, tackle_points: 80, matches_played: 22, super_raids: 0, super_tackles: 8, super_tens: 0, high_fives: 8, kyc_status: "VERIFIED", status: "ENABLED", city: "Iran", email: "fazel@kabaddi.in" },
  { name: "Mohammadreza Chiyaneh", number: "13", role: "DEFENDER", raid_points: 5, tackle_points: 85, matches_played: 21, super_raids: 0, super_tackles: 10, super_tens: 0, high_fives: 9, kyc_status: "VERIFIED", status: "ENABLED", city: "Iran", email: "chiyaneh@kabaddi.in" },
  { name: "Sagar Rathee", number: "05", role: "DEFENDER", raid_points: 0, tackle_points: 75, matches_played: 20, super_raids: 0, super_tackles: 6, super_tens: 0, high_fives: 7, kyc_status: "VERIFIED", status: "ENABLED", city: "Haryana", email: "sagar@kabaddi.in" },
  { name: "Surjeet Singh", number: "06", role: "DEFENDER", raid_points: 0, tackle_points: 78, matches_played: 22, super_raids: 0, super_tackles: 5, super_tens: 0, high_fives: 6, kyc_status: "VERIFIED", status: "ENABLED", city: "Punjab", email: "surjeet@kabaddi.in" },
  { name: "Mohammad Nabibakhsh", number: "11", role: "ALL_ROUNDER", raid_points: 60, tackle_points: 45, matches_played: 20, super_raids: 2, super_tackles: 5, super_tens: 2, high_fives: 3, kyc_status: "VERIFIED", status: "ENABLED", city: "Iran", email: "nabibakhsh@kabaddi.in" },
  { name: "Vijay Malik", number: "08", role: "ALL_ROUNDER", raid_points: 75, tackle_points: 35, matches_played: 19, super_raids: 3, super_tackles: 2, super_tens: 3, high_fives: 1, kyc_status: "VERIFIED", status: "ENABLED", city: "Haryana", email: "vijay@kabaddi.in" },
  { name: "Bharat Hooda", number: "21", role: "RAIDER", raid_points: 85, tackle_points: 8, matches_played: 18, super_raids: 4, super_tackles: 0, super_tens: 5, high_fives: 0, kyc_status: "VERIFIED", status: "ENABLED", city: "Haryana", email: "bharat@kabaddi.in" },
  { name: "Abhishek Singh", number: "12", role: "RAIDER", raid_points: 78, tackle_points: 4, matches_played: 16, super_raids: 3, super_tackles: 0, super_tens: 4, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "UP", email: "abhishek@kabaddi.in" },
  { name: "Vikash Kandola", number: "15", role: "RAIDER", raid_points: 70, tackle_points: 2, matches_played: 17, super_raids: 2, super_tackles: 0, super_tens: 3, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "vikash@kabaddi.in" },
  { name: "Chandran Ranjit", number: "14", role: "RAIDER", raid_points: 65, tackle_points: 3, matches_played: 15, super_raids: 2, super_tackles: 0, super_tens: 2, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Tamil Nadu", email: "chandran@kabaddi.in" },
  { name: "Meet Ibrahim", number: "22", role: "RAIDER", raid_points: 60, tackle_points: 1, matches_played: 14, super_raids: 1, super_tackles: 0, super_tens: 2, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Gujarat", email: "meet@kabaddi.in" },
  { name: "Guman Singh", number: "25", role: "RAIDER", raid_points: 72, tackle_points: 5, matches_played: 16, super_raids: 3, super_tackles: 0, super_tens: 4, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Rajasthan", email: "guman@kabaddi.in" },
  { name: "Manjeet Sharma", number: "30", role: "RAIDER", raid_points: 58, tackle_points: 2, matches_played: 13, super_raids: 1, super_tackles: 0, super_tens: 1, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "manjeet@kabaddi.in" },
  { name: "Sahil Singh", number: "03", role: "DEFENDER", raid_points: 0, tackle_points: 55, matches_played: 18, super_raids: 0, super_tackles: 4, super_tens: 0, high_fives: 4, kyc_status: "PENDING", status: "ENABLED", city: "Punjab", email: "sahil@kabaddi.in" },
  { name: "Jaideep Dahiya", number: "18", role: "DEFENDER", raid_points: 0, tackle_points: 62, matches_played: 19, super_raids: 0, super_tackles: 5, super_tens: 0, high_fives: 5, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "jaideep@kabaddi.in" },
  { name: "Saurabh Nandal", number: "16", role: "DEFENDER", raid_points: 0, tackle_points: 58, matches_played: 17, super_raids: 0, super_tackles: 4, super_tens: 0, high_fives: 4, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "saurabh@kabaddi.in" },
  { name: "Vishal Bhardwaj", number: "02", role: "DEFENDER", raid_points: 2, tackle_points: 52, matches_played: 16, super_raids: 0, super_tackles: 3, super_tens: 0, high_fives: 3, kyc_status: "PENDING", status: "ENABLED", city: "Delhi", email: "vishal@kabaddi.in" },
  { name: "Parvesh Bhainswal", number: "19", role: "DEFENDER", raid_points: 0, tackle_points: 54, matches_played: 18, super_raids: 0, super_tackles: 4, super_tens: 0, high_fives: 4, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "parvesh@kabaddi.in" },
  { name: "Mahender Singh", number: "23", role: "DEFENDER", raid_points: 0, tackle_points: 48, matches_played: 15, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "mahender@kabaddi.in" },
  { name: "Rohit Gulia", number: "20", role: "ALL_ROUNDER", raid_points: 55, tackle_points: 25, matches_played: 17, super_raids: 1, super_tackles: 1, super_tens: 1, high_fives: 1, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "rohit@kabaddi.in" },
  { name: "Nitin Rawal", number: "24", role: "ALL_ROUNDER", raid_points: 45, tackle_points: 30, matches_played: 16, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "UP", email: "nitin@kabaddi.in" },
  { name: "Akash Shinde", number: "27", role: "RAIDER", raid_points: 52, tackle_points: 3, matches_played: 14, super_raids: 1, super_tackles: 0, super_tens: 1, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Maharashtra", email: "akash@kabaddi.in" },
  { name: "Ajinkya Pawar", number: "31", role: "RAIDER", raid_points: 45, tackle_points: 2, matches_played: 12, super_raids: 1, super_tackles: 0, super_tens: 1, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Maharashtra", email: "ajinkya@kabaddi.in" },
  { name: "Aslam Inamdar", number: "32", role: "RAIDER", raid_points: 48, tackle_points: 10, matches_played: 13, super_raids: 1, super_tackles: 1, super_tens: 1, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Maharashtra", email: "aslam@kabaddi.in" },
  { name: "Mohit Goyat", number: "33", role: "RAIDER", raid_points: 42, tackle_points: 15, matches_played: 12, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "mohitg@kabaddi.in" },
  { name: "Sachin Tanwar", number: "34", role: "RAIDER", raid_points: 50, tackle_points: 5, matches_played: 14, super_raids: 1, super_tackles: 0, super_tens: 1, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "sachin@kabaddi.in" },
  { name: "Siddharth Desai", number: "35", role: "RAIDER", raid_points: 55, tackle_points: 0, matches_played: 11, super_raids: 2, super_tackles: 0, super_tens: 2, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Maharashtra", email: "siddharth@kabaddi.in" },
  { name: "Monu Goyat", number: "36", role: "RAIDER", raid_points: 38, tackle_points: 5, matches_played: 13, super_raids: 0, super_tackles: 0, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "monu@kabaddi.in" },
  { name: "Surender Gill", number: "37", role: "RAIDER", raid_points: 46, tackle_points: 8, matches_played: 14, super_raids: 1, super_tackles: 1, super_tens: 1, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Punjab", email: "surender@kabaddi.in" },
  { name: "K. Prapanjan", number: "38", role: "RAIDER", raid_points: 35, tackle_points: 2, matches_played: 12, super_raids: 0, super_tackles: 0, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Tamil Nadu", email: "prapanjan@kabaddi.in" },
  { name: "Mohit Chhillar", number: "39", role: "DEFENDER", raid_points: 0, tackle_points: 40, matches_played: 15, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "mohitc@kabaddi.in" },
  { name: "Ravinder Pahal", number: "40", role: "DEFENDER", raid_points: 0, tackle_points: 45, matches_played: 16, super_raids: 0, super_tackles: 3, super_tens: 0, high_fives: 3, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "ravinder@kabaddi.in" },
  { name: "Girish Ernak", number: "41", role: "DEFENDER", raid_points: 0, tackle_points: 38, matches_played: 14, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Maharashtra", email: "girish@kabaddi.in" },
  { name: "Sandeep Dhull", number: "42", role: "DEFENDER", raid_points: 0, tackle_points: 42, matches_played: 15, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "sandeepd@kabaddi.in" },
  { name: "Rinku Narwal", number: "43", role: "DEFENDER", raid_points: 0, tackle_points: 35, matches_played: 13, super_raids: 0, super_tackles: 1, super_tens: 0, high_fives: 1, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "rinku@kabaddi.in" },
  { name: "Aman Sehrawat", number: "44", role: "DEFENDER", raid_points: 0, tackle_points: 37, matches_played: 14, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "aman@kabaddi.in" },
  { name: "Nitesh Kumar", number: "45", role: "DEFENDER", raid_points: 0, tackle_points: 41, matches_played: 16, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Bihar", email: "nitesh@kabaddi.in" },
  { name: "Sumit Sangwan", number: "46", role: "DEFENDER", raid_points: 0, tackle_points: 39, matches_played: 15, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "sumit@kabaddi.in" },
  { name: "Deepak Niwas Hooda", number: "47", role: "ALL_ROUNDER", raid_points: 40, tackle_points: 20, matches_played: 14, super_raids: 0, super_tackles: 0, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "deepak@kabaddi.in" },
  { name: "Sandeep Narwal", number: "48", role: "ALL_ROUNDER", raid_points: 30, tackle_points: 35, matches_played: 16, super_raids: 0, super_tackles: 1, super_tens: 0, high_fives: 1, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "sandeepn@kabaddi.in" },
  { name: "Prateek Dahiya", number: "49", role: "ALL_ROUNDER", raid_points: 35, tackle_points: 15, matches_played: 12, super_raids: 0, super_tackles: 0, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "prateek@kabaddi.in" },
  { name: "Amirhossein Bastami", number: "50", role: "DEFENDER", raid_points: 0, tackle_points: 32, matches_played: 13, super_raids: 0, super_tackles: 1, super_tens: 0, high_fives: 1, kyc_status: "PENDING", status: "ENABLED", city: "Iran", email: "bastami@kabaddi.in" },
  { name: "Nitin Dhankar", number: "51", role: "RAIDER", raid_points: 30, tackle_points: 1, matches_played: 10, super_raids: 0, super_tackles: 0, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "nitind@kabaddi.in" },
  { name: "Surender Nada", number: "52", role: "DEFENDER", raid_points: 0, tackle_points: 38, matches_played: 14, super_raids: 0, super_tackles: 2, super_tens: 0, high_fives: 2, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "surendern@kabaddi.in" },
  { name: "Ran Singh", number: "53", role: "ALL_ROUNDER", raid_points: 20, tackle_points: 25, matches_played: 12, super_raids: 0, super_tackles: 0, super_tens: 0, high_fives: 0, kyc_status: "PENDING", status: "ENABLED", city: "Haryana", email: "ran@kabaddi.in" },
];

async function main() {
  console.log("🚀 KabaddiHub Database Migration Starting...\n");

  // Step 1: Check if tables exist
  console.log("📋 Checking if tables exist...");
  const tenantsExist = await checkTable("tenants");
  const athletesExist = await checkTable("athletes");

  if (!tenantsExist || !athletesExist) {
    console.log("⚠️  Tables not found. Please run the SQL schema first:");
    console.log("   → Open: supabase/migrations/001_initial_schema.sql");
    console.log("   → Paste into: https://supabase.com/dashboard/project/ayuwvopuwqaqzenzwmee/sql/new");
    console.log("   → Click Run\n");
    console.log("Then re-run this script.\n");
    process.exit(1);
  }

  console.log("✅ Tables found!\n");

  // Step 2: Seed Tenants
  console.log("🏢 Seeding 10 franchise tenants...");
  for (const tenant of TENANTS) {
    await insertRow("tenants", tenant);
    process.stdout.write(".");
  }
  console.log(" ✅\n");

  // Step 3: Seed Athletes
  console.log("👥 Seeding 50 global athletes...");
  for (const athlete of ATHLETES) {
    await insertRow("athletes", athlete);
    process.stdout.write(".");
  }
  console.log(" ✅\n");

  // Step 4: Verify counts
  const tRes = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=count`, {
    headers: { "Authorization": `Bearer ${SERVICE_ROLE_KEY}`, "apikey": SERVICE_ROLE_KEY, "Prefer": "count=exact" },
  });
  const aRes = await fetch(`${SUPABASE_URL}/rest/v1/athletes?select=count`, {
    headers: { "Authorization": `Bearer ${SERVICE_ROLE_KEY}`, "apikey": SERVICE_ROLE_KEY, "Prefer": "count=exact" },
  });

  const tCount = tRes.headers.get("content-range") || "unknown";
  const aCount = aRes.headers.get("content-range") || "unknown";

  console.log("📊 Final counts:");
  console.log(`   Tenants: ${tCount}`);
  console.log(`   Athletes: ${aCount}`);
  console.log("\n🎉 Migration complete! Your database is now populated.\n");
}

main().catch(console.error);
