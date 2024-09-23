const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
require("./middlewares/passport"); 

const cloudinary = require("cloudinary");

const connectDB = require("./config/db");

const userRouter = require("./routes/user");

const candidateRouter = require("./routes/candidate");

const companyRouter = require("./routes/company");

const jobRouter = require("./routes/job");

const applicationRouter = require("./routes/application");

const notificationRouter = require("./routes/notification");

const categoryRouter = require("./routes/category");

const saveJobRouter = require("./routes/saveJobs")

const skillRouter = require("./routes/skill");

const saveCandidateRouter = require("./routes/saveCandidate")


dotenv.config();

connectDB();

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: false } 
}));

app.set('view engine', 'ejs');

// app.use(passport.initialize());
// app.use(passport.session());

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/candidate", candidateRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/save-job", saveJobRouter);
app.use("/api/v1/save-candidate", saveCandidateRouter);
app.use("/api/v1/skill", skillRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(
    `Server Running On PORT ${process.env.PORT} on ${process.env.NODE_ENV}`
      .bgMagenta.white
  );
});
