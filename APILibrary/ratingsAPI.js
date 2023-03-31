

module.exports = 
{


//add data from scraper to database
addDataScrapRat: async function addDataScraper(client, data) {


    /*
        
            
                [
                    {
                       "Product_id": "0",
                       "Product_family": "Bobbie",
                       "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
                        "Price": 25.99,
                     "Availability": "IN_STOCK",
                        "Quantity": -1,
                        "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
                        "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a"
                    },
                    {
                       "Product_id": "0",
                       "Product_family": "Bobbie",
                       "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
                        "Price": 25.99,
                     "Availability": "IN_STOCK",
                        "Quantity": -1,
                        "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
                        "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a"
                    }
                
                ]
            
        
    





    */


 
    const DB2 = client.db('Ratings');


   
    const collection2 = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection);

    
    try{
        for(let i = 0; i < data.length; i++)
        {
            let item = data[i];

      
       
            //add each item from list if not already in ratings db
            collection2.update(
                {
                    Product_id: item.Product_id, Store_id: item.Store_id, Company: item.Company
                },
                {
                    $setOnInsert: {
                        Product_id: item.Product_id, Product_family: item.Product_family, Product: item.Product,
                        Price: item.Price, Availability: item.Availability, Store_id: item.Store_id, Company: item.Company,
                        Quantity: item.Quantity, Product_url: item.Product_url, Product_img_url: item.Product_img_url,
                        Likes: 0, Dislikes: 0, Rating: "Unrated"
                    }
                },
                { upsert: true }
            )
        
       
        }
    }
    catch(err)
    {
        throw  new Error(err);
    }
    
},



//function to retrive data for frontend
getDataRatings: async function get_data(client, data)
{



    const DB2 = client.db('Ratings');



   
    const collection2 = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection);
   //find item from ratings db
    let rating = await collection2.findOne(
        { Company: data.Company, Store_id: data.Store_id, Product_id: data.Product_id }

    );
    return rating;
    
    

},

// function for when an item is liked or conversely unliked
likeItem: async function item_liked(client, userData, itemData) {

    
    /*
        Userdata in this format 
        {
            "Email": "johndoe2@gmail.com"
        }

        itemData in this format
        {
            "Company": "Target",
            "Product_id": "160",
            "Store_id": 2845,
            "Availability": "IN_STOCK",
            "Disliked": [],
            "Dislikes": "0",
            "Liked": [],
            "Likes": "0",
            "Price": 25.99,
            "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
            "Product_family": "Bobbie",
            "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a",
            "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
            "Quantity": -1,
            "Rating": "Unrated"
        }
            

        


    */

    
    const DB2 = client.db('Ratings');//connect to Ratings DB

    const collection = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection); 


    //get liked item ratings profile
    let item = await collection.findOne(
        { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }

    );
    //get liked array from item profile
    const liked = item.Liked;
    
    //get disliked array from item profile
    const disliked = item.Disliked;
        
    //list of liked users without userData
    const filtered = liked.filter(el => el.Email !== userData.Email);
   

    //user is in liked(was previously liked)
    if (filtered.length != liked.length) {

        //decrement likes in Rating DB
        item.Likes--;
        const total = item.Likes + item.Dislikes;
        
        //recalculate Rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        
        //update entry in Rating DB
        var myquery = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues = { $set: { Likes: item.Likes, Rating: item.Rating, Liked: filtered } };
        collection.updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;

        });
        //return item profile
        const itemReturn =  await collection.findOne(

            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id  }


        );
        return itemReturn;
    
    }
    //user is not in liked array(not previously liked)
    else {

        //list of disliked users without userData
        const filteredDis = disliked.filter(el => el.Email !== userData.Email);

        //user is in disliked(was previously disliked)
        if (filteredDis.length != disliked.length) {

            
            //add user to liked array
            liked.push(userData);
            //increment likes in Ratings DB
            item.Likes++;
            //decrement dislikes in Rating DB
            item.Dislikes--;
            const total = item.Likes + item.Dislikes;
            //recalculate rating
            if(total  == 0)
            {
                item.Rating = "Unrated";
            }   
            else
            {
                const ratingPercentage = (item.Likes/ total)*100;
                item.Rating = ratingPercentage.toString();
            }
            //update Rating DB
            var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
            var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating, Disliked: filteredDis ,Liked: liked } };
            collection.updateOne(myquery2, newvalues2, function (err, res) {
                if (err) throw err;

            });
            //return item profile
            const itemReturn =  await collection.findOne(

            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id  }


            );
            return itemReturn;
            
            
        
        }
        //user has neither liked or disliked the item previously
        else{

         //update item array to have user in liked array
        liked.push(userData);

        //increment likes in Ratings DB
        item.Likes++;
        const total = item.Likes + item.Dislikes;
        //recalculate rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        //update Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating, Liked: liked } };
        collection.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return item profile
        const itemReturn =  await collection.findOne(

            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id  }


        );
        return itemReturn;
        }
    }


},

//function for when item is disliked or conversely undisliked 
dislikeItem:  async function item_disliked(client, userData, itemData) {


    /*
        Userdata in this format 
        {
            "Email": "johndoe2@gmail.com"
        }

        itemData in this format
        {
            "Company": "Target",
            "Product_id": "0",
            "Store_id": 2845,
            "Availability": "IN_STOCK",
            "Disliked": [],
            "Dislikes": "0",
            "Liked": [],
            "Likes": "0",
            "Price": 25.99,
            "Product": "Bobbie Baby Organic Powder Infant Formula - 14oz",
            "Product_family": "Bobbie",
            "Product_img_url": "https://target.scene7.com/is/image/Target/GUEST_a47d490d-8dca-4c78-9993-07a4e630445a",
            "Product_url": "https://www.target.com/p/bobbie-baby-organic-powder-infant-formula-14oz/-/A-85776110",
            "Quantity": -1,
            "Rating": "Unrated"
        }

    */

    


    
        const DB2 = client.db('Ratings');//connect to Ratings DB

        const collection = await DB2.collection('Ratings'); // or DB.createCollection(nameOfCollection); 
    
    
        //get liked item ratings profile
        let item = await collection.findOne(
            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }
    
        );
       
        //get liked array from item profile
        const liked = item.Liked;
        
        //get disliked array from item profile
        const disliked = item.Disliked;
        
    //list of disliked users without userData
    const filtered = disliked.filter(el => el.Email !== userData.Email);
    


    //item is in disliked(was previously disliked)
    if (filtered.length != disliked.length) {
        
        //decrement dislikes in Rating DB
        item.Dislikes--;
        const total = item.Likes + item.Dislikes;
        
        //recalculate Rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        
        //update entry in Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Dislikes: item.Dislikes, Rating: item.Rating, Disliked: filtered  } };
        collection.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return item profile
        const itemReturn =  await collection.findOne(

            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }


        );
        return itemReturn;
    
    }
    //item is not in disliked array(not previously disliked)
    else {

        //liked array without userData
        const filteredDis = liked.filter(el => el.Email !== userData.Email);

        //user is in liked(was previously liked)
        if (filteredDis.length != liked.length) {

            

            //add userData to disliked array
            disliked.push(userData);
            
            //increment dislikes in Ratings DB
            item.Dislikes++;
            //decrement Likes in Rating DB
            item.Likes--;
            const total = item.Likes + item.Dislikes;
            //recalculate rating
            if(total  == 0)
            {
                item.Rating = "Unrated";
            }   
            else
            {
                const ratingPercentage = (item.Likes/ total)*100;
                item.Rating = ratingPercentage.toString();
            }
            //update Rating DB
            var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
            var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating, Liked: filteredDis ,Disliked: disliked} };
            collection.updateOne(myquery2, newvalues2, function (err, res) {
                if (err) throw err;

            });
            
            //return item profile
            const itemReturn =  await collection.findOne(

            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }


            );
            return itemReturn;
    
        
        }
        else{
            
        //add userData to disliked array
        disliked.push(userData);
        
        //increment dislikes in Ratings DB
      
        item.Dislikes++;
        const total = item.Likes + item.Dislikes;
        //recalculate rating
        if(total  == 0)
        {
            item.Rating = "Unrated";
        }
        else
        {
            const ratingPercentage = (item.Likes/ total)*100;
            item.Rating = ratingPercentage.toString();
        }
        //update Rating DB
        var myquery2 = { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id };
        var newvalues2 = { $set: { Likes: item.Likes, Dislikes: item.Dislikes, Rating: item.Rating, Disliked: disliked } };
        collection.updateOne(myquery2, newvalues2, function (err, res) {
            if (err) throw err;

        });
        //return item profile
        const itemReturn =  await collection.findOne(

            { Company: itemData.Company, Store_id: itemData.Store_id, Product_id: itemData.Product_id }


            );
            return itemReturn;
        }
    }


},
};