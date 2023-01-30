const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const _=require("lodash");
// const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
mongoose.set('strictQuery', true)
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://winsakshi10:YNVPwqCKM6n7aViV@cluster0.9tul2a7.mongodb.net/?retryWrites=true&w=majority/todolistDB');
    
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  }

//   schema
const itemSchema=new mongoose.Schema({
    name:String
});

// Model
const Item=mongoose.model("ITEM",itemSchema);

const item1=new Item({
    name:"Take a bath"
});

const item2=new Item({
    name:"Dress up"
});

const item3=new Item({
    name:"Go to party"
});

const defaultItems=[item1,item2,item3];
const listSchema={
    name:String,
    items:[itemSchema]
};

const List=mongoose.model("List",listSchema)

// const items=["Buy food","Cook Food","Eat Food"];
const workItems=[];

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");
app.use(express.static("public"));

let item="";

app.get("/",function(req,res){
    
//    let day=date.getDate();
Item.find({},function(err, foundItems){

if(foundItems.length===0){
Item.insertMany(defaultItems,function(err){
if(err){
    console.log(err);
}
else{
    console.log("Inserted successfully");
}
});
res.redirect("/");
}

else
{
    res.render("list", {listTitle:"Today",newListItems:foundItems});
}   
});
});

app.post("/",function(req,res){
    
    const itemName=req.body.newItem;
    const listName=req.body.list;


    const item=new Item({
        name:itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            if(!err){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
            }
        })
    }

});


app.post("/delete",function(req,res){
    const checkedItem=req.body.checkBox;
    const listName=req.body.listName;
    console.log(listName);

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItem,function(err){
            if(!err){
                console.log("deleted");
                res.redirect("/");
        }
    });    
    }
    else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
            if(!err)
            {
                res.redirect("/"+listName);
            }
        });
    }

   
});


app.get("/:customListName",function(req,res){

    const customlistName=_.capitalize(req.params.customListName);
    

    List.findOne({name:customlistName},function(err,foundList){

        if(!err){
            if(!foundList)
            {
                const list=new List({
                    name:customlistName,
                    items:defaultItems
                });
            
                list.save();
                res.redirect("/"+customlistName);
            }
            else{
                res.render("list", {listTitle:foundList.name,newListItems:foundList.items});
            }
        }

    });
   
});

app.get("/about",function(req,res){
    res.render("about");
})


app.listen(3000,function(){
    console.log("Server started on port 3000");
});