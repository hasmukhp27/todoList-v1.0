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
        required: [true, 'Classify what type of Item?']
    },
    status: {
      type: String,
      enum: ['NEW', 'COMPLETE'],
      default: 'NEW'
    },
  });

const listsSchema = new mongoose.Schema ({
    name: {
        type: String
    },
    items: {
        type: [itemsSchema]
    }
});

const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List", listsSchema);

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
 
/* app.get('/Personnel', (req, res)=> {


    let listKind = req.path;

    console.log("I'm here inside Get For Personnel with path at "+listKind);

    Item.find({},function(err, itemArr){
        if(err){
          console.log(err);
        }else{ 
          //mongoose.connection.close();
            

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
  
}) */

app.get('/:customListName',(req, res) => {
    let listKind = req.params.customListName;
    //console.log(listKind);

    List.findOne({name: listKind}, (err, foundList)=>{
        if(!err){
            if( foundList === null){
                // create a new list

                const newList = new List({
                    name: listKind,
                    items: defaultItemsList
                });
            
                newList.save();
                res.redirect("/"+listKind);
            }
            else{

                // show the existing list
                //console.log(listKind+" list already exists!")
                res.render('list',{dayOfWeek: currentDay, newItems: foundList.items, typeOfList: foundList.name});
            }
            
        }else{
            console.log("Error received => "+err);   
        }
    });
    
    


    //res.render('list',{dayOfWeek: currentDay, newItems: workItems, typeOfList: listKind.slice(1,)});
})

app.post('/', (req, res) => {
    let newListItem = req.body.newItem;
    let listType = req.body.addButton;
    
    const item = Item(
        {
            itemName: newListItem,
            itemType: listType,
            status: "NEW"
        }
    );


    List.findOne({name: listType}, (err, foundList) =>{
        foundList.items.push(item);
        foundList.save();
    })
        
    console.log("Passed Item is --> "+item);
    res.redirect("/"+ listType);
})

app.post('/delete', (req, res) => {
    let deleteItemId = req.body.checkboxId;
    List.deleteOne({_id:deleteItemId},(err)=>{
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