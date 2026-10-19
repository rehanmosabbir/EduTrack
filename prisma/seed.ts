import {
  PrismaClient,
  Role,
  PreparationStatus,
  HomeworkCompletionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding coaching database...");

  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.guardianComment.deleteMany();
  await prisma.lessonEvaluation.deleteMany();
  await prisma.homeworkAssignment.deleteMany();
  await prisma.studentSubject.deleteMany();
  await prisma.studentGuardian.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.user.deleteMany();

  const teacherPassword = await bcrypt.hash("Teacher@123", 12);
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const guardianPassword = await bcrypt.hash("Guardian@123", 12);

  const teacher = await prisma.user.create({
    data: {
      name: "Ms. Fatema Teacher",
      email: "teacher@edutrack.local",
      passwordHash: teacherPassword,
      role: Role.TEACHER,
    },
  });

  const curriculumSubjects = [
    // Junior (Class 6–8)
    "Bangla",
    "English",
    "Mathematics",
    "Science",
    "Bangladesh and Global Studies",
    "ICT",
    "Religion and Moral Education",
    "Physical Education and Health",
    "Arts and Crafts",
    // Secondary (Class 9–10 / SSC)
    "General Mathematics",
    "Higher Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Accounting",
    "Business Entrepreneurship",
    "Finance and Banking",
    "Civics and Citizenship",
    "History",
    "Geography",
    "Economics",
    // Higher secondary (Class 11–12 / HSC)
    "Business Organization and Management",
    "Finance, Banking and Insurance",
    "Islamic History and Culture",
    "Civics and Good Governance",
    "Logic",
    "Sociology",
    "Statistics",
  ];

  const subjectByName = new Map<string, { id: string }>();
  for (const name of curriculumSubjects) {
    const subject = await prisma.subject.create({
      data: { name, description: "Bangladeshi NCTB curriculum" },
    });
    subjectByName.set(name, subject);
  }

  const english = subjectByName.get("English")!;
  const physics = subjectByName.get("Physics")!;
  const higherMath = subjectByName.get("Higher Mathematics")!;
  const generalMath = subjectByName.get("General Mathematics")!;
  const chemistry = subjectByName.get("Chemistry")!;

  const studentsData = [
    {
      fullName: "Rahim Ahmed",
      email: "rahim@edutrack.local",
      studentCode: "STU-001",
      className: "HSC",
      schoolName: "XYZ College",
      subjectNames: ["English", "Higher Mathematics", "Physics", "Chemistry"],
    },
    {
      fullName: "Karim Hossain",
      email: "karim@edutrack.local",
      studentCode: "STU-002",
      className: "HSC",
      schoolName: "ABC College",
      subjectNames: ["English", "Higher Mathematics", "Physics"],
    },
    {
      fullName: "Sadia Islam",
      email: "sadia@edutrack.local",
      studentCode: "STU-003",
      className: "SSC",
      schoolName: "City School",
      subjectNames: ["English", "General Mathematics", "Physics", "Chemistry"],
    },
  ];

  const students = [];
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        name: s.fullName,
        email: s.email,
        passwordHash: studentPassword,
        role: Role.STUDENT,
      },
    });
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        className: s.className,
        schoolName: s.schoolName,
        enrollmentDate: subDays(new Date(), 60),
        subjects: {
          create: s.subjectNames.map((name) => ({
            subjectId: subjectByName.get(name)!.id,
          })),
        },
      },
    });
    students.push(student);
  }

  const guardianUser = await prisma.user.create({
    data: {
      name: "Mr. Ahmed (Guardian)",
      email: "guardian@edutrack.local",
      passwordHash: guardianPassword,
      role: Role.GUARDIAN,
    },
  });
  const guardian = await prisma.guardian.create({
    data: {
      userId: guardianUser.id,
      phone: "01700000000",
      students: {
        create: [
          { studentId: students[0].id, relationship: "Father" },
          { studentId: students[1].id, relationship: "Uncle" },
        ],
      },
    },
  });

  const hw1 = await prisma.homeworkAssignment.create({
    data: {
      studentId: students[0].id,
      subjectId: higherMath.id,
      title: "Algebra practice set A",
      lessonOrChapter: "Algebra",
      instructions: "Complete exercises 1–10 from the worksheet.",
      assignedAt: new Date(),
      dueDate: new Date(Date.now() + 2 * 86400000),
      maximumMarks: 10,
      createdByTeacherId: teacher.id,
    },
  });

  await prisma.homeworkAssignment.create({
    data: {
      studentId: students[0].id,
      subjectId: english.id,
      title: "Grammar worksheet",
      lessonOrChapter: "Grammar",
      instructions: "Rewrite the sentences in reported speech.",
      assignedAt: new Date(),
      dueDate: new Date(Date.now() + 3 * 86400000),
      maximumMarks: 10,
      createdByTeacherId: teacher.id,
    },
  });

  await prisma.homeworkAssignment.create({
    data: {
      studentId: students[1].id,
      subjectId: higherMath.id,
      title: "Different algebra set",
      lessonOrChapter: "Algebra",
      instructions: "Karim-only assignment: word problems 1–5.",
      assignedAt: new Date(),
      createdByTeacherId: teacher.id,
    },
  });

  await prisma.lessonEvaluation.createMany({
    data: [
      {
        studentId: students[0].id,
        subjectId: higherMath.id,
        homeworkAssignmentId: hw1.id,
        evaluationDate: new Date(),
        lessonOrChapter: "Algebra",
        preparationStatus: PreparationStatus.PREPARED,
        homeworkStatus: HomeworkCompletionStatus.COMPLETED,
        marksObtained: 8,
        maximumMarks: 10,
        teacherFeedback: "Good work on equations.",
        privateTeacherNotes: "Needs more practice on inequalities.",
        evaluatedByTeacherId: teacher.id,
      },
      {
        studentId: students[0].id,
        subjectId: english.id,
        evaluationDate: new Date(),
        lessonOrChapter: "Grammar",
        preparationStatus: PreparationStatus.PARTIALLY_PREPARED,
        homeworkStatus: HomeworkCompletionStatus.PARTIALLY_COMPLETED,
        marksObtained: 7,
        maximumMarks: 10,
        teacherFeedback: "Improve sentence structure.",
        evaluatedByTeacherId: teacher.id,
      },
      {
        studentId: students[0].id,
        subjectId: physics.id,
        evaluationDate: subDays(new Date(), 1),
        lessonOrChapter: "Mechanics",
        preparationStatus: PreparationStatus.PREPARED,
        homeworkStatus: HomeworkCompletionStatus.COMPLETED,
        marksObtained: 9,
        maximumMarks: 10,
        teacherFeedback: "Excellent diagrams.",
        evaluatedByTeacherId: teacher.id,
      },
      {
        studentId: students[1].id,
        subjectId: higherMath.id,
        evaluationDate: new Date(),
        lessonOrChapter: "Algebra",
        preparationStatus: PreparationStatus.NOT_PREPARED,
        homeworkStatus: HomeworkCompletionStatus.NOT_COMPLETED,
        marksObtained: null,
        maximumMarks: null,
        teacherFeedback: "Please prepare the lesson next time.",
        evaluatedByTeacherId: teacher.id,
      },
      {
        studentId: students[2].id,
        subjectId: generalMath.id,
        evaluationDate: new Date(),
        lessonOrChapter: "Algebra",
        preparationStatus: PreparationStatus.PREPARED,
        homeworkStatus: HomeworkCompletionStatus.COMPLETED,
        marksObtained: 8,
        maximumMarks: 10,
        teacherFeedback: "Solid SSC prep work.",
        evaluatedByTeacherId: teacher.id,
      },
      {
        studentId: students[2].id,
        subjectId: chemistry.id,
        evaluationDate: subDays(new Date(), 1),
        lessonOrChapter: "Acids and bases",
        preparationStatus: PreparationStatus.PARTIALLY_PREPARED,
        homeworkStatus: HomeworkCompletionStatus.PARTIALLY_COMPLETED,
        marksObtained: 6,
        maximumMarks: 10,
        teacherFeedback: "Review titration steps.",
        evaluatedByTeacherId: teacher.id,
      },
    ],
  });

  const parentComment = await prisma.guardianComment.create({
    data: {
      studentId: students[0].id,
      guardianId: guardian.id,
      authorUserId: guardianUser.id,
      authorRole: Role.GUARDIAN,
      message: "How is Rahim doing in Algebra this week?",
    },
  });

  await prisma.guardianComment.create({
    data: {
      studentId: students[0].id,
      guardianId: guardian.id,
      authorUserId: teacher.id,
      authorRole: Role.TEACHER,
      parentCommentId: parentComment.id,
      message: "He scored 8/10 today and is improving steadily.",
    },
  });

  console.log("Seed complete.");
  console.log("Teacher: teacher@edutrack.local / Teacher@123");
  console.log("Student: rahim@edutrack.local / Student@123");
  console.log("Guardian: guardian@edutrack.local / Guardian@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
