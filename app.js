//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = []; */

/* mongoose.connect(
  "mongodb://127.0.0.1:27017/todolistDB"
); */ /* Ovde se definiše koja DB */

const passMdb = process.env.PASS; 
const putanja = "mongodb+srv://admin-miroslav:"+passMdb+"@cluster0.audngwq.mongodb.net/todolistDB"
mongoose.connect(
  putanja
);



const itemShema = new mongoose.Schema({
  name: {
    type: String,
    /* required: true, */
  },
});

const listSchema = {
  name: String,
  items: [itemShema],
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model(
  "Item",
  itemShema
); /* Ovde se kreira tabela, a mongoose automatski prebacuje u množinu */

const prva = new Item({
  name: "Buy Food",
});

const druga = new Item({
  name: "Cook Food",
});

const treca = new Item({
  name: "Eat Food",
});
const deafultsItems = [prva, druga, treca];

const bazaItems = [];
const day = date.getDate();
app.get("/", function (req, res) {
  /* bilo ovako pre modifiakcije */

 
  Item.find({}, function (err, items) {
    if (err) {
      console.log(err + "izbaci gresku");
    } else {
      /* mongoose.connection.close(); */
      /* pravila mi problem , pogledaj https://www.mongodb.com/community/forums/t/mongoerror-cannot-use-a-session-that-has-ended/8832 */
      const gledaj = [];

      if (items.length === 0) {
        Item.insertMany(deafultsItems, function (err) {
          if (err) {
            console.log(err + " greska insertMany");
          } else {
            console.log("Uspešno dodate vrednosti");
          }
          items = deafultsItems;
        });
      }

      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

if (listName === day) {
  item.save();
  res.redirect("/");
} else {
  List.findOne({ name: listName },  function (err, foundList) {
    foundList.items.push(item);
    foundList.save()
    res.redirect("/" + listName);
  } );
    
  }
  
}

 

  /*  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  } */
);

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listNamea = req.body.listName;

if (listNamea === day) {
  Item.findByIdAndRemove(checkedItemId, function (err) {
    if (!err) {
     console.log("Uspešno pbrisana iz Today liste") ;
     res.redirect("/");
    }
  })
  
} else {
  List.findOneAndUpdate({name :listNamea}, {$pull: {items:{_id:checkedItemId}}}, function (err, foundList) {
    if (!err) {
      console.log(listNamea)
      res.redirect("/"+listNamea);
      
    }
  });
}


  /* Item.findByIdAndDelete(checkedItemId, function (err) {
    if (err) {
      console.log(err + " greska insertMany");
    } else {
      console.log("Obrisan zapis");
    }
  });
  res.redirect("/"); */
});

app.get("/:petar", function (req, res) {
  var customListName = req.params.petar;
  customListName = _.capitalize(customListName);
  if (customListName == "favicon.ico") return;
  List.findOne({ name: customListName }, function (err, resultss) {
    
    if (!err) {
      if (!resultss) {
        const list = new List({
          name:customListName,
          items: deafultsItems
        })
        list.save(function(){
          res.redirect("/"+customListName);
          });
        
      } else {
        res.render("list", { listTitle: resultss.name, newListItems: resultss.items } )
      }    
    }
  });
});

/* app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
}); */

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

/* iz list.ejs ,
<% for (let i=0; i<newListItems.length; i++) { %>
  <div class="item">
    <input type="checkbox">
    <p><%=  newListItems[i]  %></p>
  </div>
  <% } %> */
