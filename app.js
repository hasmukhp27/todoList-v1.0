const express = require('express');
const bodyParser = require('body-parser');
const getDate = require('./date');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

mongoose.set("strictQuery", false);



const personnelItems = [];
const workItems = [];

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const port = 2936;

const currentDay = date.getDate();

const mongoDB = "mongodb://listsAdmin:Listadmin123@127.0.0.1:27017/todoListsDB";

main().catch(err => console.log(err));
async function main() {
    //await mongoose.connect('mongodb://127.0.0.1:27017/test');
    try {
      await mongoose.connect(mongoDB);  //if your database has auth enabled  
    } catch (error) {
      console.log(error);
    }    
}

const itemsSchema = new mongoose.Schema ({
    itemName: {
      type: String,
      required: [true, 'Why no name?']
    },
    itemType: {
        type: String,
        required: [true, 'Classify what type of Item?'],
        enum: ['Personnel','Work']
    },
    status: {
      type: String,
      enum: ['NEW', 'COMPLETE'],
      default: 'NEW'
    },
  });

const Item = mongoose.model("Item",itemsSchema);

 
app.get('/Personnel', (req, res)=> {


    let listKind = req.path;

    console.log("I'm here inside Get For Personnel with path at "+listKind);

    Item.find({},function(err, itemArr){
        if(err){
          console.log(err);
        }else{ 
          //mongoose.connection.close();
            const item1 = Item(
                {
                    itemName: "Buy Grocery",
                    itemType: "Personnel",
                    status: "NEW"
                }
            );
            
            const item2 = Item(
                {
                    itemName: "Cook Food",
                    itemType: "Personnel",
                    status: "NEW"
                }
            );

            const item3 = Item(
                {
                    itemName: "Clean Dishes",
                    itemType: "Personnel",
                    status: "NEW"
                }
            );

            const defaultItemsList = [ item1, item2, item3];

            if (itemArr.length === 0){
                Item.insertMany(defaultItemsList, (err) =>{
                    if(err){
                        console.log(err);
                      }else{ 
                        console.log("Successfully saved the default items to the lists");
                    }
                });
                res.redirect("/Personnel");
            }
            else{
                res.render('list',{dayOfWeek: currentDay, newItems: itemArr, typeOfList: listKind.slice(1,)});
                itemArr.forEach(element => {
                    console.log(element.itemName);
                });
            }           
        }
      });   
  
})

app.get('/Work',(req, res) => {
    let listKind = req.path;
    res.render('list',{dayOfWeek: currentDay, newItems: workItems, typeOfList: listKind.slice(1,)});
})

app.post('/', (req, res) => {
    let newItem = req.body.newItem;
    let typeOfAdd = req.body.addButton;
    let itemToAdd = null;
    if (typeOfAdd === "Personnel") {
        itemToAdd = new Item({
            itemName: newItem,
            itemType: "Personnel",
            status: "NEW"
        })
        
        //personnelItems.push(newItem);
    }
    else{
        itemToAdd = new Item({
            itemName: newItem,
            itemType: "Work",
            status: "NEW"
        })
        //workItems.push(newItem);
    }
    itemToAdd.save();
    console.log("Passed Item is --> "+newItem);
    res.redirect("/"+ typeOfAdd);
})

app.post('/delete', (req, res) => {
    let deleteItemId = req.body.checkboxId;
    Item.deleteOne({_id:deleteItemId},(err)=>{
        if (err){
            console.log(err);
            //mongoose.connection.close();
          }
    });
    console.log("Deleted Item is --> "+deleteItemId);
    res.redirect("/Personnel");
    
})





app.listen(process.env.PORT || port, ()=> {
    console.log(`Hasmukh\'s ToDoLists-V1 Web App listening on port ${port}`);
  })