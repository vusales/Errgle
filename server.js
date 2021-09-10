const express = require("express");
const app = express();
const { router, adminBro } = require("./admin/admin");
const path = require("path");
const ExpressHandlebars = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const { connection } = require("./db_Config/models")
const MongoStore = require('connect-mongo');
console.log(connection._connectionString)
app.use("/static", express.static(path.join(__dirname, "public")));

app.use(adminBro.options.rootPath, router);

app.engine(
  ".hbs",
  ExpressHandlebars({
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

app.use(
  session({
    name: "authcid",
    store: MongoStore.create({
      mongoUrl: connection._connectionString ,
      ttl: 1 * 24 * 60 * 60 
    }),
    secret: "og96d>-KUD<G}6~{O,+K89UBWg",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

require("./auth/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/signup", require("./routers/register"));
app.use("/login", require("./routers/login"));
app.use("/collect", require("./routers/collect"));
app.use("/addsite", require("./routers/siteCreation"));
app.use("/keygen", require("./routers/keygen"));
app.use("/dashboard", require("./routers/dashboard"));
// app.use("/ping", require("./routers/ping"));
// app.use("/unique", require("./routers/uniquekey"));
app.use("/main" , require("./routers/main"));
app.use("/" , require("./routers/home"));
app.use("/cdn", require("./cdnServe/cdnService"));
app.use("/documentation" , require("./routers/documentation"));

app.get("/logout", function (req, res) {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
 