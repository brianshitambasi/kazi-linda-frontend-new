#!/bin/bash

echo "Fixing ESLint warnings..."

# Fix About.js
sed -i 's/Container, //g' src/pages/About.js
sed -i 's/ Card, //g' src/pages/About.js
sed -i 's/const { token }/const { user: authUser }/g' src/pages/About.js
sed -i 's/ token, / /g' src/pages/About.js

# Fix Applications.js
sed -i 's/Container, //g' src/pages/Applications.js
sed -i 's/ Card, //g' src/pages/Applications.js
sed -i 's/const { user, token }/const { user }/g' src/pages/Applications.js

# Fix Blacklist.js
sed -i 's/FaUserFriends, //g' src/pages/Blacklist.js
sed -i 's/FaClock, //g' src/pages/Blacklist.js

# Fix Discover.js
sed -i 's/FaUserPlus, //g' src/pages/Discover.js
sed -i 's/FaPlayCircle, //g' src/pages/Discover.js
sed -i 's/FaBookmark, //g' src/pages/Discover.js
sed -i 's/FaCalendarAlt, //g' src/pages/Discover.js
sed -i 's/FaFilter, //g' src/pages/Discover.js
sed -i 's/FaUserClock, //g' src/pages/Discover.js
sed -i 's/ toast, //g' src/pages/Discover.js

# Fix EmbassyDashboard.js
sed -i 's/Container, //g' src/pages/EmbassyDashboard.js
sed -i 's/ Card, //g' src/pages/EmbassyDashboard.js
sed -i 's/ Table, //g' src/pages/EmbassyDashboard.js
sed -i 's/FaBriefcase, //g' src/pages/EmbassyDashboard.js
sed -i 's/FaUserFriends, //g' src/pages/EmbassyDashboard.js

# Fix EmployerDashboard.js
sed -i 's/ Link, //g' src/pages/EmployerDashboard.js
sed -i 's/FaBriefcase, //g' src/pages/EmployerDashboard.js

# Fix JobDetail.js
sed -i 's/Container, //g' src/pages/JobDetail.js
sed -i 's/const { user, token }/const { user }/g' src/pages/JobDetail.js

# Fix Jobs.js
sed -i 's/Container, //g' src/pages/Jobs.js
sed -i 's/ Row, //g' src/pages/Jobs.js
sed -i 's/ Col, //g' src/pages/Jobs.js
sed -i 's/ Card, //g' src/pages/Jobs.js
sed -i 's/ Form, //g' src/pages/Jobs.js
sed -i 's/ InputGroup, //g' src/pages/Jobs.js
sed -i 's/FaBuilding, //g' src/pages/Jobs.js
sed -i 's/FaFilter, //g' src/pages/Jobs.js
sed -i 's/const { user, token }/const { user }/g' src/pages/Jobs.js

# Fix Login.js
sed -i 's/ Card, //g' src/pages/Login.js
sed -i 's/Container, //g' src/pages/Login.js
sed -i 's/ Row, //g' src/pages/Login.js
sed -i 's/ Col, //g' src/pages/Login.js
sed -i 's/FaUsers, //g' src/pages/Login.js

# Fix Messages.js
sed -i 's/Container, //g' src/pages/Messages/Messages.js
sed -i 's/ ListGroup, //g' src/pages/Messages/Messages.js
sed -i 's/ Image, //g' src/pages/Messages/Messages.js
sed -i 's/FaVideo, //g' src/pages/Messages/Messages.js
sed -i 's/FaMapMarkerAlt, //g' src/pages/Messages/Messages.js
sed -i 's/FaCircle, //g' src/pages/Messages/Messages.js
sed -i 's/FaArrowLeft, //g' src/pages/Messages/Messages.js

# Fix NewsFeed.js
sed -i 's/FaSpinner, //g' src/pages/NewsFeed.js

# Fix ProfileEdit.js
sed -i 's/FaUserFriends, //g' src/pages/ProfileEdit.js
sed -i 's/FaCamera, //g' src/pages/ProfileEdit.js
sed -i 's/FaTwitter, //g' src/pages/ProfileEdit.js
sed -i 's/FaLinkedin, //g' src/pages/ProfileEdit.js

# Fix VerifyEmployer.js
sed -i 's/ Link, //g' src/pages/VerifyEmployer.js
sed -i 's/Container, //g' src/pages/VerifyEmployer.js
sed -i 's/ Card, //g' src/pages/VerifyEmployer.js
sed -i 's/ Table, //g' src/pages/VerifyEmployer.js
sed -i 's/ Badge, //g' src/pages/VerifyEmployer.js
sed -i 's/FaUsers, //g' src/pages/VerifyEmployer.js
sed -i 's/const { user, token }/const { user }/g' src/pages/VerifyEmployer.js

# Fix WorkerDashboard.js
sed -i 's/ClickableAvatar, //g' src/pages/WorkerDashboard.js

# Fix Admin pages
sed -i 's/ Card, //g' src/pages/Admin/AdminActivityLog.js
sed -i 's/FaBuilding, //g' src/pages/Admin/AdminActivityLog.js
sed -i 's/ toast, //g' src/pages/Admin/AdminActivityLog.js

sed -i 's/FaBan, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/FaUserPlus, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/FaComments, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/FaCalendarAlt, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/FaEye, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/FaThumbsUp, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/FaUserCheck, //g' src/pages/Admin/AdminAnalytics.js
sed -i 's/ toast, //g' src/pages/Admin/AdminAnalytics.js

sed -i 's/ Form, //g' src/pages/Admin/AdminJobs.js
sed -i 's/ Table, //g' src/pages/Admin/AdminJobs.js
sed -i 's/ Card, //g' src/pages/Admin/AdminJobs.js
sed -i 's/FaDownload, //g' src/pages/Admin/AdminJobs.js

sed -i 's/ Table, //g' src/pages/Admin/AdminReports.js
sed -i 's/ Card, //g' src/pages/Admin/AdminReports.js
sed -i 's/FaEnvelope, //g' src/pages/Admin/AdminReports.js

echo "✅ All warnings fixed!"
