const express = require('express');
const bodyParser = require('body-parser');
const getDate = require('./date');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

require("dotenv").config();
const srvURL = process.env.N1_URL;
const dbUser = process.env.N1_KEY;
const dbPasswd = process.env.N1_SECRET;
const dbName = process.env.N1_DB;


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

// Below is the mongo DB url strings
//mongo "mongodb+srv://cluster-hp-01.fr9grbr.mongodb.net/todoListsDB" --username mongoadmin

//const mongoDB = "mongodb://"+dbUser+":"+dbPasswd+"@"+srvURL+"/"+dbName;
const mongoDB = 'mongodb+srv://'+dbUser+':'+dbPasswd+'@'+srvURL+'/'+dbName+'?retryWrites=true&w=majority';

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
    name: {
      type: String,
      required: [true, 'Why no name?']
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
        name: "Sample New Item 1",
        status: "NEW"
    }
);

const item2 = Item(
    {
        name: "Sample New Item 2",
        status: "NEW"
    }
);

const item3 = Item(
    {
        name: "Sample New Item 3",
        status: "NEW"
    }
);

const defaultItemsList = [ item1, item2, item3];
 
app.get('/', (req, res)=> {


    //let listKind = req.path;

    console.log("I'm here inside Get For Default path");

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
                res.redirect("/");
            }
            else{
                res.render('list',{dayOfWeek: currentDay, newItems: itemArr, typeOfList: "Default" });
                itemArr.forEach(element => {
                    console.log(element.name);
                });
            }           
        }
      });   
  
})

app.get('/:customListName',(req, res) => {
    let listKind = _.capitalize(req.params.customListName);
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
            name: newListItem,
            status: "NEW"
        }
    );
    console.log("Passed Item is --> "+item);

    if (listType === "Default"){
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({name: listType}, (err, foundList) =>{
            foundList.items.push(item);
            foundList.save();
        });
        res.redirect("/"+ listType);
    }        
        
})

app.post('/delete', (req, res) => {
    let deleteItemId = req.body.checkboxId;
    let listType = req.body.listName;


    if(listType === "Default"){
        Item.deleteOne({_id:deleteItemId},(err)=>{
            if (err){
                console.log(err);
                //mongoose.connection.close();
            }
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({ name: listType}, {$pull : { items : {_id : deleteItemId }}}, (err, foundList)=>{
            if(!err){
                console.log("Successfullly found and removed through findOneAndUpdate ==> ");
            }
        });
        res.redirect("/"+ listType);
    }        
    console.log("Deleted Item is --> "+deleteItemId);
})





app.listen(process.env.PORT || port, ()=> {
    console.log(`Hasmukh\'s ToDoLists-V1 Web App listening on port ${port}`);
  })