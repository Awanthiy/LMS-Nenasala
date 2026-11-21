import { PrismaClient, type DayOfWeek } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FIRST = ["Amal", "Nimali", "Kasun", "Sachini", "Ravindu", "Dilini", "Tharindu", "Hasini", "Pasan", "Isuri",
  "Dinuka", "Chamodi", "Nuwan", "Sewmi", "Lahiru", "Oshadi", "Yasiru", "Thilini", "Janith", "Methmi"];
const LAST = ["Perera", "Fernando", "Silva", "Jayawardena", "Wickramasinghe", "Gunasekara", "Rajapaksha", "Herath", "Weerasinghe", "Senanayake"];
const SUBJECTS = [
  { name: "Mathematics", code: "MATH" },
  { name: "Science", code: "SCI" },
  { name: "English", code: "ENG" },
  { name: "ICT", code: "ICT" },
];
const CLASSES: { name: string; subject: string; teacher: number; day: DayOfWeek; start: string; end: string; room: string }[] = [
  { name: "Grade 10 Mathematics", subject: "Mathematics", teacher: 0, day: "MONDAY", start: "14:00", end: "15:30", room: "Room A" },
  { name: "Grade 11 Mathematics", subject: "Mathematics", teacher: 0, day: "WEDNESDAY", start: "16:00", end: "17:30", room: "Room A" },
  { name: "Grade 10 Science", subject: "Science", teacher: 1, day: "TUESDAY", start: "14:00", end: "15:30", room: "Room B" },
  { name: "Grade 11 Science", subject: "Science", teacher: 1, day: "THURSDAY", start: "16:00", end: "17:30", room: "Room B" },
  { name: "Grade 10 English", subject: "English", teacher: 2, day: "FRIDAY", start: "14:00", end: "15:30", room: "Room C" },
  { name: "Grade 10 ICT", subject: "ICT", teacher: 2, day: "SATURDAY", start: "09:00", end: "10:30", room: "Lab 1" },
];

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed demo data in production.");
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 10) throw new Error("Set SEED_PASSWORD (min 10 chars) in .env before seeding.");
  const passwordHash = await bcrypt.hash(password, 12);

  const upsertUser = (email: string, name: string, role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT") =>
    prisma.user.upsert({ where: { email }, update: {}, create: { email, name, role, passwordHash } });

  // Admin
  await upsertUser("admin@classhub.test", "Admin User", "ADMIN");

  // Subjects
  const subjects = new Map<string, string>();
  for (const s of SUBJECTS) {
    const row = await prisma.subject.upsert({ where: { name: s.name }, update: {}, create: s });
    subjects.set(s.name, row.id);
  }

  // Teachers (3)
  const teacherIds: string[] = [];
  const teacherSubjects = [["Mathematics"], ["Science"], ["English", "ICT"]] as const;
  for (let i = 0; i < 3; i++) {
    const user = await upsertUser(`teacher${i + 1}@classhub.test`, `${FIRST[i]} ${LAST[i]}`, "TEACHER");
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        phone: `+9477000${1000 + i}`,
        subjects: { connect: (teacherSubjects[i] ?? []).map((n) => ({ id: subjects.get(n)! })) },
      },
    });
    teacherIds.push(teacher.id);
  }

  // Classes
  const classIds: string[] = [];
  for (const c of CLASSES) {
    const existing = await prisma.class.findFirst({ where: { name: c.name } });
    const row =
      existing ??
      (await prisma.class.create({
        data: {
          name: c.name,
          subjectId: subjects.get(c.subject)!,
          teacherId: teacherIds[c.teacher]!,
          dayOfWeek: c.day,
          startTime: c.start,
          endTime: c.end,
          room: c.room,
          maxStudents: 25,
        },
      }));
    classIds.push(row.id);
  }

  // Parents (10) and students (20): each parent has two children
  const studentIds: string[] = [];
  for (let i = 0; i < 20; i++) {
    const n = String(i + 1).padStart(2, "0");
    const user = await upsertUser(`student${n}@classhub.test`, `${FIRST[i]} ${LAST[i % 10]}`, "STUDENT");
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        studentCode: `STU-2026-${String(i + 1).padStart(4, "0")}`,
        phone: `+9477100${1000 + i}`,
        dateOfBirth: new Date(Date.UTC(2009 + (i % 3), i % 12, 5 + (i % 20))),
      },
    });
    studentIds.push(student.id);

    // enrol in two classes
    for (const classId of [classIds[i % 6]!, classIds[(i + 2) % 6]!]) {
      await prisma.classStudent.upsert({
        where: { classId_studentId: { classId, studentId: student.id } },
        update: {},
        create: { classId, studentId: student.id },
      });
    }
  }

  for (let p = 0; p < 10; p++) {
    const n = String(p + 1).padStart(2, "0");
    const user = await upsertUser(`parent${n}@classhub.test`, `${FIRST[(p + 7) % 20]} ${LAST[p]}`, "PARENT");
    const parent = await prisma.parent.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, phone: `+9477200${1000 + p}` },
    });
    for (const studentId of [studentIds[p * 2]!, studentIds[p * 2 + 1]!]) {
      await prisma.parentStudent.upsert({
        where: { parentId_studentId: { parentId: parent.id, studentId } },
        update: {},
        create: { parentId: parent.id, studentId, relationship: "Guardian" },
      });
    }
  }

  console.log("Seed complete: 1 admin, 3 teachers, 10 parents, 20 students, 6 classes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
