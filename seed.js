// Populates the database with the current team roster.
// Run with: npm run seed
//
// Note: this seed does NOT set an "image" filename, because the actual image
// files live in your frontend project, not this backend. After seeding,
// either:
//   1) upload each member's photo via PUT /api/team/:id (multipart "image"), or
//   2) copy the images into /uploads and set "image" to the filename directly
//      in the database.

require("dotenv").config();
const connectDB = require("./config/db");
const TeamMember = require("./models/TeamMember");

const teamMembers = [
  {
    code: "AR·01",
    name: "Mohd Aslam",
    role: "Principal Architect",
    description:
      "With over a decade of experience in architecture, design, and urban planning, Mohd Aslam is the Principal Architect at M.A. Architects & Associates — a multidisciplinary practice committed to creating thoughtful, functional, and timeless spaces. A postgraduate in Architecture (Urban Regeneration), his approach blends contemporary aesthetics, contextual planning, technical precision, and practical functionality across residential, commercial, institutional, hospitality, and healthcare projects. His philosophy: good design should never be limited by budget or scale — every project deserves thoughtful planning, refined detailing, and solutions that reflect the aspirations of its users.",
    skills: [
      "Architecture",
      "Urban Regeneration",
      "Urban Planning",
      "Contextual Design",
      "Residential & Commercial",
      "Institutional Design",
      "Hospitality & Healthcare",
      "Project Leadership",
    ],
    order: 1,
  },
  {
    code: "SE·02",
    name: "Abu Zain",
    role: "Structural Engineer",
    description:
      "Qualified Structural Engineer with 6+ years in structural design, analysis, detailing, and engineering consultancy. Graduate of AKTU, associated with M.A. Architects & Associates for 5+ years across residential, commercial, and institutional projects — ensuring structural safety, stability, and close coordination between architectural and structural requirements.",
    skills: [
      "Structural Design",
      "Structural Analysis",
      "Detailing",
      "Engineering Consultancy",
      "Construction Practices",
    ],
    order: 2,
  },
  {
    code: "ID·03",
    name: "Isha Verma",
    role: "Interior Designer",
    description:
      "Interior designer turning spatial concepts into functional, compelling environments. Works across residential and commercial projects, balancing modern elegance with everyday practicality.",
    skills: [
      "Interior Design",
      "Technical Drafting",
      "3D Visualization",
      "Site Coordination",
    ],
    order: 3,
  },
  {
    code: "AR·04",
    name: "Mohd Nawazish Ali",
    role: "Architectural Designer",
    description:
      "B.Arch graduate, MET Faculty of Architecture, class of 2025. Experience in architectural design, drafting, and 3D visualization, blending design thinking with strong technical skills.",
    skills: [
      "Architectural Design",
      "Drafting",
      "3D Visualization",
      "Site Coordination",
      "AutoCAD",
      "Revit",
      "SketchUp",
      "Lumion",
      "V-Ray",
      "Photoshop",
    ],
    order: 4,
  },
];

const run = async () => {
  await connectDB();
  await TeamMember.deleteMany({});
  await TeamMember.insertMany(teamMembers);
  console.log(`Seeded ${teamMembers.length} team members.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});