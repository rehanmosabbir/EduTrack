import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { Role } from "@prisma/client";

const app = createApp();

function tokenFor(user: { id: string; email: string; role: Role }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );
}

describe("API auth and isolation", () => {
  let adminToken: string;
  let studentAToken: string;
  let studentBId: string;
  let studentAProfileId: string;

  beforeAll(async () => {
    const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    const students = await prisma.studentProfile.findMany({
      include: { user: true },
      take: 2,
    });
    if (!admin || students.length < 2) {
      throw new Error("Seed data required before running API tests");
    }
    adminToken = tokenFor(admin);
    studentAToken = tokenFor(students[0].user);
    studentAProfileId = students[0].id;
    studentBId = students[1].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/students");
    expect(res.status).toBe(401);
  });

  it("allows admin to list students", async () => {
    const res = await request(app)
      .get("/api/students")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("prevents student from listing all students", async () => {
    const res = await request(app)
      .get("/api/students")
      .set("Authorization", `Bearer ${studentAToken}`);
    expect(res.status).toBe(403);
  });

  it("prevents student from viewing another student", async () => {
    const res = await request(app)
      .get(`/api/students/${studentBId}`)
      .set("Authorization", `Bearer ${studentAToken}`);
    expect(res.status).toBe(403);
  });

  it("allows student to view own profile", async () => {
    const res = await request(app)
      .get(`/api/students/${studentAProfileId}`)
      .set("Authorization", `Bearer ${studentAToken}`);
    expect(res.status).toBe(200);
  });

  it("creates a student account for new Google users", async () => {
    const res = await request(app).post("/api/auth/google-sync").send({
      email: "newgoogle@example.com",
      name: "New Google User",
      googleId: "google-new-user-test",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("STUDENT");
    expect(res.body.data.accessToken).toBeTruthy();

    await prisma.user.delete({ where: { email: "newgoogle@example.com" } });
  });

  it("creates score with calculated percentage", async () => {
    const subjects = await prisma.subject.findFirst();
    expect(subjects).toBeTruthy();
    const res = await request(app)
      .post("/api/scores")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        studentId: studentAProfileId,
        subjectId: subjects!.id,
        examName: "Vitest Exam",
        examDate: new Date().toISOString().slice(0, 10),
        obtainedMarks: 45,
        totalMarks: 50,
        remarks: "Test",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.percentage).toBe(90);
    expect(res.body.data.grade).toBe("A+");

    await prisma.score.delete({ where: { id: res.body.data.id } });
  });

  it("blocks student from creating scores", async () => {
    const subjects = await prisma.subject.findFirst();
    const res = await request(app)
      .post("/api/scores")
      .set("Authorization", `Bearer ${studentAToken}`)
      .send({
        studentId: studentAProfileId,
        subjectId: subjects!.id,
        examName: "Hack",
        examDate: new Date().toISOString().slice(0, 10),
        obtainedMarks: 50,
        totalMarks: 50,
      });
    expect(res.status).toBe(403);
  });
});
