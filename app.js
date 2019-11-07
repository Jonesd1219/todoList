//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Nrom102:Babathy102@cluster0-gd8wh.mongodb.net/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true })



const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const dusting = new Item({
  name: "Dusting"
})

const sweep = new Item({
  name:"Sweep"

})

const comb = new Item({
  name: "Sweep"
})

const defaultItems = [dusting, sweep, comb]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (err) {
      console.log(err);
    }else {
      if (foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          }else {
            console.log("Good");
          }
        });
        res.redirect("/");
      } else{res.render("list", {listTitle: "Today", newListItems: foundItems});}

    }
  })



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();

    res.redirect("/")
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      }else {
        console.log("Successfully deleted");
      }
    });
      } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName)
      }
    })
  }



})


app.get("/:customListName", function(req, res){
    console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if(!foundList){
          // path to create new list
          console.log(customListName)
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save()
          res.redirect("/" + customListName)
        }else{
          // path to create existing list
          res.render("list", {listTitle: customListName, newListItems: foundList.items})
        }
      }
    })






});

let port = process.env.PORT;
// if (port==null || port == "") {
//   port = 3000;
// }
app.listen(port, function() {
  console.log("Server started on port 3000");
});
