const express = require("express");
const fs = require("fs");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "hello world",
    resave: false,
    saveUninitialized: true,
  })
);

app.route("/").get((req, res) => {
  if (req.session.is_logged_in) res.write(`<h1>hello mr. ${req.session.name}</h1><a href="/logout">logout</a>`);
  else res.sendFile(__dirname + "/public/home/index.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/public/home/index.html");
});

app
  .route("/login")
  .get((req, res) => {
    if (req.session.is_logged_in) res.redirect("/");
    else res.sendFile(__dirname + "/public/login/index.html");
  })
  .post((req, res) => {
    fs.readFile("./data.txt", "utf-8", function (err, data) {
      let login;
      if (data.length === 0) {
        login = [];
      } else {
        login = JSON.parse(data);
      }
      let email = req.body.email;
      let password = req.body.password;
      let check = login.filter((item) => {
        return item.email == email && item.password == password;
      });
      if(check.length!=0)
      {
        req.session.is_logged_in = true;
        req.session.name=check[0].name;
        res.redirect("/");
      }
      else{
        res.write("<h1>Worng password or email</h1><a href='/home'>login</a>");
      }
    });
  });

app
  .route("/signup")
  .get((req, res) => {
    if (req.session.is_logged_in) res.redirect("/");
    else res.sendFile(__dirname + "/public/signup/index.html");
  })
  .post((req, res) => {
    fs.readFile("./data.txt", "utf-8", function (err, data) {
      let login;
      if (data.length === 0) {
        login = [];
      } else {
        login = JSON.parse(data);
      }

      let email = req.body.email;
      let check = login.filter((item) => {
        return item.email == email ;
      });
      if(check.length!=0)
      {
        res.write("<h1>email already exist</h1><a href='/home'>signup</a>");
    }
    else{
        login.push(req.body);
        req.session.is_logged_in = true;
        req.session.name=req.body.name;
        fs.writeFile("./data.txt", JSON.stringify(login), function (err) {
        });
        res.redirect("/");
      }

    });
  });

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
app.listen(3000, () => {
  console.log("server starts");
});
