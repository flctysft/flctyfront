import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import JobsBrowse from './pages/JobsBrowse.jsx'
import JobDetail from './pages/JobDetail.jsx'
import CandidateDashboard from './pages/candidate/CandidateDashboard.jsx'
import MyProfile from './pages/candidate/MyProfile.jsx'
import MyApplications from './pages/candidate/MyApplications.jsx'
import MyInterviews from './pages/candidate/MyInterviews.jsx'
import ApplicationOffer from './pages/candidate/ApplicationOffer.jsx'
import CandidateCodingTests from './pages/candidate/CodingTests.jsx'
import CodingTestAttempt from './pages/candidate/CodingTestAttempt.jsx'
import EmployerDashboard from './pages/employer/EmployerDashboard.jsx'
import MyJobs from './pages/employer/MyJobs.jsx'
import JobForm from './pages/employer/JobForm.jsx'
import JobApplicants from './pages/employer/JobApplicants.jsx'
import Candidates from './pages/employer/Candidates.jsx'
import CodingQuestions from './pages/employer/CodingQuestions.jsx'
import CodingQuestionForm from './pages/employer/CodingQuestionForm.jsx'
import CodingTests from './pages/employer/CodingTests.jsx'
import CodingTestForm from './pages/employer/CodingTestForm.jsx'
import CodingTestDashboard from './pages/employer/CodingTestDashboard.jsx'
import CodingTestReport from './pages/employer/CodingTestReport.jsx'
import InterviewRoom from './pages/InterviewRoom.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import LanguageManagement from './pages/admin/LanguageManagement.jsx'
import LanguagePlayground from './pages/admin/LanguagePlayground.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobsBrowse />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        <Route path="/interviews/:id/room" element={<InterviewRoom />} />

        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute role="CANDIDATE">
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute role="CANDIDATE">
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/interviews"
          element={
            <ProtectedRoute role="CANDIDATE">
              <MyInterviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications/:id/offer"
          element={
            <ProtectedRoute role="CANDIDATE">
              <ApplicationOffer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/coding-tests"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CandidateCodingTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/coding-tests/:id"
          element={
            <ProtectedRoute role="CANDIDATE">
              <CodingTestAttempt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute role="EMPLOYER">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute role="EMPLOYER">
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute role="EMPLOYER">
              <JobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/edit"
          element={
            <ProtectedRoute role="EMPLOYER">
              <JobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:jobId/applicants"
          element={
            <ProtectedRoute role="EMPLOYER">
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/candidates"
          element={
            <ProtectedRoute role="EMPLOYER">
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-questions"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-questions/new"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingQuestionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-questions/:id/edit"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingQuestionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-tests"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-tests/new"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingTestForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-tests/:id/edit"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingTestForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-tests/:id/dashboard"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingTestDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/coding-tests/:id/invitations/:invitationId/report"
          element={
            <ProtectedRoute role="EMPLOYER">
              <CodingTestReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/languages"
          element={
            <ProtectedRoute role="ADMIN">
              <LanguageManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/languages/playground"
          element={
            <ProtectedRoute role="ADMIN">
              <LanguagePlayground />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
