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
  { href: "#how-it-works", label: "How it works" },
  { href: "#grading", label: "Grading" },
  { href: "#faq", label: "FAQ" },
];

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/ahenkora-joshua-owusu-42a691320",
  github: "https://github.com/liltymer",
};

export const HERO = {
  eyebrow: "For students of the University of Professional Studies, Accra",
  titleLead: "Know where you stand academically,",
  titleEmphasis: "while there is still time to act.",
  body:
    "Record your results each semester and GradeIQ tracks your GPA and CGPA on the official UPSA scale. See which semesters and courses are lifting or pulling down your grade, how close you are to the next class, and what you need in the semesters ahead to reach your goal.",
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

export const FEATURES_INTRO = {
  eyebrow: "What you can do",
  title: "Turn your results into better decisions",
  body:
    "GradeIQ gives you a clear picture of your performance, so you can decide early where to put in more effort instead of finding out when it is too late.",
};

export const FEATURES = [
  {
    icon: "results",
    title: "A complete semester record",
    body: "Every course, credit hour and grade in one place, grouped by academic year and semester, with the GPA for each semester.",
  },
  {
    icon: "chart",
    title: "Trends over time",
    body: "See whether your GPA is improving or declining from one semester to the next, and which semesters pulled your CGPA down.",
  },
  {
    icon: "ladder",
    title: "Early warnings",
    body: "Know your current class and how far you are from the next one. Your dashboard warns you when your CGPA is in a lower band or close to probation.",
  },
  {
    icon: "target",
    title: "Target grade planner",
    body: "Set a target CGPA and see the average grade you need in your remaining credits, and whether the target is still achievable.",
  },
  {
    icon: "layers",
    title: "What-if simulator",
    body: "Try the grades you expect in coming courses and see the effect on your CGPA before the results are out.",
  },
  {
    icon: "document",
    title: "Transcript PDF",
    body: "Download an unofficial transcript laid out like the UPSA one, with TCR, TGP, GPA and CGPA for every semester.",
  },
];

export const TOP_UP = {
  eyebrow: "For top-up students",
  title: "Moving from a diploma to a degree?",
  body:
    "UPSA gives top-up students a new index number and a fresh CGPA. GradeIQ keeps each programme separately on the same account, so your diploma record is never lost or mixed with your degree.",
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
    title: "Act on what you see",
    body: "Your GPA, CGPA and class update as soon as you save a result. Use your trends, warnings and target grade to plan the semester ahead.",
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
  title: "Start tracking before your next results come out.",
  body: "Adding your results takes a few minutes. The earlier you know where you stand, the more time you have to improve it.",
  cta: "Create an account",
};

export const FOOTER = {
  tagline:
    "Helping students of the University of Professional Studies, Accra understand their academic performance and act on it early.",
  columns: [
    {
      title: "Product",
      links: [
        { href: "#features", label: "Features" },
        { href: "#how-it-works", label: "How it works" },
        { href: "#grading", label: "Grading scale" },
        { href: "#top-up", label: "Top-up students" },
      ],
    },
    {
      title: "Account",
      links: [
        { to: "/register", label: "Create an account" },
        { to: "/login", label: "Sign in" },
        { to: "/forgot-password", label: "Reset your password" },
      ],
    },
    {
      title: "Help",
      links: [
        { href: "#faq", label: "Frequently asked questions" },
        { href: "#support", label: "Contact support" },
      ],
    },
  ],
  disclaimerTitle: "Independent project",
  disclaimer:
    "GradeIQ UPSA is an independent student project and is not operated or endorsed by the University of Professional Studies, Accra. Figures shown here are calculated from the results you enter. Your official results are on the UPSA student portal.",
  copyright: "GradeIQ UPSA. All rights reserved.",
  credit: "Designed and built by Ahenkora Joshua Owusu",
};
