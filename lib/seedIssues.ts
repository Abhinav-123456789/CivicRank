export interface SeedIssue {
  title: string;
  description: string;
  category: string;
  location: string;
  coords: { lat: number; lng: number };
  priorityLevel: "low" | "medium" | "high" | "emergency";
  upvotes: number;
  status: "open" | "in-progress" | "resolved";
}

// Realistic civic issues in Jalandhar with proper coordinates
export const seedIssuesData: SeedIssue[] = [
  {
    title: "Pothole near Model Town Road causing traffic",
    description: "A large pothole on Model Town Road is creating severe traffic congestion. Vehicles are swerving to avoid it, causing accidents. The hole is approximately 2 meters long and 1 meter wide.",
    category: "Infrastructure & Roads",
    location: "Model Town Road, Jalandhar",
    coords: { lat: 31.9012, lng: 75.5534 },
    priorityLevel: "high",
    upvotes: 4,
    status: "open",
  },
  {
    title: "Garbage pile near bus stand not collected",
    description: "A massive pile of garbage has accumulated near the main bus stand for over a week. It's causing foul smell and attracting stray dogs. Immediate attention required.",
    category: "Waste Management",
    location: "Main Bus Stand, Jalandhar",
    coords: { lat: 31.8945, lng: 75.5612 },
    priorityLevel: "high",
    upvotes: 6,
    status: "open",
  },
  {
    title: "Water leakage near hospital gate",
    description: "Continuous water leakage from a main pipe near the government hospital gate. Water is flowing into the street and creating a waterlogged area. This is wasting precious water resources.",
    category: "Water & Sanitation",
    location: "Hospital Gate, Jalandhar",
    coords: { lat: 31.8998, lng: 75.5545 },
    priorityLevel: "high",
    upvotes: 5,
    status: "open",
  },
  {
    title: "Streetlight not working near school road",
    description: "Street lighting on school road has been non-functional for 2 months. Students and residents face safety risks during evening hours. Urgent repair needed.",
    category: "Electricity & Utilities",
    location: "School Road, Jalandhar",
    coords: { lat: 31.8967, lng: 75.5489 },
    priorityLevel: "medium",
    upvotes: 3,
    status: "open",
  },
  {
    title: "Sewage overflow in residential area",
    description: "Severe sewage backup in Gandhi Nagar residential area. Sewage is overflowing into streets and nearby premises. This is a major health hazard for residents.",
    category: "Water & Sanitation",
    location: "Gandhi Nagar, Jalandhar",
    coords: { lat: 31.9034, lng: 75.5598 },
    priorityLevel: "emergency",
    upvotes: 7,
    status: "open",
  },
  {
    title: "Loose electric wire near market area",
    description: "A loose, hanging electric wire poses immediate danger to pedestrians and vehicles in the market area. It's dangerously low and could cause electrocution.",
    category: "Electricity & Utilities",
    location: "Central Market, Jalandhar",
    coords: { lat: 31.8956, lng: 75.5521 },
    priorityLevel: "emergency",
    upvotes: 8,
    status: "open",
  },
  {
    title: "Stray dogs causing disturbance near park",
    description: "An aggressive pack of stray dogs near Gandhi Park is attacking local residents and children. Multiple incidents reported. Authorities need to take immediate action.",
    category: "Community Issues",
    location: "Gandhi Park, Jalandhar",
    coords: { lat: 31.8923, lng: 75.5467 },
    priorityLevel: "high",
    upvotes: 5,
    status: "open",
  },
  {
    title: "Broken footpath causing injuries",
    description: "The footpath near Kiran Cinema is severely broken with protruding concrete chunks. Multiple complaints of people tripping and sustaining injuries.",
    category: "Infrastructure & Roads",
    location: "Kiran Cinema Road, Jalandhar",
    coords: { lat: 31.8902, lng: 75.5478 },
    priorityLevel: "medium",
    upvotes: 4,
    status: "open",
  },
  {
    title: "Traffic signal malfunction at main intersection",
    description: "The traffic signal at the main intersection near City Center is stuck on red. This is causing severe traffic congestion and accidents during peak hours.",
    category: "Infrastructure & Roads",
    location: "City Center Intersection, Jalandhar",
    coords: { lat: 31.8967, lng: 75.5612 },
    priorityLevel: "high",
    upvotes: 5,
    status: "open",
  },
  {
    title: "Blocked drain causing waterlogging",
    description: "The main drain on Lyall Ganj road is completely blocked with debris and garbage, causing severe waterlogging during monsoon. Residents' homes are at risk.",
    category: "Water & Sanitation",
    location: "Lyall Ganj, Jalandhar",
    coords: { lat: 31.8876, lng: 75.5534 },
    priorityLevel: "high",
    upvotes: 4,
    status: "open",
  },
  {
    title: "Public toilet in poor condition",
    description: "The public toilet near railway station is in deplorable condition - broken tiles, blocked seats, and insufficient water supply. Urgent maintenance required.",
    category: "Community Issues",
    location: "Railway Station Area, Jalandhar",
    coords: { lat: 31.8845, lng: 75.5645 },
    priorityLevel: "medium",
    upvotes: 2,
    status: "open",
  },
  {
    title: "Illegal construction blocking road access",
    description: "Illegal construction on a vacant plot has reduced the road width by half, causing traffic bottleneck. Municipal authorities should take action immediately.",
    category: "Infrastructure & Roads",
    location: "Sutlej Nagar, Jalandhar",
    coords: { lat: 31.9087, lng: 75.5589 },
    priorityLevel: "medium",
    upvotes: 3,
    status: "open",
  },
  {
    title: "Power failure in entire neighborhood",
    description: "Entire Rama Nagar locality has been without power for 3 days. Electrical transformer has failed. Despite multiple complaints, authorities haven't responded.",
    category: "Electricity & Utilities",
    location: "Rama Nagar, Jalandhar",
    coords: { lat: 31.8934, lng: 75.5423 },
    priorityLevel: "high",
    upvotes: 6,
    status: "open",
  },
  {
    title: "Contaminated drinking water supply",
    description: "Drinking water from the municipality tap tastes and smells contaminated. Water quality testing needs to be done. Multiple residents have reported stomach issues.",
    category: "Water & Sanitation",
    location: "Prem Nagar, Jalandhar",
    coords: { lat: 31.8812, lng: 75.5501 },
    priorityLevel: "emergency",
    upvotes: 7,
    status: "open",
  },
  {
    title: "Street vendors obstructing footpaths",
    description: "Street vendors have occupied entire footpaths, forcing pedestrians to walk on roads. This creates safety hazards and traffic congestion.",
    category: "Community Issues",
    location: "Chandni Chowk, Jalandhar",
    coords: { lat: 31.8967, lng: 75.5467 },
    priorityLevel: "low",
    upvotes: 2,
    status: "open",
  },
  {
    title: "Damaged bridge barrier causing accidents",
    description: "The safety barrier on the old bridge near Thapar has been damaged and partially removed. Several near-miss accidents reported. Urgent repair needed.",
    category: "Infrastructure & Roads",
    location: "Old Bridge, Jalandhar",
    coords: { lat: 31.9127, lng: 75.5512 },
    priorityLevel: "emergency",
    upvotes: 8,
    status: "open",
  },
];

// Seed function to populate Firestore
export const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");
    
    // First, check if issues already exist to avoid duplicates
    const checkResponse = await fetch("/api/issues");
    const existingIssues = await checkResponse.json();
    
    if (existingIssues.length > 0) {
      console.log(`Database already contains ${existingIssues.length} issues. Skipping seed to prevent duplicates.`);
      return { success: false, reason: "Database already seeded" };
    }
    
    // Add each seed issue to the database
    let addedCount = 0;
    for (const issue of seedIssuesData) {
      try {
        const response = await fetch("/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(issue),
        });
        
        if (response.ok) {
          addedCount++;
          console.log(`✓ Added: ${issue.title}`);
        } else {
          console.error(`✗ Failed to add: ${issue.title}`);
        }
      } catch (error) {
        console.error(`Error adding issue "${issue.title}":`, error);
      }
    }
    
    console.log(`Seeding complete! Added ${addedCount}/${seedIssuesData.length} issues.`);
    return { success: true, addedCount };
  } catch (error) {
    console.error("Database seeding failed:", error);
    return { success: false, error };
  }
};
