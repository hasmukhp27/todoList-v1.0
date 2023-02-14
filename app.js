const express = require('express');
const bodyParser = require('body-parser');
const getDate = require('./date');
const date = require(__dirname + "/date.js");



const personnelItems = ['Buy Grocery', 'Cook Food', 'Eat Food'];
const workItems = [];

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const port = 2936;

const currentDay = date.getDate();

app.get('/Personnel', (req, res)=> {

/*     let today = new Date();
    //var currentDay = today.getDay();

    //const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    let options = {
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric'
                };

    currentDay = today.toLocaleDateString("en-US",options);
 */
    //console.log(__dirname);
    

    let listKind = req.path;

    res.render('list',{dayOfWeek: currentDay, newItems: personnelItems, typeOfList: listKind.slice(1,)});
  
})

app.get('/Work',(req, res) => {
    let listKind = req.path;
    res.render('list',{dayOfWeek: currentDay, newItems: workItems, typeOfList: listKind.slice(1,)});
})

app.post('/', (req, res) => {
    let newItem = req.body.newItem;
    let typeOfAdd = req.body.addButton;
    if (typeOfAdd === "Personnel") {
        personnelItems.push(newItem);
    }
    else{
        workItems.push(newItem);
    }

    console.log("Passed Item is --> "+newItem);
    res.redirect("/"+ typeOfAdd);
})

app.listen(process.env.PORT || port, ()=> {
    console.log(`Hasmukh\'s ToDoLists-V1 Web App listening on port ${port}`);
  })

