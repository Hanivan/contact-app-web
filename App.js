const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Setup method-override
app.use(methodOverride("_method"));

// Setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Setup flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Halaman Home
app.get("/", (req, res) => {
  // res.sendFile("./index.html", { root: __dirname });

  const mahasiswa = [
    {
      nama: "Hanivan Rizky Sobari",
      email: "hanivanrizkysobari@gmail.com",
    },
    {
      nama: "Adam Firmansyah",
      email: "adamfirma76@gmail.com",
    },
    {
      nama: "Firdan Firdaus",
      email: "firdan01bogor@gmail.com",
    },
  ];
  res.render("index", {
    nama: "Hanivan",
    title: "Halaman Home",
    layout: "layouts/main",
    mahasiswa,
  });
});

// Halaman About
app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman About",
    layout: "layouts/main",
  });
});

// Halaman Contact
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main",
    contacts,
    msg: req.flash("msg"),
  });
});

// Halaman Tambah data
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Kontak",
    layout: "layouts/main",
  });
});

// Proses Tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama kontak sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomor handphone tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Kontak",
        layout: "layouts/main",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (err, result) => {
        // Kirimkan flash message
        req.flash("msg", "Data Kontak Berhasil Di Tambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

// Hapus data contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   if (!contact) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   }
//   Contact.deleteOne({ _id: contact._id }).then((result) => {
//     req.flash("msg", "Data contact berhasil dihapus!");
//     res.redirect("/contact");
//   });
// });
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  });
});

// Halaman Form Edit Data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layouts/main",
    contact,
  });
});

// Proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });

      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama kontak sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "Nomor handphone tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Kontak",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data Kontak Berhasil Di Ubah!");
        res.redirect("/contact");
      });
    }
  }
);

// Halaman Detail
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    title: "Halaman Detail Contact",
    layout: "layouts/main",
    contact,
  });
});

// Jalankan Express
app.listen(port, () => {
  console.log(`Mongo Contact App | listening on http://localhost:${port}`);
});
