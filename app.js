const express = require('express');
const bodyParser = require('body-parser');
const getDate = require('./date');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

require("dotenv").config();

//Setting up MongoDB COnnections and it's values through process envirnment variables. 
const srvURL = process.env.N1_URL || "127.0.0.1:27017";
const dbUser = process.env.N1_KEY || "listsAdmin";
const dbPasswd = process.env.N1_SECRET || "Listadmin123";
const dbName = process.env.N1_DB || "todoListsDB";


/* const srvURL = process.env.N1_URL;
const dbUser = process.env.N1_KEY;
const dbPasswd = process.env.N1_SECRET;
const dbName = process.env.N1_DB;  */


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

const mongoDB = "mongodb://"+dbUser+":"+dbPasswd+"@"+srvURL+"/"+dbName;
//const mongoDB = 'mongodb+srv://'+dbUser+':'+dbPasswd+'@'+srvURL+'/'+dbName+'?retryWrites=true&w=majority';

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
      maxLength: 55,
      required: [true, 'Why no name?']
    },
    status: {
      type: String,
      enum: ['NEW', 'COMPLETE'],
      default: 'NEW'
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
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
        status: "NEW",
        createdOn: new Date()
    }
);

const defaultItemsList = [ item1 ];
 
app.get('/', (req, res)=> {


    //let listKind = req.path;

    console.log("I'm here inside Get For Default path");

    Item.find({},null,{sort: {status: -1}},function(err, itemArr){
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
    let typeOfItemsView = "all";
    //console.log(listKind);

    List.findOne({name: listKind},null, (err, foundList)=>{
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
                let sortedItems = foundList.items.sort((a,b)=>{
                    if (a.status === b.status) {
                        return a.createdOn > b.createdOnreturn ? 1 : -1;
                    }else{
                        return a.status > b.status ? -1 : 1;
                    }
                    
                });
                //console.log("Sorted Items -->"+sortedItems);

                //console.log("Items --> "+foundList+" with view type "+typeOfItemsView);
                res.render('list',{dayOfWeek: currentDay, newItems: sortedItems, typeOfList: foundList.name, view: typeOfItemsView});
            
            }
            

        }else{
            console.log("Error received => "+err);   
        }
    });
    
    


    //res.render('list',{dayOfWeek: currentDay, newItems: workItems, typeOfList: listKind.slice(1,)});
})


app.get('/:customListName/activeTasks',(req, res) => {
    let listKind = _.capitalize(req.params.customListName);
    let typeOfItemsView = "new";
    //console.log(listKind);

    List.findOne({name: listKind},null, (err, foundList)=>{
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
                let sortedItems = foundList.items.sort((a,b)=>{if (a.createdOn > b.createdOn) {return -1;}});
                //console.log("Sorted Items -->"+sortedItems);

                //console.log("Items --> "+foundList+" with view type "+typeOfItemsView);
                res.render('list',{dayOfWeek: currentDay, newItems: sortedItems.filter(o =>{return o.status == "NEW"}), typeOfList: foundList.name, view: typeOfItemsView});
            
            }
            

        }else{
            console.log("Error received => "+err);   
        }
    });
    
    


    //res.render('list',{dayOfWeek: currentDay, newItems: workItems, typeOfList: listKind.slice(1,)});
})

app.get('/:customListName/completeTasks',(req, res) => {
    let listKind = _.capitalize(req.params.customListName);
    let typeOfItemsView = "complete";
    //console.log(listKind);

    List.findOne({name: listKind},null, (err, foundList)=>{
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
                let sortedItems = foundList.items.sort((a,b)=>{if (a.createdOn > b.createdOn) {return -1;}});
                //console.log("Sorted Items -->"+sortedItems);

                //console.log("Items --> "+foundList+" with view type "+typeOfItemsView);
                res.render('list',{dayOfWeek: currentDay, newItems: sortedItems.filter(o =>{return o.status == "COMPLETE"}), typeOfList: foundList.name, view: typeOfItemsView});
            
            }
            

        }else{
            console.log("Error received => "+err);   
        }
    });
    
    


    //res.render('list',{dayOfWeek: currentDay, newItems: workItems, typeOfList: listKind.slice(1,)});
})

app.post('/', (req, res) => {
    let newListItem = req.body.newItem;
    let listType = req.body.listName;
    let fromView = req.body.fromView;
    
    const item = Item(
        {
            name: newListItem,
            status: "NEW",
            createdOn: new Date()
        }
    );
    console.log("Passed Item is --> "+item);
    console.log("Passed listType is --> "+listType);

    if (listType === "Default"){
        item.save();
        if (fromView === "all"){
            res.redirect("/");
        }
        else if (fromView === "new"){
            res.redirect("/activeTasks");
        }
        else{
            res.redirect("/completeTasks");
        }
    }
    else {
        List.findOne({name: listType}, (err, foundList) =>{
            foundList.items.push(item);
            foundList.save();
        });
        if (fromView === "all"){
            res.redirect("/"+ listType);
        }
        else if (fromView === "new"){
            res.redirect("/"+ listType +"/activeTasks");
        }
        else{
            res.redirect("/"+ listType +"/completeTasks");
        }
    }        
        
})

app.post('/delete', (req, res) => {
    let deleteItemIds = req.body.checkboxId;
    let listType = req.body.listName;
    let fromView = req.body.fromView;
    
    console.log("The array length of delete Item lists is ==>"+deleteItemIds.length);
    

    if(listType === "Default"){
        if (Array.isArray(deleteItemIds)){
            deleteItemIds.forEach((itemId) =>{
                Item.updateOne({_id:itemId},{status:"COMPLETE"},(err)=>{
                    if (err){
                        console.log(err);
                        //mongoose.connection.close();
                    }
                });
            });
        }
        else{
            Item.updateOne({_id:deleteItemIds},{status:"COMPLETE"},(err)=>{
                if (err){
                    console.log(err);
                    //mongoose.connection.close();
                }
            });
        }
                
        if (fromView === "all"){
            res.redirect("/");
        }
        else if (fromView === "new"){
            res.redirect("/activeTasks");
        }
        else{
            res.redirect("/completeTasks");
        }
    }
    else{
        if (Array.isArray(deleteItemIds)){
            deleteItemIds.forEach((itemId) =>{
                List.updateOne({ name: listType}, {$set:{"items.$[elem].status":"COMPLETE"}}, {arrayFilters: [{"elem._id":itemId}]}, (err, foundList)=>{
                    if(!err){
                        console.log("Successfullly found and removed all through findOneAndUpdate ==> ");
                    }
                });
            });
        }
        else{
            List.updateOne({ name: listType}, {$set:{"items.$[elem].status":"COMPLETE"}}, {arrayFilters: [{"elem._id":deleteItemIds}]}, (err, foundList)=>{
                if(!err){
                    console.log("Successfullly found and removed one through findOneAndUpdate ==> ");
                }
            });
        }
        
        if (fromView === "all"){
            res.redirect("/"+ listType);
        }
        else if (fromView === "new"){
            res.redirect("/"+ listType +"/activeTasks");
        }
        else{
            res.redirect("/"+ listType +"/completeTasks");
        }

        /* List.findOneAndUpdate({ name: listType}, {$pull : { items : {_id : deleteItemIds }}}, (err, foundList)=>{
            if(!err){
                console.log("Successfullly found and removed through findOneAndUpdate ==> ");
            }
        }); */

    }        
    console.log("Deleted Item is --> "+deleteItemIds);
})





app.listen(process.env.PORT || port, ()=> {
    console.log(`Hasmukh\'s ToDoLists-V1 Web App listening on port ${port}`);
  })