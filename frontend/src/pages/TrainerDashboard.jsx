// frontend/src/pages/TrainerDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import { api } from "../api";

const TrainerDashboard = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Lesson state
  const [lessonForm, setLessonForm] = useState({
    title: "",
    type: "pdf", // pdf | video | note
    content: "",
  });
  const [lessonFile, setLessonFile] = useState(null);

  // Exam builder state
  const [examTitle, setExamTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    type: "mcq", // mcq | short | long
    options: ["", "", "", ""],
    correctIndex: 0,
    maxMarks: 1,
    rubric: "",
  });

  // Load stats + courses
  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, courseRes] = await Promise.all([
          api.get("/stats/trainer/me"),
          api.get("/courses"),
        ]);
        setStats(statsRes.data);
        setCourses(courseRes.data.filter((c) => c.trainer._id === user._id));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user]);

  // ---------- COURSE CREATION ----------
  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/courses", newCourse);
      setCourses((prev) => [...prev, res.data]);
      setNewCourse({ title: "", description: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating course");
    }
  };

  // ---------- LESSON UPLOAD ----------
  const handleLessonFileChange = (e) => {
    setLessonFile(e.target.files[0] || null);
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert("Select a course first");
      return;
    }

    let filePath = "";
    try {
      if (lessonForm.type === "pdf" || lessonForm.type === "video") {
        if (!lessonFile) {
          alert("Please choose a file");
          return;
        }
        const formData = new FormData();
        formData.append("file", lessonFile);

        const uploadUrl =
          lessonForm.type === "pdf" ? "/upload/pdf" : "/upload/video";

        const uploadRes = await api.post(uploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        filePath = uploadRes.data.filePath;
      }

      const body = {
        title: lessonForm.title,
        type:
          lessonForm.type === "pdf"
            ? "pdf"
            : lessonForm.type === "video"
            ? "video"
            : "note",
        filePath: filePath || undefined,
        content: lessonForm.type === "note" ? lessonForm.content : "",
      };

      const res = await api.post(
        `/courses/${selectedCourseId}/lessons`,
        body
      );

      // update courses locally
      setCourses((prev) =>
        prev.map((c) => (c._id === res.data._id ? res.data : c))
      );

      setLessonForm({ title: "", type: "pdf", content: "" });
      setLessonFile(null);
      alert("Lesson added");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding lesson");
    }
  };

  // ---------- EXAM BUILDER ----------
  const updateOption = (index, value) => {
    setNewQuestion((prev) => {
      const opts = [...prev.options];
      opts[index] = value;
      return { ...prev, options: opts };
    });
  };

  const addQuestionToList = () => {
    if (!newQuestion.questionText.trim()) {
      alert("Enter question text");
      return;
    }

    const q = { ...newQuestion };
    if (q.type !== "mcq") {
      q.options = [];
      q.correctIndex = null;
    }
    setQuestions((prev) => [...prev, q]);
    setNewQuestion({
      questionText: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctIndex: 0,
      maxMarks: 1,
      rubric: "",
    });
  };

  const createExam = async () => {
    if (!selectedCourseId) {
      alert("Select a course for the exam");
      return;
    }
    if (!examTitle.trim()) {
      alert("Enter exam title");
      return;
    }
    if (questions.length === 0) {
      alert("Add at least one question");
      return;
    }

    try {
      await api.post("/exams", {
        courseId: selectedCourseId,
        title: examTitle,
        durationMinutes,
        questions,
      });
      setExamTitle("");
      setDurationMinutes(30);
      setQuestions([]);
      alert("Exam created with AI-ready questions!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating exam");
    }
  };

  // ---------- RENDER ----------
  return (
    <div>
      <h2>Trainer Dashboard</h2>
      <p>Welcome, {user?.name}</p>

      {/* Stats */}
      {stats ? (
        <div
          style={{
            border: "1px solid #333",
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <h3>Your Training Performance</h3>
          <ul>
            <li>Courses: {stats.coursesCount}</li>
            <li>Exams: {stats.examsCount}</li>
            <li>Unique Students: {stats.totalStudents}</li>
            <li>Total Submissions: {stats.totalSubmissions}</li>
            <li>Average Score: {stats.avgScore.toFixed(2)}</li>
          </ul>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* LEFT COLUMN: Courses + Lessons */}
        <div>
          {/* Course creation */}
          <div
            style={{
              border: "1px solid #333",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <h3>Create Course</h3>
            <form onSubmit={createCourse}>
              <div>
                <label>Title</label>
                <input
                  style={{ width: "100%" }}
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  style={{ width: "100%" }}
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                />
              </div>
              <button type="submit" style={{ marginTop: 10 }}>
                Create Course
              </button>
            </form>
          </div>

          {/* Courses list & select for lessons/exams */}
          <div
            style={{
              border: "1px solid #333",
              padding: 15,
              borderRadius: 8,
            }}
          >
            <h3>Your Courses</h3>
            {courses.length === 0 && <p>No courses yet.</p>}
            {courses.length > 0 && (
              <>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ width: "100%", marginBottom: 10 }}
                >
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <ul>
                  {courses.map((c) => (
                    <li key={c._id}>
                      {c.title} ({c.lessons?.length || 0} lessons)
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Lesson upload */}
          <div
            style={{
              border: "1px solid #333",
              padding: 15,
              borderRadius: 8,
              marginTop: 20,
            }}
          >
            <h3>Add Lesson to Selected Course</h3>
            {!selectedCourseId && <p>Select a course above first.</p>}
            {selectedCourseId && (
              <form onSubmit={addLesson}>
                <div>
                  <label>Lesson title</label>
                  <input
                    style={{ width: "100%" }}
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Type</label>
                  <select
                    style={{ width: "100%" }}
                    value={lessonForm.type}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, type: e.target.value })
                    }
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="note">Note (text)</option>
                  </select>
                </div>

                {(lessonForm.type === "pdf" ||
                  lessonForm.type === "video") && (
                  <div>
                    <label>File</label>
                    <input type="file" onChange={handleLessonFileChange} />
                  </div>
                )}

                {lessonForm.type === "note" && (
                  <div>
                    <label>Content</label>
                    <textarea
                      style={{ width: "100%" }}
                      value={lessonForm.content}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          content: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <button type="submit" style={{ marginTop: 10 }}>
                  Add Lesson
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Exam builder */}
        <div>
          <div
            style={{
              border: "1px solid #333",
              padding: 15,
              borderRadius: 8,
            }}
          >
            <h3>Create Exam (AI-graded)</h3>
            {!selectedCourseId && (
              <p>Select a course (left side) to attach this exam.</p>
            )}
            {selectedCourseId && (
              <>
                <div>
                  <label>Exam title</label>
                  <input
                    style={{ width: "100%" }}
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                </div>

                <hr style={{ margin: "10px 0" }} />

                <h4>Add Question</h4>
                <div>
                  <label>Question text</label>
                  <textarea
                    style={{ width: "100%" }}
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        questionText: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Type</label>
                  <select
                    style={{ width: "100%" }}
                    value={newQuestion.type}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, type: e.target.value })
                    }
                  >
                    <option value="mcq">MCQ</option>
                    <option value="short">Short answer</option>
                    <option value="long">Long answer</option>
                  </select>
                </div>

                {newQuestion.type === "mcq" && (
                  <>
                    <div>
                      <label>Options</label>
                      {newQuestion.options.map((opt, idx) => (
                        <input
                          key={idx}
                          style={{ width: "100%", marginBottom: 4 }}
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div>
                      <label>Correct option index (0–3)</label>
                      <input
                        type="number"
                        style={{ width: "100%" }}
                        min={0}
                        max={newQuestion.options.length - 1}
                        value={newQuestion.correctIndex}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            correctIndex: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {newQuestion.type !== "mcq" && (
                  <div>
                    <label>Rubric for AI</label>
                    <textarea
                      style={{ width: "100%" }}
                      placeholder="What should a good answer include? Points to cover, structure, examples, etc."
                      value={newQuestion.rubric}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          rubric: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <label>Max marks</label>
                  <input
                    type="number"
                    style={{ width: "100%" }}
                    value={newQuestion.maxMarks}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        maxMarks: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  style={{ marginTop: 10 }}
                  onClick={addQuestionToList}
                >
                  Add question to exam
                </button>

                {questions.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 15 }}>
                      Questions in this exam: {questions.length}
                    </h4>
                    <ol>
                      {questions.map((q, idx) => (
                        <li key={idx}>
                          {q.questionText.substring(0, 80)}
                          {q.questionText.length > 80 ? "..." : ""}{" "}
                          <em>({q.type}, {q.maxMarks} marks)</em>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      style={{ marginTop: 10 }}
                      onClick={createExam}
                    >
                      Save Exam
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
