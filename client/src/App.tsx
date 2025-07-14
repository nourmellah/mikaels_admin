import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./ProtectedRoute";
import AddStudentPage from "./pages/Students/AddStudents";
import StudentsList from "./pages/Students/StudentsList";
import AddGroupPage from "./pages/Groups/AddGroups";
import AddTeacherPage from "./pages/Teachers/AddTeachers";
import TeachersList from "./pages/Teachers/TeachersList";
import GroupsList from "./pages/Groups/GroupsList";
import StudentProfile from "./pages/Students/StudentProfile";
import TeacherProfile from "./pages/Teachers/TeacherProfile";
import GroupProfile from "./pages/Groups/GroupProfile";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Students Pages */}
              <Route path="/students">
                <Route index element={<StudentsList />} />
                <Route path="add" element={<AddStudentPage />} />
                <Route path="/students/:id/" element={<StudentProfile />} />
              </Route>

              {/* Groups Pages */}
              <Route path="/groups">
                <Route index element={<GroupsList />} />
                <Route path="add" element={<AddGroupPage />} />
                <Route path="/groups/:id/" element={<GroupProfile />} />
              </Route>

              {/* Teachers Pages */}
              <Route path="/teachers">
                <Route index element={<TeachersList />} />
                <Route path="add" element={<AddTeacherPage />} />
                <Route path="/teachers/:id/" element={<TeacherProfile />} />
              </Route>


              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>
          {/* Auth Layout */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
