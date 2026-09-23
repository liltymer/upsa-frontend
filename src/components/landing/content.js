// All landing page copy lives here so wording can be reviewed and edited in one place.
// Rule for this file: every statement must describe something the product actually does.
// No em dashes, no emojis.

export const CONTACT = {
  email: "ahenkorajoshuaowusu@outlook.com",
  phoneDisplay: "+233 537 041 324",
  phoneHref: "tel:+233537041324",
  whatsappHref: "https://wa.me/233537041324",
};

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#top-up", label: "Top-up students" },
  { href: "#grading", label: "Grading" },
  { href: "#faq", label: "FAQ" },
];

export const HERO = {
  eyebrow: "For students of the University of Professional Studies, Accra",
  titleLead: "Your UPSA results,",
  titleEmphasis: "calculated the way UPSA calculates them.",
  body:
    "Enter the grades from your result slip. GradeIQ works out your semester GPA and CGPA on the official UPSA scale, shows your class, and keeps your diploma and degree records separate.",
  primaryCta: "Create an account",
  secondaryCta: "Sign in",
  proof: "Checked against a UPSA transcript: semester GPAs and CGPA match to two decimal places.",
};

export const FACTS = [
  { value: "A to F", label: "Official UPSA grade points, 4.0 to 0.0" },
  { value: "2 scales", label: "Degree and diploma classifications" },
  { value: "2 d.p.", label: "GPA shown the way UPSA transcripts print it" },
  { value: "Free", label: "No payment for UPSA students" },
];

export const FEATURES = [
  {
    icon: "results",
    title: "Results by semester",
    body: "Enter each course with its code, credit hours and grade, grouped by academic year and semester like your result slip.",
  },
  {
    icon: "chart",
    title: "GPA and CGPA tracking",
    body: "Semester GPA and cumulative CGPA calculated on the UPSA scale, with a semester by semester chart of your progress.",
  },
  {
    icon: "ladder",
    title: "Class and standing",
    body: "See your current class under the degree or diploma bands, how far you are from the next one, and early warnings.",
  },
  {
    icon: "target",
    title: "Simulator and target grade",
    body: "Try expected grades for coming courses, or find the average grade you need to reach a target CGPA.",
  },
  {
    icon: "document",
    title: "Transcript PDF",
    body: "Download an unofficial transcript laid out like the UPSA one, with TCR, TGP, GPA and CGPA for every semester.",
  },
  {
    icon: "layers",
    title: "Programme history",
    body: "Keep a completed diploma and a current degree on one account, each with its own index number and CGPA.",
  },
];

export const TOP_UP = {
  eyebrow: "Diploma to degree",
  title: "Topped up to a degree? Your diploma stays with you.",
  body:
    "UPSA gives top-up students a new index number and a fresh CGPA. GradeIQ records each programme separately on the same account, so nothing is lost and nothing is mixed.",
  points: [
    "Your diploma is kept as a completed programme with its final CGPA and class.",
    "Your degree starts at Level 300 with its own CGPA from the first semester.",
    "Sign in with your email, your diploma index number or your degree index number.",
    "Created a second account for your top-up? Link it and your records move into one.",
  ],
  example: {
    label: "Example",
    diploma: {
      title: "Diploma in Information Technology Management",
      meta: "Completed · 2024/2025 to 2025/2026",
      cgpa: "3.12",
      classLabel: "Credit",
    },
    degree: {
      title: "BSc Information Technology",
      meta: "Current · starts at Level 300",
      cgpa: "Fresh CGPA",
      classLabel: "New index number",
    },
  },
};

export const STEPS = [
  {
    title: "Create your account",
    body: "Register with your index number, programme and level. Top-up students can record their diploma at the same time.",
  },
  {
    title: "Enter your results",
    body: "Add each course exactly as it appears on your result slip: code, title, credit hours and grade. No marks needed.",
  },
  {
    title: "Follow your progress",
    body: "Your GPA, CGPA, class and transcript update as soon as you save a result.",
  },
];

export const GRADING = {
  eyebrow: "Official UPSA grading",
  title: "The same scale your results are graded on",
  body:
    "Grade points are the same for every programme. Diploma and degree students are classified on different bands, and GradeIQ applies the right one to each programme.",
  method:
    "Each course contributes its grade point multiplied by its credit hours. Your GPA is the total divided by the credits taken, shown to two decimal places without rounding up.",
};

export const FAQS = [
  {
    q: "Is GradeIQ an official UPSA system?",
    a: "No. GradeIQ is an independent project built by a UPSA student. Your official results are the ones on the UPSA student portal, so always confirm important decisions there.",
  },
  {
    q: "How is my GPA calculated?",
    a: "Each course's grade point is multiplied by its credit hours. The total is divided by your credits and shown to two decimal places without rounding up, the way UPSA transcripts print it.",
  },
  {
    q: "Do I need my marks or scores?",
    a: "No. You only need the grade letters shown on your result slip, for example B+ or C.",
  },
  {
    q: "I moved from a diploma to a degree. What happens to my old results?",
    a: "They stay on your account as a completed programme with their own CGPA. Your degree starts a fresh CGPA. Open Profile and choose \"I've started my top-up\" to add your new index number.",
  },
  {
    q: "Who can see my results?",
    a: "Only you. Administrators can see account details such as your name, email and index number, and anonymous totals for the platform, but not your grades or your CGPA.",
  },
  {
    q: "What if my course is not in the catalogue?",
    a: "Enter it manually. The course catalogue only saves typing; it is not required.",
  },
  {
    q: "I forgot my password. What should I do?",
    a: "Use \"Forgot password\" on the sign-in page. A reset link is sent to your email and expires after one hour. If it does not arrive, contact support below.",
  },
  {
    q: "Does it cost anything?",
    a: "No. GradeIQ is free for UPSA students.",
  },
];

export const SUPPORT = {
  eyebrow: "Support",
  title: "Need help with your account or results?",
  body: "Send a message and include your index number so the issue can be found quickly.",
};

export const CLOSING = {
  title: "Know where you stand this semester.",
  body: "Set up your account, enter your results, and see your GPA, CGPA and class on the UPSA scale.",
  cta: "Create an account",
};

export const FOOTER = {
  tagline: "GPA, CGPA and class tracking for students of the University of Professional Studies, Accra.",
  disclaimer:
    "GradeIQ UPSA is an independent student project and is not operated or endorsed by the University of Professional Studies, Accra. Your official results are on the UPSA student portal.",
  credit: "Built by Ahenkora Joshua Owusu",
};
