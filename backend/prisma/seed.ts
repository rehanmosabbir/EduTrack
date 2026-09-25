import { PrismaClient, Role, GoalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";
import { calculatePercentage, determineGrade } from "../src/utils/grading.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding EduTrack database...");

  await prisma.activity.deleteMany();
  await prisma.studentNote.deleteMany();
  await prisma.note.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.score.deleteMany();
  await prisma.studyLog.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const studentPassword = await bcrypt.hash("Student@123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Teacher Admin",
      email: "admin@edutrack.local",
      role: Role.ADMIN,
      password: adminPassword,
      image: null,
    },
  });

  const studentsData = [
    {
      name: "Rahim Ahmed",
      email: "rahim@edutrack.local",
      studentId: "STU-001",
      className: "HSC",
      institution: "XYZ College",
      phone: "01711000001",
      guardianName: "Karim Ahmed",
      guardianPhone: "01711000011",
    },
    {
      name: "Karim Hasan",
      email: "karim@edutrack.local",
      studentId: "STU-002",
      className: "HSC",
      institution: "XYZ College",
      phone: "01711000002",
      guardianName: "Hasan Ali",
      guardianPhone: "01711000012",
    },
    {
      name: "Sadia Islam",
      email: "sadia@edutrack.local",
      studentId: "STU-003",
      className: "HSC",
      institution: "ABC College",
      phone: "01711000003",
      guardianName: "Islam Uddin",
      guardianPhone: "01711000013",
    },
  ];

  const students = [];
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        role: Role.STUDENT,
        password: studentPassword,
        studentProfile: {
          create: {
            studentId: s.studentId,
            className: s.className,
            institution: s.institution,
            phone: s.phone,
            guardianName: s.guardianName,
            guardianPhone: s.guardianPhone,
            isActive: true,
          },
        },
      },
      include: { studentProfile: true },
    });
    students.push(user);
  }

  const subjects = await Promise.all(
    [
      { name: "Mathematics", code: "MATH", description: "Algebra, Calculus, Geometry" },
      { name: "Physics", code: "PHY", description: "Mechanics, Waves, Electricity" },
      { name: "Chemistry", code: "CHEM", description: "Organic and Inorganic Chemistry" },
      { name: "English", code: "ENG", description: "Grammar and Literature" },
      { name: "Bangla", code: "BAN", description: "Bangla language and literature" },
    ].map((s) => prisma.subject.create({ data: s })),
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const student of students) {
    const profileId = student.studentProfile!.id;
    for (let i = 0; i < 21; i++) {
      const date = subDays(today, i);
      const hours = 2 + ((i + student.name.length) % 4);
      const minutes = (i * 15) % 60;
      await prisma.studyLog.create({
        data: {
          studentId: profileId,
          date,
          studyHours: hours,
          studyMinutes: minutes,
          description: `Studied core subjects — day ${i + 1}`,
        },
      });
    }

    for (let i = 0; i < 8; i++) {
      const subject = subjects[i % subjects.length];
      const obtained = 30 + ((i * 7 + student.name.length) % 20);
      const total = 50;
      const percentage = calculatePercentage(obtained, total);
      await prisma.score.create({
        data: {
          studentId: profileId,
          subjectId: subject.id,
          examName: `Weekly Test ${String(i + 1).padStart(2, "0")}`,
          examDate: subDays(today, i * 7),
          obtainedMarks: obtained,
          totalMarks: total,
          percentage,
          grade: determineGrade(percentage),
          remarks: percentage >= 80 ? "Excellent" : "Keep improving",
        },
      });
    }

    await prisma.goal.create({
      data: {
        studentId: profileId,
        title: "Study 5 hours every day",
        description: "Maintain consistent daily study habit",
        targetValue: 5,
        currentValue: 3.5 + (students.indexOf(student) % 2),
        deadline: new Date(today.getFullYear(), today.getMonth() + 1, 0),
        status: GoalStatus.ACTIVE,
      },
    });
  }

  const note = await prisma.note.create({
    data: {
      title: "Algebra Notes",
      description: "Chapter 3 algebra summary",
      fileUrl: "/uploads/sample-algebra.pdf",
      fileName: "Algebra Notes.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
      subjectId: subjects[0].id,
      uploadedBy: admin.id,
      assignToAll: true,
    },
  });

  await prisma.note.create({
    data: {
      title: "Motion Chapter",
      description: "Physics motion notes",
      fileUrl: "/uploads/sample-motion.pdf",
      fileName: "Motion Chapter.pdf",
      fileType: "application/pdf",
      fileSize: 2048,
      subjectId: subjects[1].id,
      uploadedBy: admin.id,
      assignToAll: false,
      students: {
        create: [{ studentId: students[0].studentProfile!.id }],
      },
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        userId: admin.id,
        action: "SCORE_CREATED",
        entityType: "Score",
        metadata: { note: "Seed scores" },
      },
      {
        userId: students[0].id,
        action: "STUDY_LOG_CREATED",
        entityType: "StudyLog",
      },
      {
        userId: admin.id,
        action: "NOTE_UPLOADED",
        entityType: "Note",
        entityId: note.id,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin: admin@edutrack.local / Admin@123");
  console.log("Students: rahim@edutrack.local / Student@123 (same for karim, sadia)");
  console.log(
    "You can also register new students at /register or use Google OAuth if configured.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
