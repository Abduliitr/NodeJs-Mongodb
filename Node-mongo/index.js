const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dboper = require('./operations')

const url = 'mongodb://localhost:27017';
const dbname = 'confusion';

MongoClient.connect(url).then((client) => {

    // assert.equal(err, null);

    console.log("Connected correctly to the Server!!");

    const db = client.db(dbname);
    
    dboper.insertDocument(db, {name:"Abdulahad", description : "testing" }, 'dishes')
    .then((result) => {
        
        console.log("Insert Document:\n" , result.ops);

        return dboper.findDocuments(db, 'dishes')
    
    })
    .then((docs) => {
            
        console.log("FoundDocs:\n" , docs);

        return dboper.updateDocument(db, {name: "Abdulahad"}, {description:"Updated test"}, 'dishes')
    })
    .then((result) => {

        console.log('Updated Doc:\n' , result.result)

        return dboper.findDocuments(db, 'dishes')
        
    })
    .then((docs) => {

        console.log("Found Documents:\n", docs);

        return db.dropCollection('dishes')
    })
    .then((result)=>{
        
        console.log("Dropped Collection :\n" , result);

        client.close();
    })
    .catch((err) => console.log(err));
})
.catch((err) => console.log(err));
