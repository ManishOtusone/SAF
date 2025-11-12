import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./Layout/Admin/AdminLayout";
import Login from "./pages/common/Login";
import Signup from "./pages/common/Signup";
import UserLayout from "./Layout/User/UserLayout";
import MembershipPlans from "./pages/user/MembershipPlans";
import Dashboard from "./pages/user/Dashboard";
import StudyMaterial from "./pages/user/StudyMaterial";
import StudyMaterialDetail from "./pages/user/StudyMaterialDetail";
import MemberManagement from "./pages/admin/MemberManagement";
import ServiceManagement from "./pages/admin/ServiceManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import DefaultLayout from "./Layout/Default/DefaultLayout";
import Enquiry from "./pages/user/Enquiry";
import AdminEnquiry from "./pages/admin/Enquiry";

import { Toaster } from "react-hot-toast";
import AllReferalls from "./pages/admin/AllReferalls";
import Referalls from "./pages/user/Referalls";
import Contents from "./pages/user/Contents";
import RequestedContents from "./pages/admin/RequestedContents";

function App() {
  function PrivateRoute({ children, roleRequired }) {
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("role");

    // if (!token) {
    //   return <Navigate to="/" />;
    // }


    // if (userRole !== roleRequired) {
    //   return (
    //     <div style={{
    //       display: 'flex',
    //       justifyContent: 'center',
    //       alignItems: 'center',
    //       height: '100vh',
    //       flexDirection: 'column',
    //       textAlign: 'center'
    //     }}>
    //       <h2>Access Denied</h2>
    //       <p>User not permitted to access this section.</p>
    //       <p>Please contact administrator for access.</p>
    //     </div>
    //   );
    // }

    return children;
  }

  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>


        <Routes>
          {/* <Route path="/" element={<Layout />}>
          <Route index element={<SignIn />} />
          <Route path="signin" element={<SignIn />} />
        </Route> */}

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<DefaultLayout />} />

          <Route path="/admin" element={
            <PrivateRoute roleRequired="admin">
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<MemberManagement />} />
            <Route path="" element={<MemberManagement />} />
            <Route path="serviceManagement" element={<ServiceManagement />} />
            <Route path="contentManagement" element={<ContentManagement />} />
            <Route path="enquiry" element={<AdminEnquiry />} />
            <Route path="allReferalls" element={<AllReferalls />} />
            <Route path="content-request" element={<RequestedContents />} />
            




          </Route>
          <Route path="/user" element={
            <PrivateRoute roleRequired="user">
              <UserLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="plans" element={<MembershipPlans />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="studyMaterial" element={<StudyMaterial />} />
            <Route path="studyMaterial/:id" element={<StudyMaterialDetail />} />
            <Route path="enquiry" element={<Enquiry />} />
            <Route path="referalls" element={<Referalls />} />
            <Route path="content" element={<Contents />} />






          </Route>


          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column'
            }}>
              <h2>Page Not Found</h2>
              <p>The page you are looking for doesn't exist or you don't have permission to access it.</p>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;