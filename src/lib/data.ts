export interface Article {
  id: string;
  title: string;
  subheadline?: string;
  summary: string;
  content: string;
  category: string;
  categorySlug: string;
  imageUrl: string;
  thumbnailUrl: string;
  coverImage: string;
  imageCaption?: string;
  imageCredit?: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  updatedAt?: string;
  isPublished: boolean;
  featured: boolean;
  trending: boolean;
  editorPick: boolean;
  dropCap?: boolean;
  readTime: string;
  isNew?: boolean;
  tags?: string;
  seoDescription?: string;
}

export function getArticleImage(article: Article): string {
  return article.imageUrl || article.thumbnailUrl || article.coverImage || "";
}

export interface ArticleForm {
  title: string;
  subheadline: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  author_role: string;
  image_url: string;
  image_caption: string;
  image_credit: string;
  tags: string;
  seo_description: string;
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  drop_cap: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
  approved: boolean;
  avatar: string;
}

export interface Category {
  name: string;
  slug: string;
  count: number;
}

export const categories: Category[] = [
  { name: "Campus News", slug: "campus-news", count: 3 },
  { name: "Announcements", slug: "announcements", count: 2 },
  { name: "Events", slug: "events", count: 2 },
  { name: "Publicity", slug: "publicity", count: 2 },
  { name: "Meme", slug: "meme", count: 2 },
];

export const articles: Article[] = [
  {
    id: "1",
    title: "WCCBM Becomes Autonomous — Let's Celebrate!",
    summary: "Our college begins a new era of academic excellence and independence. This landmark achievement marks a transformative milestone in the institution's journey toward educational sovereignty.",
    content: `<p>In a momentous announcement that has sent waves of jubilation across the campus, WCCBM has officially been granted autonomous status. This landmark achievement marks the beginning of a transformative new chapter in the institution's storied history.</p>
<p>The autonomous status empowers WCCBM to design its own curriculum, introduce innovative academic programs, and set examination patterns that align with industry standards. Students and faculty alike have welcomed this development with immense pride and enthusiasm.</p>
<p>"This is not just a recognition — it is a responsibility," said the college administration in a statement. "Autonomy will allow us to innovate, experiment, and deliver an education that is truly world-class."</p>
<p>Celebrations erupted across the campus as students gathered to mark the occasion. Cultural performances, a rally, and a special assembly were organized to commemorate the milestone. The atmosphere was electric with optimism and a shared sense of achievement.</p>
<p>For students, autonomy means greater exposure to industry-relevant skills, updated syllabi, and a curriculum that responds faster to changing professional landscapes. Faculty members will also benefit from greater academic freedom to pursue research and pedagogical innovation.</p>
<p>As WCCBM steps into this new era, the entire community stands united in its commitment to excellence, innovation, and the pursuit of knowledge. This is our moment — let us celebrate it together.</p>`,
    category: "Announcements",
    categorySlug: "announcements",
    imageUrl: "/images/wccbm-logo.png",
    thumbnailUrl: "",
    coverImage: "",
    author: "WCCBM Times Desk",
    authorRole: "Editorial Board",
    publishedAt: "2026-05-27",
    isPublished: true,
    featured: true,
    trending: true,
    editorPick: true,
    readTime: "3 min read",
  },
  {
    id: "2",
    title: "SYDS Department Hosts Successful Data Science Workshop",
    summary: "The Second Year Data Science department organized an intensive hands-on workshop on machine learning fundamentals, drawing enthusiastic participation from across the college.",
    content: `<p>The SYDS (Second Year Data Science) department at WCCBM successfully conducted a two-day workshop on Machine Learning Fundamentals, attracting over 80 students from various departments.</p>
<p>The workshop covered essential topics including supervised and unsupervised learning, data preprocessing techniques, model evaluation, and hands-on sessions with Python libraries such as scikit-learn and pandas. Students worked on real-world datasets to build predictive models.</p>
<p>"The response was overwhelming," said a faculty coordinator. "Students showed remarkable enthusiasm and produced impressive projects by the end of the workshop."</p>
<p>The event concluded with a mini-hackathon where teams competed to build the best-performing model on a given dataset. Prizes were awarded to the top three teams, and all participants received certificates of completion.</p>`,
    category: "Campus News",
    categorySlug: "campus-news",
    imageUrl: "/images/wccbm-logo.png",
    thumbnailUrl: "",
    coverImage: "",
    author: "Shriraj Sonawane",
    authorRole: "Student Correspondent",
    publishedAt: "2026-05-25",
    isPublished: true,
    featured: false,
    trending: true,
    editorPick: true,
    readTime: "2 min read",
  },
  {
    id: "3",
    title: "WCCBM Student Secures Top Rank in University Examination",
    summary: "A student from the Computer Science department has brought laurels to the college by securing the first rank in the university semester examinations.",
    content: `<p>In a proud moment for WCCBM, a student from the Computer Science department has secured the top rank in the university's semester examinations, outperforming thousands of students across affiliated colleges.</p>
<p>The achievement reflects the high standards of academic rigor and the supportive learning environment that WCCBM fosters. Faculty members celebrated the accomplishment, highlighting the student's dedication and hard work.</p>
<p>"This is a testament to the quality of education at WCCBM and the relentless effort our students put in," said a senior faculty member. "We are incredibly proud of this achievement."</p>
<p>The student was felicitated at a special ceremony attended by college dignitaries, faculty, and fellow students.</p>`,
      category: "Publicity",
      categorySlug: "publicity",
      imageUrl: "/images/wccbm-logo.png",
      thumbnailUrl: "",
      coverImage: "",
      author: "WCCBM Times Desk",
      authorRole: "Editorial Board",
    publishedAt: "2026-05-22",
    isPublished: true,
    featured: false,
    trending: false,
    editorPick: true,
    readTime: "2 min read",
  },
  {
    id: "4",
    title: "Annual Cultural Fest 'Utsav 2026' to Be Held Next Month",
    summary: "WCCBM's flagship cultural festival returns with an exciting lineup of events, competitions, and performances. Registrations are now open.",
    content: `<p>The much-anticipated annual cultural festival of WCCBM, 'Utsav 2026', is set to take place next month. The two-day extravaganza will feature a diverse array of competitions including dance, music, drama, fine arts, literary events, and more.</p>
<p>Students from all departments are encouraged to participate and showcase their talents. The festival will also host inter-college competitions, inviting participants from institutions across the region.</p>
<p>"Utsav has always been a platform for creativity and cultural expression," said the student coordinator. "This year, we have an even bigger and better lineup planned."</p>
<p>Registrations are now open, and students can sign up through the cultural committee. The event promises to be a celebration of talent, diversity, and the vibrant spirit of WCCBM.</p>`,
    category: "Events",
    categorySlug: "events",
    imageUrl: "/images/wccbm-logo.png",
    thumbnailUrl: "",
    coverImage: "",
    author: "WCCBM Times Desk",
    authorRole: "Events Coverage",
    publishedAt: "2026-05-20",
    isPublished: true,
    featured: false,
    trending: false,
    editorPick: false,
    readTime: "2 min read",
  },
  {
    id: "5",
    title: "Smart India Hackathon: WCCBM Teams Advance to Regional Finals",
    summary: "Multiple teams from WCCBM have been selected for the regional round of Smart India Hackathon 2026, showcasing innovative solutions to real-world problems.",
    content: `<p>WCCBM continues to demonstrate its prowess in innovation as multiple student teams have advanced to the regional finals of Smart India Hackathon 2026. The teams presented creative solutions addressing challenges in healthcare, education, and sustainable development.</p>
<p>The hackathon, one of the country's largest, saw participation from thousands of colleges nationwide. WCCBM teams impressed the judges with their technical execution and problem-solving approach.</p>
<p>"We are thrilled to represent WCCBM at the regional level," said a team leader. "The support from our faculty mentors was instrumental in refining our project."</p>
<p>The regional finals will be held next month, and the college community is rallying behind its teams. This achievement underscores WCCBM's commitment to fostering innovation and entrepreneurship among students.</p>`,
      category: "Publicity",
      categorySlug: "publicity",
      imageUrl: "/images/wccbm-logo.png",
      thumbnailUrl: "",
      coverImage: "",
      author: "Shriraj Sonawane",
    authorRole: "Student Correspondent",
    publishedAt: "2026-05-18",
    isPublished: true,
    featured: false,
    trending: false,
    editorPick: false,
    readTime: "2 min read",
  },
  {
    id: "6",
    title: "POV: You Realize Tomorrow Is the Deadline for That Assignment You Haven't Started",
    summary: "A highly relatable moment captured in the halls of WCCBM as students face the universal struggle of academic procrastination.",
    content: `<p>It's 11:59 PM. You've got 600 words to write. Your brain? Empty. Your WhatsApp? 47 messages in the class group, all asking the same question: "Kya karna hai?"</p>
<p>This is the WCCBM student experience — a delicate balance between "I'll do it later" and "later is now." The struggle is real, the memes are relatable, and somehow, we all make it through. Barely.</p>
<p>If this isn't you, you're either lying or you're that one student who actually finishes assignments a week early. We don't trust you.</p>`,
    category: "Meme",
    categorySlug: "meme",
    imageUrl: "/images/wccbm-logo.png",
    thumbnailUrl: "",
    coverImage: "",
    author: "WCCBM Meme Bureau",
    authorRole: "Chief Meme Officer",
    publishedAt: "2026-05-27",
    isPublished: true,
    featured: false,
    trending: true,
    editorPick: false,
    readTime: "1 min read",
  },
  {
    id: "7",
    title: "The Canteen Samosa vs. The Exam Stress — Who Wins?",
    summary: "An investigative deep dive into the only thing keeping WCCBM students sane during exam season.",
    content: `<p>Let's be honest — the real MVP of exam season at WCCBM isn't the library. It's the canteen samosa. Spicy, crispy, and exactly ₹10. It has seen more late-night study sessions than most students.</p>
<p>The canteen staff knows your order by heart. "Same wala?" they ask, and you nod, because yes — same wala. The samosa doesn't judge your last-minute preparation. It just exists. Perfectly. For you.</p>
<p>This is a tribute to the unsung hero of WCCBM. The samosa. May your oil be hot and your chutney green everywhere.</p>`,
    category: "Meme",
    categorySlug: "meme",
    imageUrl: "/images/wccbm-logo.png",
    thumbnailUrl: "",
    coverImage: "",
    author: "Shriraj Sonawane",
    authorRole: "Student Correspondent",
    publishedAt: "2026-05-26",
    isPublished: true,
    featured: false,
    trending: true,
    editorPick: false,
    readTime: "1 min read",
  },
];

export const comments: Comment[] = [];
