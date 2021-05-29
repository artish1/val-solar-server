const express = require("express");
const hubspot = require("@hubspot/api-client");
const cors = require("cors");
const { removeEmpty } = require("./util");

if (process.env.NODE_ENV !== "production") require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 3000;
const hsClient = new hubspot.Client({ apiKey: process.env.HUBSPOT_API_KEY });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(201).json({ msg: "Hey" });
});

app.post("/submit", (req, res) => {
  const {
    firstname,
    lastname,
    email,
    property_type,
    monthly_electric_bill,
    sunlight_amount,
    credit_score,
    address,
    phone,
  } = req.body;
  if (!firstname || !lastname || !email) {
    res.status(401).json({
      msg: "Request body must contain fields 'firstname', 'lastname' and 'email' as a minimum",
    });
    return;
  }

  let contactObj = removeEmpty({
    firstname,
    lastname,
    email,
    property_type,
    monthly_electric_bill,
    sunlight_amount,
    credit_score,
    address,
    phone,
  });

  hsClient.crm.contacts.basicApi
    .create({ properties: contactObj })
    .then(() =>
      res.status(201).json({ message: "Contact created successfully" })
    )
    .catch((err) => {
      if (err.response.body) {
        const { category } = err.response.body;
        if (category == "CONFLICT")
          res
            .status(400)
            .json({ msg: "You have already submitted in our records" });
        else {
          console.log("Error making contact object: ", err.response.body);

          res.status(500).json({
            msg: "There was an error making the contact object, check the server logs",
          });
        }
      } else {
        console.log("Error making contact object: ", err.response.body);

        res.status(500).json({
          msg: "There was an error making the contact object, check the server logs",
        });
      }
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
