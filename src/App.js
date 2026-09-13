import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./services/UserContext";
import { VisitorCounterProvider } from "./services/VisitorCounterContext";

// Common Components
import Login from "./components/forms/LoginForm";
import Register from "./components/forms/RegisterForm";
import ResetPassword from "./components/forms/ResetPassword";
import AdminLogin from "./components/common/AdminLogin";

// Layout Components
import ForgotPassword from "./components/forms/ForgotPassword";
import RootLayout from "./components/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import AdminLayout from "./pages/admin/AdminLayout";

// Pages
import Home from "./pages/Home";
import FeedHome from "./components/feed/FeedHome";
import Profile from "./pages/specific/Profile";
import UpdateProfile from "./pages/specific/UpdateProfile";
import ChangeProfilePicture from "./pages/specific/ChangeProfilePicture";
import { NotFound, Forbidden, ServerError } from "./pages/detail/ErrorPage";

// Admin Pages
import AdminNewsForm from "./pages/admin/AdminNewsForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventsForm from "./pages/admin/AdminEventsForm";
import PhotoUpload from "./pages/admin/PhotoUpload";
import AdminAlumniFaceUpload from "./pages/admin/AdminAlumniFaceUpload";
import AlumniArchive from "../src/pages/admin/AlumniArchive";
import AdminEmailForm from "./pages/admin/AdminEmailForm";
import BulkAddAlumni from "./pages/admin/AlumniRecordUpload";
import CreateAdmin from "./pages/admin/CreateAdmin";

import AdminFeedbackPanel from "./pages/admin/AdminFeedbackPanel";
import DashboardCharts from "./pages/admin/AdminStats";
import FlaggedPosts from "./pages/admin/FlaggedPosts";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminDevelopers from "./pages/admin/AdminDevelopers";



// Detail Pages
import AlumniAchievers from "./pages/articles/AlumniAchievers";
import { Copyright, Disclaimer, TermsOfUse, ContactUs, PrivacyPolicy } from "./pages/detail/Others";
import FeedbackForm from "./pages/detail/Feedbackform";
import Scholarship from "./pages/articles/Scholarship";
import AssociationMembers from "./pages/articles/AssociationMembers";
import Gallery from "./pages/articles/Gallery";
import SingleAlbum from "./pages/articles/SingleAlbum";
import AlumniFaceShow from "./pages/articles/AlumniFaceShow";
import Developers from "./pages/articles/Developers";
import JobsOpportunity from "./pages/articles/JobsOpportunity";
import Events from "./pages/detail/Events";
import NewsList from "./pages/detail/NewsArchive";
import SingleNews from "./pages/detail/SingleNews";
import SingleEvent from "./pages/detail/SingleEvent";
import Donations from "./pages/detail/Donations";
import GoverningCouncil from "./pages/articles/GoverningCouncil";




import AboutAssociation from "./pages/articles/About-Association";
import MissionAndVision from "./pages/articles/MissionAndVision";
import VCMessage from "./pages/articles/VCMessage";
import RegistrarMessage from "./pages/articles/RegistrarMessage";
import PresidentMessage from "./pages/articles/PresidentMessage";
import ChancellorMessage from "./pages/articles/ChancellorMessage";

function App() {
  return (
    <UserProvider>
      <VisitorCounterProvider>
      <React.Fragment>
        <div className="w-full md:flex">
          <section className="flex flex-1 h-full">
            <Routes>
              <Route element={<RootLayout />}>
                {/* Public Routes that redirect logged-in users */}
                <Route path="/login" element={<PublicRoute element={<Login />} />} />
                <Route path="/register" element={<PublicRoute element={<Register />} />} />
                <Route path="/forgot-password" element={<PublicRoute element={<ForgotPassword />} />} />
                <Route path="/admin-login" element={<PublicRoute element={<AdminLogin />} />} />

                {/* Open Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/council" element={<GoverningCouncil />} />
                <Route path="/association-members" element={<AssociationMembers />} />
                <Route path="/alumni-achievers" element={<AlumniAchievers />} />
                <Route path="/news" element={<NewsList />} />
                <Route path="/news/:id" element={<SingleNews />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/album/:id" element={<SingleAlbum />} />
                <Route path="/alumni-face-show" element={<AlumniFaceShow />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/opportunity/jobs" element={<JobsOpportunity />} />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/scholarship" element={<Scholarship />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<SingleEvent />} />
                <Route path="/copyright" element={<Copyright />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/termsofuse" element={<TermsOfUse />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/donations" element={<Donations />} />

                <Route path="/overview" element={<AboutAssociation />} />
                <Route path="/vision" element={<MissionAndVision />} />
                <Route path="/vcmsg" element={<VCMessage />} />
                <Route path="/registrarmsg" element={<RegistrarMessage />} />
                <Route path="/presmsg" element={<PresidentMessage />} />
                <Route path="/cmsg" element={<ChancellorMessage />} />

                {/* SuperUser + Admin + User Routes(logged-in user routes) */}
                
                <Route
                  path="/reset-password"
                  element={
                    <ProtectedRoute
                      element={<ResetPassword />}
                      requiredRole={["superuser", "admin", "user"]}
                    />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute element={<Profile />} requiredRole={["superuser", "admin", "user"]} />
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    <ProtectedRoute element={<Profile />} requiredRole={["superuser", "admin", "user"]} />
                  }
                />
                <Route
                  path="/change-profile-picture"
                  element={
                    <ProtectedRoute element={<ChangeProfilePicture />} requiredRole={["superuser", "admin", "user"]} />
                  }
                />
                <Route
                  path="/update-profile"
                  element={
                    <ProtectedRoute
                      element={<UpdateProfile />}
                      requiredRole={["superuser", "admin", "user"]}
                    />
                  }
                />
                <Route path="/forbidden" element={<Forbidden />} />
                <Route path="/server-error" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Welcome routes without bottomabar     */}

              <Route element={<RootLayout hideBottomBar={true} />}>
                <Route 
                  path="/welcome" 
                  element={
                    <ProtectedRoute
                      element={<FeedHome />}
                      requiredRole={["superuser", "admin", "user"]}
                    />
                  }
                />

                <Route 
                  path="/welcome/post/:postId" 
                  element={
                    <ProtectedRoute
                      element={<FeedHome />}
                      requiredRole={["superuser", "admin", "user"]}
                    />
                  }
                />
              </Route>

              {/* Admin & SuperUser Routes */}
              <Route
                element={
                  <ProtectedRoute
                    element={<AdminLayout />}
                    requiredRole={["superuser", "admin"]}
                  />
                }
              >
                <Route path="/admin-stats" element={<DashboardCharts />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/alumni-archive" element={<AlumniArchive />} />
                <Route path="/admin-companies" element={<AdminCompanies />} />
                <Route path="/admin-developers" element={<AdminDevelopers />} />
                <Route path="/news-form" element={<AdminNewsForm />} />
                <Route path="/events-form" element={<AdminEventsForm />} />
                <Route path="/photo-upload-form" element={<PhotoUpload />} />
                <Route path="/admin-alumni-faces" element={<AdminAlumniFaceUpload />} />
                <Route path="/email-form" element={<AdminEmailForm />} />
                <Route path="/add-bulk-alumni" element={<BulkAddAlumni />} />
                <Route path="/view-feedback" element={<AdminFeedbackPanel />} /> 
                <Route path="/flagged-posts" element={<FlaggedPosts />} />             
                <Route path="*" element={<NotFound />} />                
              </Route>

              {/*SuperUser Routes */}
              <Route
                element={
                  <ProtectedRoute
                    element={<AdminLayout />}
                    requiredRole="superuser"
                  />
                }
              >
                <Route path="/create-admin" element={<CreateAdmin />} />
              </Route>
            </Routes>
          </section>
        </div>
      </React.Fragment>
      </VisitorCounterProvider>
    </UserProvider>
  );
}

export default App;