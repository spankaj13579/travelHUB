const express = require("express");
const session = require("express-session");
const fs = require("fs");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' })
const app = express();

// const appRoute = require("./public/routes/route.js");

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD } = require("./public/env");
const { machine } = require("os");

const port = 4000;

// app.use("/api", appRoute);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(
  session({
    secret: "hello world",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  if (req.session.is_logged_in && req.session.role !='admin')
  {
    // res.render(__dirname + "/public/home/dashboard.ejs", {
    //   page: 5,
    //   name: req.session.name,
    // });
    res.render(__dirname + "/public/home/index.ejs", { page: "5",  name: req.session.name});
  }
  else 
  res.render(__dirname + "/public/home/index.ejs", { page: "0" });
});

app.get("/dashboard", (req, res) => {
  if (req.session.is_logged_in && req.session.role !='admin')
  {
  res.render(__dirname + "/public/home/dashboard.ejs", {
    page: 5,
    name: req.session.name,
  });
}
else
{
  res.redirect('/');
}
});

app
  .route("/signup")
  .get((req, res) => {
    if (req.session.is_logged_in && req.session.role !='admin') res.redirect("/");
    else
      res.render(__dirname + "/public/home/signup.ejs", { page: "3", err: 0 });
  })
  .post((req, res) => {
    fs.readFile("./data.txt", "utf-8", function (err, data) {
      let login;
      if (data.length === 0) {
        login = [];
      } else {
        login = JSON.parse(data);
      }
      if (!req.body.email || !req.body.password) {
        res.status("400");
        res.send("Invalid details!");
        return;
      }
      if (req.body.email.trim() === "" || req.body.password.trim() === "") {
        res.status("400");
        res.render(__dirname + "/public/home/signup.ejs", {
          page: "3",
          err: 1,
        });
        return;
      }
      let email = req.body.email;
      let check = login.filter((item) => {
        return item.email == email && item.varified == true;
      });
      if (check.length != 0) {
        res.render(__dirname + "/public/home/signup.ejs", {
          page: "3",
          err: 2,
        });
      } else {
        var body = req.body;
        var id = Date.now();
        body.key = id;
        body.prodycts=[];
        body.varified = false;
        body.role= 'user';
        login.push(body);
        req.session.is_logged_in = false;
        req.session.name = req.body.email;
        
        fs.writeFile("./data.txt", JSON.stringify(login), function (err) {});
        // res.render(__dirname + "/public/home/dashboard.ejs", {
        //   page: 5,
        //   name: req.session.name,
        // });
        res.send("<h5>Successfully changed </h5> <br> <a href='/login'>Login</a>");
        // mail
        {
          let userEmail = req.body.email;

          let config = {
            service: "gmail",
            auth: {
              user: EMAIL,
              pass: PASSWORD,
            },
          };

          let transporter = nodemailer.createTransport(config);

          let MailGenerator = new Mailgen({
            theme: "default",
            product: {
              name: "Travel HUB",
              link: "https://mailgen.js/",
            },
          });

          let response = {
            body: {
              name: "Dude",
              intro: "want to try Beaches 🏖️ and food 🐓 ",
              action: {
                instructions: "Thailand needs you, but first click here:",
                button: {
                  color: "#EA8F1C", // Optional action button color
                  // 💋
                  text: "Confirm your account ",
                  link: `http://127.0.0.1:4000/verify/${id}`,
                },
              },
              // outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
              outro: "Enjoy Travelling with us ",
            },
          };

          let mail = MailGenerator.generate(response);

          let message = {
            from: EMAIL,
            to: userEmail,
            subject: "Get amazing deals",
            html: mail,
          };

          transporter.sendMail(message);

          // res.status(201).json("getBill Successfully...!");
        }
        // main
      }
    });
  });

app.route("/verify/:verifiedId").get((req, res) => {
  fs.readFile("./data.txt", "utf-8", function (err, data) {
    let login;
    if (data.length == 0) {
      login = [];
    } else {
      login = JSON.parse(data);
    }

    const verifiedId = req.params.verifiedId;
    console.log(verifiedId);
    let i = login.findIndex(function (item) {
      return item.key == verifiedId;
    });
    if (i >= 0) {
      console.log(verifiedId + " * ", login[i].key);
      login[i].varified = true;
      fs.writeFile("./data.txt", JSON.stringify(login), function (err) {});
      // console.log(i+" * ",login[i].key,  verifiedId);
      res.send("success");
    }
  });
});

app
  .route("/login")
  .get((req, res) => {
    if (req.session.is_logged_in && req.session.role !='admin')
      res.render(__dirname + "/public/home/dashboard.ejs", {
        page: 5,
        name: req.session.name,
      });
    else res.render(__dirname + "/public/home/login.ejs", { page: "1" });
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
        return (
          item.email == email &&
          item.password == password &&
          item.varified == true
        );
      });
      if (check.length != 0) {
        req.session.is_logged_in = true;
        req.session.name = check[0].email;
        req.session.role= check[0].role;
        if(check[0].role=='admin')
        {
          res.render(__dirname+'/public/home/admin.ejs');
          return;
        }
        res.render(__dirname + "/public/home/dashboard.ejs", {
          page: 5,
          name: req.session.name,
        });
      } else {
        res.write(
          "<h1>Either Worng password or wrong email or <br>confirm that email is verified</h1><a href='/login'>login</a>"
        );
        res.end();
      }
    });
  });

// get data

app.get("/getdata", (req, res) => {
  var iterate = Number(req.query.co);

  fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
    let records;
    let recor = [];

    if (data.length == 0) {
      records = [];
    } else {
      records = JSON.parse(data);
    }
    for (var i = iterate - 5; i < iterate; i++) {
      if(records[i])
      recor.push(records[i]);
    }
    res.json(recor);
  });
});

// get data ends

// submit form
app.get("/forgetPassword", (req, res) => {
  res.render(__dirname + "/public/home/forgetPassword.ejs", {
    page: 0,
    err: "",
  });
});
app.post("/forgetPassword", (req, res) => {
  fs.readFile("./data.txt", "utf-8", function (err, data) {
    let login;
    if (data.length === 0) {
      login = [];
    } else {
      login = JSON.parse(data);
    }
    let email = req.body.email;
    let check = login.filter((item) => {
      return item.email == email && item.varified == true;
    });

    // mail
    {
      let i = login.findIndex(function (item) {
        return item.email == req.body.email;
      });

      if (i >= 0) {
        if (login[i].varified == true) {
          let id = login[i].key;
          console.log(login[i].key);
          // console.log(key, "  ** ", item.email, "** ", id);
          let userEmail = req.body.email;

          let config = {
            service: "gmail",
            auth: {
              user: EMAIL,
              pass: PASSWORD,
            },
          };

          let transporter = nodemailer.createTransport(config);

          let MailGenerator = new Mailgen({
            theme: "default",
            product: {
              name: "Travel HUB",
              link: "https://mailgen.js/",
            },
          });

          let response = {
            body: {
              name: "Dude",
              intro: "want to Reset password",
              action: {
                instructions: "No worries we are here for you",
                button: {
                  color: "#EA8F1C", // Optional action button color
                  // 💋
                  text: "Reset password ",
                  link: `http://127.0.0.1:4000/reset/${id}`,
                },
              },
              outro: "Enjoy Travelling with us ",
            },
          };

          let mail = MailGenerator.generate(response);

          let message = {
            from: EMAIL,
            to: userEmail,
            subject: "Reset Travel HUB",
            html: mail,
          };

          transporter.sendMail(message);
          // res.status(201).json("getBill Successfully...!");
          // main
          res.render(__dirname + "/public/home/forgetPassword.ejs", {
            page: 0,
            err: 99,
          });
        } else {
          res.render(__dirname + "/public/home/forgetPassword.ejs", {
            page: 0,
            err: 2,
          });
        }
      } else {
        res.render(__dirname + "/public/home/forgetPassword.ejs", {
          page: 0,
          err: 1,
        });
      }
    }
  });
});

// forget varification
app.get("/reset", (req, res)=>
{
  if (!req.session.is_logged_in)
  {
    res.redirect("/");
  }
});
app
  .route("/reset/:verifiedId")
  .get((req, res) => {
    fs.readFile("./data.txt", "utf-8", function (err, data) {
      let login;
      if (data.length == 0) {
        login = [];
      } else {
        login = JSON.parse(data);
      }

      const verifiedId = req.params.verifiedId;
      console.log(verifiedId);
      let i = login.findIndex(function (item) {
        return item.key == verifiedId;
      });
      if (i >= 0) {
        res.render(__dirname + "/public/home/reset.ejs", {
          err: ""
        });
        // console.log(verifiedId+" * ", login[i].key)
        // login[i].password= req.body.newPassword;
        fs.writeFile("./data.txt", JSON.stringify(login), function (err) {});
        // console.log(i+" * ",login[i].key,  verifiedId);
        // res.render(__dirname+"/public/home/reset.ejs");
      }
    });
  })
  .post((req, res) => {
    fs.readFile("./data.txt", "utf-8", function (err, data) {
      let login;
      if (data.length == 0) {
        login = [];
      } else {
        login = JSON.parse(data);
      }
      const verifiedId = req.params.verifiedId;
      console.log("**" + verifiedId);
      let i = login.findIndex(function (item) {
        return item.key == verifiedId;
      });

      if (!req.body.newPassword) {
        res.status("400");
        res.render(__dirname + "/public/home/reset.ejs", {
          err: 1
        });
        return;
      }
      if (req.body.newPassword.trim() === "") {
        res.status("400");
        res.render(__dirname + "/public/home/reset.ejs", {
          err: 2
        });
        return;
      }


      login[i].password = req.body.newPassword;
      fs.writeFile("./data.txt", JSON.stringify(login), function (err) {});
      // res.render(__dirname + "/public/home/index.ejs", { page: "0" });
      res.redirect("/");
      return;
    });
  });

// forget varification ends

// forget password

app.get("/forgetPassword", (req, res) => {
  res.render(__dirname + "/public/home/forgetPassword.ejs", {
    page: 0,
    err: "",
  });
});

// forget password ends

// change password starts

app.get('/changePassword', (req, res)=>
{
  if (req.session.is_logged_in && req.session.role !='admin')
  {
    res.render(__dirname + "/public/home/changePassword.ejs", { err: 0})
  }
  else{
    res.redirect("/");
  }
});

// change password ends
app.post('/newPassword', (req, res)=>
{
  fs.readFile("./data.txt", "utf-8", function (err, data) {
    let login;
        if (data.length == 0) {
          login = [];
        } else {
          login = JSON.parse(data);
        }
    let nam= req.session.name;
    // console.log(req.session.name);
    let i = login.findIndex(function (item) {
      return item.email == nam;
    });
    // console.log(login[i].password)

    if (!req.body.newPassword) {
      res.status("400");
      res.send("Invalid details!");
      return;
    }
    if (req.body.newPassword.trim() === "") {
      res.status("400");
      res.render(__dirname + "/public/home/changePassword.ejs", {err: 1 });
      return;
    }



    login[i].password = req.body.newPassword;
    console.log(login);
    fs.writeFile("./data.txt", JSON.stringify(login), function (err) {});
    res.send("<h5>Successfully changed </h5> <br> <a href='/login'>Login</a>");
  });
});


// cart starts

  app.get('/cart', (req, res)=>
  {
    var cal = Number(req.query.cal);
    if(cal)
    {
    if(req.session.is_logged_in && req.session.role !='admin')
    {
      
      // data of user

      fs.readFile("./data.txt", "utf-8", function (err, data) {
        let login;
        if (data.length === 0) {
          login = [];
        } else {
          login = JSON.parse(data);
        }
        let LoggedPerson= req.session.name;
        let j;
        j = login.findIndex(function (person) {
          return person.email == LoggedPerson;
        });
        
        // data of user ends
        
        fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
          let records;
          let recor = [];
          let count=0;
          if (data.length == 0) {
            records = [];
          } else {
            records = JSON.parse(data);
          }
          
          (login[j].prodycts).forEach(function(item)
            {
              for(let i=0; i<records.length; i++)
              {
                if(item.prodId == records[i].id)
                {
                  let obj= {
                    productDetail: records[i],
                    productQty: item.qty,
                    prodId: item.id
                  }
                  recor.push(obj);
                }
              }
              
            })
            // console.log(recor);
            // res.send(recor);
          
          res.json(recor);
          res.end();
          return;
        });
      });

      // matching with product 
      
      // machine with product ends
      
    }
    
  }
    else
    res.redirect("/getCart");

  });

  app.get('/getCart', (req, res)=>
  {
    if(!req.session.is_logged_in && req.session.role !='admin')
    {
      res.redirect("/login");
      return;
    }
    res.render(__dirname+"/public/home/cart.ejs", { page: "5",  name: req.session.name});
  });
// cart ends

// book flight by clicking

app.get("/book", (req, res) => {
  if(req.session.is_logged_in && req.session.role !='admin')
  {
      var id =req.query.ide;

        // data of user
        console.log(id);

        fs.readFile("./data.txt", "utf-8", function (err, data) {
          let login;
          if (data.length === 0) {
            login = [];
          } else {
            login = JSON.parse(data);
          }
          let LoggedPerson= req.session.name;
          let j;
          j = login.findIndex(function (person) {
            return person.email == LoggedPerson;
          });
          fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
          let records;
          let recor = [];
          let count=0;
          if (data.length == 0) {
            records = [];
          } else {
            records = JSON.parse(data);
          }
          // let ide = login.findIndex((item)=>
          // {
          //   return item.email == req.session.name;
          // });
          // var qty= records[ide].left;
          // console.log(login[j].prodycts.length);
          let counter=0;
          for(var i=0; i< login[j].prodycts.length; i++)
          {
            if(login[j].prodycts[i].prodId== id && login[j].prodycts[i].qty>=1)
            {
          let ide = records.findIndex((item)=>
          {
            return item.id == id;
          });
          console.log(Number(records[ide].left), Number(login[j].prodycts[i].qty))
          if(Number(records[ide].left) > Number(login[j].prodycts[i].qty)){
              login[j].prodycts[i].qty++;
          }
              counter++;
          // }
            }
          }
          
          if(counter<1)
          {
            let obj= {
              prodId: id,
              qty: 1
            }
            login[j].prodycts.push(obj);
          }
          
          fs.writeFile("./data.txt", JSON.stringify(login), function (err) 
          {
            res.end();
          });
          
        });
      });
    // data of user ends
      }
        res.redirect("/login");
        res.end();
        return;
  });

// book flight by clicking ends

// delete item from cart starts
app.get('/deletefromcart', (req, res)=>
{
  if(!req.session.is_logged_in)
  {
    res.redirect('/');
    res.end();
    return;
  }
  let num= Number(req.query.num);
  fs.readFile("./data.txt", "utf-8", function (err, data) {
    let login;
    if (data.length === 0) {
      login = [];
    } else {
      login = JSON.parse(data);
    }

    let i = login.findIndex((item)=>
    {
      return item.email == req.session.name;
    });
    console.log(login[i].prodycts[num]);
    login[i].prodycts.splice(num,1);
    fs.writeFile("./data.txt", JSON.stringify(login), function (err) 
          {
            res.end();
          });
  });

});

// delete item from cart ends


// increase item count from cart starts
app.get('/increaseltnumberCart', (req, res)=>
{
  if(!req.session.is_logged_in)
  {
    res.redirect('/');
    res.end();
    return;
  }
  let num= Number(req.query.num);
  fs.readFile("./data.txt", "utf-8", function (err, data) {
    let login;
    if (data.length === 0) {
      login = [];
    } else {
      login = JSON.parse(data);
    }

    // reading item file

    fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
      let records;

      if (data.length == 0) {
        records = [];
      } else {
        records = JSON.parse(data);
      }
    // reading item file ends



    let i = login.findIndex((item)=>
    {
      return item.email == req.session.name;
    });
    var productid= login[i].prodycts[num].prodId;

    // iterating through item.txt
    let j = records.findIndex((item)=>
    {
      return item.id == productid;
    });
    // iteration throough item.txt ends

    console.log(j);
    if(Number(login[i].prodycts[num].qty) < records[j].left)
    {
    login[i].prodycts[num].qty=  (Number(login[i].prodycts[num].qty))+1;
    }
    fs.writeFile("./data.txt", JSON.stringify(login), function (err) 
          {
            res.json({left: records[j].left, price: records[j].price});
            res.end();
          });
  });
  });
});

// increase item count from cart ends


// decrease item count from cart starts
app.get('/decreaseltnumberCart', (req, res)=>
{
  if(!req.session.is_logged_in)
  {
    res.redirect('/');
    res.end();
    return;
  }
  let num= Number(req.query.num);
  fs.readFile("./data.txt", "utf-8", function (err, data) {
    let login;
    if (data.length === 0) {
      login = [];
    } else {
      login = JSON.parse(data);
    }

    let i = login.findIndex((item)=>
    {
      return item.email == req.session.name;
    });
    

    // reading item file

    fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
      let records;

      if (data.length == 0) {
        records = [];
      } else {
        records = JSON.parse(data);
      }
    // reading item file ends

    // iterating through item.txt
    var productid= login[i].prodycts[num].prodId;
    let j = records.findIndex((item)=>
    {
      return item.id == productid;
    });
    // iteration throough item.txt ends

    // let qty=;
    if((Number(login[i].prodycts[num].qty))>1)
    {
    login[i].prodycts[num].qty=  (Number(login[i].prodycts[num].qty))-1;
    }
    fs.writeFile("./data.txt", JSON.stringify(login), function (err) 
          {
            res.json({price: records[j].price});
            res.end();
          });
  });
  });
});

// decrease item count from cart ends


// adding data as admin
app.get('/admin', (req,res)=>
{
  if(req.session.is_logged_in && req.session.role =='admin')
  {
  res.render(__dirname+'/public/home/admin.ejs');
  res.end();
  }
  else{
    res.redirect("/");
    res.end();
    return;
  }
});

app.post('/addAdmin', upload.single('img'),(req, res)=>
{
  
  fs.readFile("./uploads/item.txt", "utf-8", function (err, data) {
    if (err) {
      res.render(__dirname+"/public/home/admin.ejs");
      return;
    } else {
      if (
        req.body.img == "" ||
        req.body.disc.trim() == "" ||
        req.body.left.trim() == "" ||
        req.body.price.trim() == "" ||
        req.body.name.trim() == ""
      ) {
        res.render(__dirname+"/public/home/admin.ejs");
        return;
      }
      let item;
      if (data.length == 0) {
        item = [];
      } else {
        item = JSON.parse(data);
      }
      let obj= req.body;
      obj.id = 'img'+Date.now();
      obj.img = req.file.filename;
      item.push(obj);
      fs.writeFile("./uploads/item.txt", JSON.stringify(item), function (err) {
        if (err) {
          res.render(__dirname+"/public/home/admin.ejs");
          res.end();
        }
      });
      console.log("******************");
      res.render(__dirname+"/public/home/admin.ejs");
      res.end();
    }
  });
});

// adding data to admin ends

// view data admin 

app.get('/viewDataAdmin',(req,res)=>
{
  if(req.session.is_logged_in && req.session.role =='admin')
  {
  res.render(__dirname+"/public/home/viewDataAdmin.ejs")
  res.end();
  return;
  }
    res.redirect("/");
    res.end();
    return;
});

// view data admin ends

app.get("/LoadingAdminData", (req, res) => {
  var iterate = Number(req.query.co);
  fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
    let records;
    let recor = [];

    if (data.length == 0) {
      records = [];
    } else {
      records = JSON.parse(data);
    }
    for (var i = iterate - 5; i < iterate; i++) {
      if(records[i])
      recor.push(records[i]);
    }
    res.json(recor);
  });
});

// delete item from Admin cart starts
app.get('/deletefromAdmincart', (req, res)=>
{
  
  let num= Number(req.query.num);
  fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
    let records;
    if (data.length == 0) {
      records = [];
    } else {
      records = JSON.parse(data);
    }
    console.log(records[num]);
    records.splice(num, 1);
    fs.writeFile("./uploads/item.txt", JSON.stringify(records), function (err) 
          {
            res.end();
          });
  });

});

// delete item from Admin cart ends

// edit item from Admin cart starts
app.get('/editfromAdmincart', (req, res)=>
{
  if(req.session.is_logged_in && req.session.role =='admin')
  {

  
  let num= Number(req.query.num);
  fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
    let records;
    let recor= {};
    if (data.length == 0) {
      records = [];
    } else {
      records = JSON.parse(data);
    }
    recor.name=records[num].name;
    recor.disc= records[num].disc;
    recor.left= records[num].left;
    recor.price= records[num].price;
    recor.id= records[num].id;
    fs.writeFile("./uploads/item.txt", JSON.stringify(records), function (err) 
          {
            res.json(recor);
            res.end();
          });
  });
  }
  else
  {
    res.redirect("/login");
    res.end();
    return;
  }
});

// update item from Admin cart ends

app.get('/updatefromAdmincart', (req, res)=>
{
  if(req.session.is_logged_in && req.session.role =='admin')
  {
  let obj= JSON.parse(req.query.obj);
  fs.readFile(__dirname + "/uploads/item.txt", "utf-8", function (err, data) {
    let records;
    if (data.length == 0) {
      records = [];
    } else {
      records = JSON.parse(data);
    }
    let i = records.findIndex(function (item) {
      return item.id == obj.id;
    });
    records[i].name= obj.name;
    records[i].disc= obj.disc;
    records[i].left= obj.left;
    records[i].price= obj.price;
    fs.writeFile("./uploads/item.txt", JSON.stringify(records), function (err) 
          {
            res.json(records[i].img);
            res.end();
          });
  });
  }
  else{
    res.redirect("/login");
    res.end();
    return;
  }
});

// update item from Admin cart ends



// logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect('/');
  return;
  // res.render(__dirname + "/public/home/index.ejs", { page: "0" });
});

// if nothing match
app.get("*",(req, res)=>
{
  res.render(__dirname+"/public/home/404.ejs");
})
// nothing match ends

app.listen(port, () => {
  console.log("server starts");
});
