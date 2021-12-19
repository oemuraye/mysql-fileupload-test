const express = require("express");
const exphbs = require("express-handlebars"); // updated to 6.0.X
const fileUpload = require("express-fileupload");
const mysql = require("mysql");

const dotenv = require("dotenv");
const Pool = require("mysql/lib/Pool");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(fileUpload());

// Static Files
app.use(express.static("public"));
app.use(express.static("upload"));

const handlebars = exphbs.create({ extname: ".hbs" });
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("db " + connection.state);
});

app.get("", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log("Connected!");

    connection.query('SELECT * FROM user WHERE id = "1"', (err, rows) => {
      // Once done, release connection
      connection.release();
      if (!err) {
        res.render("index", { rows });
      }
    });
  });
});

app.post("/", (req, res) => {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // name of the input is sampleFile
  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + "/upload/" + sampleFile.name;

  // Use mv() to place file on the server || local file
  sampleFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);

    
    app.get("", (req, res) => {
        pool.getConnection((err, connection) => {
            if (err) throw err; // not connected
            console.log("Connected!");
            
            connection.query('UPDATE * FROM user SET profile_image = ? WHERE id = "1"', [sampleFile.name], (err, rows) => {
         
         
            // Once done, release connection
         if (!err) {
           res.redirect("/");
         } else {
           console.log(err);
         }
        })
    });
    // res.send("uploaded");
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
