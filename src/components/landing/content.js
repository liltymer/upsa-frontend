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
    "Add a whole semester in seconds and GradeIQ tracks your GPA and CGPA on the official UPSA scale. See which semesters and courses are lifting or pulling down your grade, how close you are to the next class, and plan the grades you need all the way to graduation.",
  primaryCta: "Create an account",
  secondaryCta: "Sign in",
  proof: "Checked against a UPSA transcript: semester GPAs and CGPA match to two decimal places.",
};

export const FACTS = [
  { value: "384", label: "UPSA courses ready to pick, from the official timetables" },
  { value: "2 scales", label: "Degree and diploma classes, applied to the right programme" },
  { value: "2 d.p.", label: "GPA cut off the way UPSA transcripts print it" },
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
    title: "Add a semester in seconds",
    body: "Pick the semester on your result slip and its usual courses fill in from UPSA's own timetables. Tap one grade per course and see your new GPA before you save.",
  },
  {
    icon: "chart",
    title: "Your GPA, explained",
    body: "Follow your GPA and CGPA over time, see how much each semester raised or lowered your CGPA, and check the working behind every figure.",
  },
  {
    icon: "target",
    title: "Plan your way to graduation",
    body: "Expected grades start from your own history. Map every remaining semester, compare best, likely and worst cases, and see which courses move your CGPA most.",
  },
  {
    icon: "shield",
    title: "Your standing, by UPSA's rules",
    body: "Probation, failed courses you are trailing, repeat limits and the credits you need to graduate, checked against the UPSA students' handbook.",
  },
  {
    icon: "ladder",
    title: "Early warnings",
    body: "Know your current class and how far you are from the next one, and get told in time if a plan would slip you into a lower class.",
  },
  {
    icon: "document",
    title: "Transcript and next steps",
    body: "Download an unofficial transcript laid out like UPSA's, including your full diploma and degree history, with the steps for requesting the official one.",
  },
];

export const TOP_UP = {
  eyebrow: "For top-up students",
  title: "Moving from a diploma to a degree?",
  body:
    "UPSA gives top-up students a new index number and a fresh CGPA. GradeIQ keeps each programme separately on the same account, so your diploma record is never lost or mixed with your degree.",
  points: [
    "Your diploma is kept as a completed programme with its final CGPA and class.",
    "Your degree starts at Level 300 or Level 200, as set by your diploma FCGPA, with its own CGPA.",
    "Sign in with your email, your diploma index number or your degree index number.",
    "Created a second account for your top-up? Link it and your records move into one.",
    "Download one transcript that covers both your diploma and your degree.",
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
      meta: "Current · Level 300 (FCGPA 2.50 or more)",
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
    title: "Add your semesters",
    body: "Pick a semester and its usual courses are filled in for your programme. Tap the grade on your result slip for each course and save. No marks needed.",
  },
  {
    title: "Plan and act",
    body: "Your GPA, CGPA, class and standing update straight away. Use the planner to see what each coming semester needs, and act before results come out.",
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
    a: "Only you. Administrators can see account details such as your name, email and index number, and platform totals that do not identify anyone, but never your grades or your CGPA.",
  },
  {
    q: "Where do the pre-filled courses come from?",
    a: "From UPSA's published teaching and examination timetables, and from courses other students on the same programme have entered (codes and titles only, never grades). Remove any you did not take, and type any course that is missing.",
  },
  {
    q: "How do I get my official transcript?",
    a: "Only UPSA's Academic Affairs Directorate issues official transcripts. The Transcript page in GradeIQ lists the current steps and links to UPSA's procedures page.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. From your Profile you can download every result as a spreadsheet file, or permanently delete your account and all your results.",
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
  body: "Adding a semester takes about a minute. The earlier you know where you stand, the more time you have to improve it.",
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
