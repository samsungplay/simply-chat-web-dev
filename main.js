const express = require('express');

const app = express();

const http = require('http').createServer(app);

const bodyParser = require('body-parser');


const fs = require('fs');

const linereader = require('readline');


var isLoggingIn = false;

var io = require('socket.io')(http);




var onlineUsers = [];








app.use(bodyParser.urlencoded({extended : false}));




app.set('view engine','ejs');

app.use(express.static(__dirname+"/public"));





app.get('/',(req,res) => {

    if(!isLoggingIn) {

    res.render("home");
    }

    else {
    res.render("home",{errorCode : "Error: Incorrect username or password"});
    isLoggingIn = false;
    }

    


});






app.get('/register.html',(req,res) => {
res.render("register");
});


app.post('/loginPost',(req,res) => {
    const loginInfo = req.body;

    const username = loginInfo.usernameField;
    
    const password = loginInfo.passwordField;



    var loggedIn = false;


    fs.readFile("database/logins/usersList.txt","utf8",(err,data) => {

        if(err)
        throw err;

        var dataArray  = data.split("\n");



       


        dataArray.forEach((dat) => {


            var dataUsername = dat.substring(0,dat.indexOf(":"));

            var dataPassword = dat.substring(dat.indexOf(":")+1,dat.length);

            console.log(username + "=" + dataUsername + "?-----" + dataPassword + "=" + password);

            if(dataUsername.valueOf() === username.valueOf() && dataPassword.valueOf() === password.valueOf() && username.valueOf() != "" && password.valueOf() != "")
            {
                
                loggedIn = true;


            }


        });



         if(loggedIn)
         {

            //Logged In

            //Load Channel Datas





             
            renderChannelList(username,res);








         }
         else
         {

            isLoggingIn = true;
             //Not Logged In
             res.redirect("/");


            
         }


    });


   

});


app.post('/registerPost', (req,res) => {

    const registerInfo = req.body;

    const username = registerInfo.registerUsernameField;

    const password = registerInfo.registerPasswordField;


    

    

    fs.access("database/logins/usersList.txt",(err) => {
     
        if(err)
        {
           fs.writeFile("database/logins/usersList.txt",'',(err) => {
               if(err)
               throw err;
           });

        }

        else {

            fs.readFile("database/logins/usersList.txt","utf8",(err,data) => {

                if(err)
                throw err;


                var dataArray = data.split("\n");



                 var usernameAlreadyExists = false;


                    dataArray.forEach((dat) => {
                        var dataUsername = dat.substring(0,dat.indexOf(":"));

                       

                        if(dataUsername == username)
                        {
                            //username already exists in database

                            usernameAlreadyExists = true;

                           

                            



                        }

                        


                    });

                    if(usernameAlreadyExists)
                    {
                       

                        res.render("register",{errorCode : "Username already exists"});


                    }
                    else
                    {

                        fs.appendFile("database/logins/usersList.txt",username + ":" + password + "\n",(err) => {
                            if(err)
                            throw err;
                        });

                        fs.writeFile("database/users/" + username + ".txt","",(err) => {
                            if(err)
                            throw err;
                        });





                        res.redirect("/");

                    }


  



                    
                    
   

                








                

                

                
                

            });
       
    
    
    
    
        
    
        }
    
    


       
    });


   



   


   








    




});



app.post('/createChannelPost',(req,res) => {


    var fromCurrentUser = req.body.fromCurrentUser;
   


    var channelName = req.body.channelNameInput;

    var channelDesc = req.body.channelDescInput;

    channelDesc = channelDesc.replace("\n","#");


     var tempArray = channelDesc.split("\n");

     var tempString = "";

     

     tempArray.forEach((e) => {
          
        tempString += e + "#";

         

        

     });


     channelDesc = tempString;









var channelFullName = "";


    fs.access("database/channels/channels.txt",(err) => {
     if(err)
     {
         fs.writeFile("database/channels/channels.txt","",(err) => {
             if(err)
             throw err;

         });






     }

     else
     {


         var channelId = Math.floor(Math.random() * 10000000 + 1);
         channelFullName = channelName + "-" + channelId;
         fs.appendFile("database/channels/channels.txt",channelName + "-" + channelId +":\n#" + channelDesc + "\n" ,(err) => {
             if(err)
             throw err;







             fs.access("database/users/" + fromCurrentUser + ".txt" , (err) => {

                if(err)
                 {
        
                     fs.writeFile("database/users/" + fromCurrentUser + ".txt", (err) => {
        
                        if(err)
                        throw err;
        
                        fs.appendFile("database/users/" + fromCurrentUser + ".txt" , "channel-" + channelFullName + "(admin)\n",(err) => {
                            if(err)
                            throw err;
                        });
        
        
                        renderChannelList(fromCurrentUser,res);
        
                       
        
                      
               
        
        
        
                        
        
                      
        
        
                       
                        
            
        
        
        
        
                     });
                     
        
        
                     
        
        
                 }
                 else{
        
                    fs.appendFile("database/users/" + fromCurrentUser + ".txt" , "channel-" + channelFullName + "(admin)\n",(err) => {
                        if(err)
                        throw err;
                    });
        
                    renderChannelList(fromCurrentUser,res);
        
        
        
        
        
                 }



        
        
                 
        
        
        
        
        
            });


            fs.access("database/chatLogs/" + channelFullName + ".txt", (err) => {

                if(err)
                {
                    fs.writeFile("database/chatLogs/" + channelFullName + ".txt","",(err) => {
                        if(err)
                        throw err;
                    });

                }

            
            });

           



            



         });;







         


     }




    });

    //Create New Channel


    

    

   






});


function renderChannelList(fromCurrentUser,res,isReply = false,replyMessage="")
{

    var channelDatum = "";

    var channelData = [];

    const channelDataStream = fs.createReadStream("database/users/" + fromCurrentUser + ".txt", "utf8");

   
    channelDataStream.on('data',(chunk) => {

        channelDatum += chunk;

    });

    channelDataStream.on('end',() => {

        var channelDataRaw = channelDatum.split("\n");


        channelDataRaw.forEach((e) => {

            if(e.startsWith("channel"))
            {

                var i  = e.indexOf("-");
                var j = e.indexOf("(");

                channelData.push(e.substring(i+1,j));

               



                

                

                
            }



        });


        //static array 
        var channelDescData = Array(5000).fill("null");

        

        var desc = "";

       

        var preI = 0;

        var rd = linereader.createInterface({
            input: fs.createReadStream('database/channels/channels.txt'),
            output: process.stdout,
            console: false
          });

        rd.on("line",(line) => {

            

          


           

            var lineChannelName = ""; 

            if(line.indexOf(":") != -1) 
            lineChannelName  = line.substring(0,line.indexOf(":"));

          

            if(channelData.indexOf(lineChannelName) != -1 || line.endsWith("#"))
            {

                if(line.endsWith("#"))
                {
                    desc += line.substring(1,line.length - 1);
                }

                console.log("DESC, preI:" + desc + "," + preI);
              

                

                
               
                

                    channelDescData[preI] = desc;




                    





                    

                    

                

                preI = channelData.indexOf(lineChannelName);

                desc = "";
              
            
                


            }

            else if(line.startsWith("#"))
            {


              
               
                desc += line.substring(1) + "\n";
            }

            

        
         

        }).on('close',(line) => {

            if(!isReply) {

            res.render("chatHome",{currentUser : fromCurrentUser, channelData : channelData , channelDescData : channelDescData});
  
            }
            else
            {
                res.render("chatHome",{currentUser: fromCurrentUser, channelData : channelData, channelDescData : channelDescData, replyMessage : replyMessage})
            }
             
        


           

        });


       

         



        
      
           


        

        


       
        

    });

}

io.on('connection',(socket) => {

    console.log("Connection!");

    socket.on('loadImage',(imageName,userName,channelName) => {

    

          // console.log("LOADING IMAGE...");

            fs.readFile("database/uploadFiles/" + imageName,(err,data) => {

                if(err)
                throw err;

                io.emit('loadImage',imageName,userName,channelName,data);

               // console.log("IMAGE LOADED!");


            });



    });

    socket.on('sendUserImageOnChannel',(userName,channelName,fileName,fileData) => {

        fs.writeFile("database/uploadFiles/" + fileName,Buffer.from(fileData),(err) => {

            if(err)
            throw err;

            fs.appendFile("database/chatLogs/" + channelName + ".txt",userName + "-" + fileName + "(image)\n",(err) => {

                if(err)
                throw err;

                io.emit('sendUserImageOnChannel',userName,channelName,fileName,fileData);
            });

        });

    });


    socket.on('sendUserFileOnChannel',(userName,channelName,fileName,fileData) => {

        fs.writeFile("database/uploadFiles/" + fileName,Buffer.from(fileData),(err) =>{
            if(err)
            throw err;

            fs.appendFile("database/chatLogs/" + channelName + ".txt",userName + "-" + fileName + "(file)\n",(err) => {


                if(err)
                throw err;

                io.emit('sendUserFileOnChannel',userName,channelName,fileName,fileData);


            });



            
        });

        

    


    });

    socket.on('downloadFile',(userName,channelName,fileName) => {

      fs.access("database/uploadFiles/" + fileName,(err) => {
          if(err)
          io.emit('downloadFileNotFound',userName,channelName,fileName);

          
        var readStream = fs.createReadStream("database/uploadFiles/" + fileName);
          
       

        fs.readFile('database/uploadFiles/' + fileName,(err,data) => {

            if(err)
            throw err;

            io.emit('downloadFile',userName,channelName,fileName,data);

        });
          
        


         

      });


    });



  
    socket.on('joinSignal', (localChannelName,localUserName,sessionId) => {

        console.log("JOIN SIGNAL from " + localChannelName);


        if(onlineUsers.indexOf(localUserName) == -1 ) {

        onlineUsers.push(localUserName);

        io.emit('joinSignal',localChannelName,localUserName,sessionId);


        }

        else {
        //user already logged into one of the channels

        console.log("CANNOT JOIN FROM SESSION ID:" + sessionId);
        io.emit('cannotJoinSignal',localChannelName,localUserName,sessionId);
        }





       

    });

    socket.on('sendUserMessageOnChannel',(userName,channelName,message) => {

        var path = "database/chatLogs/" + channelName + ".txt";

        
           
           
                fs.appendFile(path,userName + "-" + message + "(message)\n",(err) => {

                    if(err)
                    throw err;

                });
        

    

        io.emit('sendUserMessageOnChannel',userName,channelName,message);

        
    });

    socket.on('leaveSignal',(userName,channelName,isInvalidSession) => {

        
        if(!isInvalidSession) {

        onlineUsers[onlineUsers.indexOf(userName)] = "";


        io.emit('leaveSignal',userName,channelName);

        }
    });
    
});




app.post("/channel",(req,res) => {

  var channelName = req.body.channelName;

  var fromCurrentUser = req.body.fromCurrentUser;


  //Is channel closed?


fs.access("database/chatLogs/" + channelName + ".txt", (err) => {

    if(err)
      {
          //Channel already closed, closing from this user's file

          var totalData2 = "";
          var matchingContent2 = "";


          
          

          

          

           var linescanner = linereader.createInterface( {  
      input : fs.createReadStream("database/users/" + fromCurrentUser + ".txt"),
      
      output : process.stdout

       });

      var lineCloseFunction = function(line) {

      var currentUser = this.currentUser;

       

          totalData2 = totalData2.replace(matchingContent2,"");
          
        
          


       

      
       

          fs.writeFile("database/users/" + fromCurrentUser + ".txt",totalData2,(err) => {
              if(err)
              throw err;

              


              //Close Channel Chatlogs File

              
  

      if(err)
      throw err;


      renderChannelList(fromCurrentUser,res,true,"This channel has been closed by its admin");



      



  
                


              


                 
           

    
             
          
             


          });


          



       }

     
       linescanner.on('line',(line) => {

          totalData2 += line + "\n";





          var lineChannelName = line.substring(line.indexOf("-")+1,line.indexOf("("));

          if(lineChannelName.valueOf() === channelName.valueOf())
          {

              matchingContent2 = line;


              
          }



       }).on('close',lineCloseFunction);
          


      


          

          

      }

      else
      {

        
          //Channel open

          var chatStream = fs.createReadStream("database/chatLogs/" + channelName + ".txt","utf8");

  

  var chatLog = [];

  var rd = linereader.createInterface( {input : fs.createReadStream("database/chatLogs/" + channelName + ".txt"), 
output : process.stdout      });




rd.on('line',(line) => {

    var username = line.substring(0,line.indexOf("-"));

    var message = line.substring(line.indexOf("-")+1,line.indexOf("("));

    var messageType = line.substring(line.indexOf("(")+1,line.length-1);


    if(messageType.valueOf() === "message")
    {
        chatLog.push("message>_" + username + ":" + message);

    }
    else if(messageType.valueOf() === "file")
    {
        chatLog.push("file>_" + username + ":" + message);
    }
    else if(messageType.valueOf() === "image")
    {

        
       


      var dataRaw = fs.readFileSync("database/uploadFiles/" + message);


       
         




         var data =  String.fromCharCode.apply(null,new Uint16Array(dataRaw));
          



//from here

            chatLog.push("image>_" + username + ":" + message);

            






           

    

        


       
      



       
    }
    


    

    







}).on('close',() => {

  

    var invitationCode = Number.parseInt(channelName.substring(channelName.indexOf("-")+1));





    res.render("chatPage",{channelName : channelName,currentUser : fromCurrentUser,chatLog : chatLog, invitationCode : invitationCode});




   


});




  

   




  





  















      }

});

  //Load Chat Log

  

});


app.post("/closeChannelPost",(req,res) => {

    

    var fromCurrentUser = req.body.fromCurrentUser;
    var channelName = req.body.channelName;
    var isUserAdmin = false;



    fs.readFile("database/users/" + fromCurrentUser + ".txt","utf8", (err,data) => {

        if(err)
        throw err;

        var dataArray = data.split("\n");

       
        

        



        for(let i=0; i<dataArray.length; i++)
        {
            console.log("STRING:" + dataArray[i].substring(dataArray[i].indexOf("-")+1,dataArray[i].indexOf("(")));

            if(dataArray[i].substring(dataArray[i].indexOf("-")+1,dataArray[i].indexOf("(")).valueOf() === channelName.valueOf())
            {
                var userChannelRank = dataArray[i].substring(dataArray[i].indexOf("(")+1,dataArray[i].indexOf(")"));
                
               
                if(userChannelRank.valueOf() === "admin")
                {




                    isUserAdmin = true;










                }


            }
        }

       



        //User has permission to close this channel
        if(isUserAdmin)
        {

            var rd = linereader.createInterface( 
                {
                    input: fs.createReadStream("database/channels/channels.txt","utf8"),
                    output: process.stdout
                }
            );
        
            var foundContent = false;
        
            var matchingContent = "";
        
            
            rd.on('line',(line) => {
                var lineChannelName = line.substring(0,line.indexOf(":"));
        
               //console.log("LINE CHANNEL NAME:(" + lineChannelName + "," +  channelName +")");
        
        
        
                if(lineChannelName.valueOf() === channelName.valueOf() && !foundContent)
                {
        
                    foundContent = true;
        
                  
        
                    matchingContent += line + "\n";
        
                   
        
                    
                }
        
                else if(foundContent && line.startsWith("#"))
                {
        
                    matchingContent += line + "\n";
        
        
        
                    
        
        
                    
        
                }
        
                else if(foundContent && !line.startsWith("#"))
                {
                    foundContent = false;
                }
        
               
        
        
        
               
        
        
            }).on('close',() => {
        
                var channelDataStream = fs.createReadStream('database/channels/channels.txt',"utf8");
        
                var totalData = "";
            
                channelDataStream.on('data',(chunk) => {
            
                    totalData += chunk;
            
                });
            
                channelDataStream.on('end',() => {
        
                    
        
        
                    totalData = totalData.replace(matchingContent,"");
        
        
                    fs.writeFile("database/channels/channels.txt",totalData,(err) => {
        
                        if(err)
                        throw err;
        
                        //Channel Closed From Channels.txt file



                        
                        //Closing from users

                        //TODO:
                        //1.Close from all users
                        //2.Loading chat logs

                      
                    

                           
                                var totalData2 = "";
                                var matchingContent2 = "";
   

                                
                                

                                

                                

                                 var linescanner = linereader.createInterface( {  
                            input : fs.createReadStream("database/users/" + fromCurrentUser + ".txt"),
                            
                            output : process.stdout

                             });

                            var lineCloseFunction = function(line) {

                            var currentUser = this.currentUser;

                             

                                totalData2 = totalData2.replace(matchingContent2,"");
                                
                              
                                


                             

                            
                             
  
                                fs.writeFile("database/users/" + fromCurrentUser + ".txt",totalData2,(err) => {
                                    if(err)
                                    throw err;

                                    


                                    //Close Channel Chatlogs File

                                    
                        fs.unlink("database/chatLogs/" + channelName + ".txt",(err) => {

                            if(err)
                            throw err;


                            renderChannelList(fromCurrentUser,res,true,"The channel has successfully been closed");



                            



                        });
                                      


                                    


                                       
                                 
     
                          
                                   
                                
                                   


                                });


                                //Closed Channel



                             }

                           
                             linescanner.on('line',(line) => {

                                totalData2 += line + "\n";





                                var lineChannelName = line.substring(line.indexOf("-")+1,line.indexOf("("));

                                if(lineChannelName.valueOf() === channelName.valueOf())
                                {

                                    matchingContent2 = line;


                                    
                                }



                             }).on('close',lineCloseFunction);
                                


                            

                           
                    



                    
                       



                       




                                
        
        
                      
        
                         
        
        
        
        
                    });
        
        
            
                    
            
                });
            
        
        
            } );
        
        

        }

        //No permission

        else
        {
           

            renderChannelList(fromCurrentUser,res,true,"You do not have enough permission");










        }
        






        

    });

 




   


   
   


   


});





app.post('/channelHome',(req,res) => {
    console.log("channel home called");
    var currentUser = req.body.currentUser;
    var isReply = req.body.isReply;

    


    if(isReply.valueOf() === "true")
    {
        renderChannelList(currentUser,res,true,"Error: This user is already occupying a channel.");

    }
    else  {

        //Log out function here

        onlineUsers[onlineUsers.indexOf(currentUser)] = "";


    renderChannelList(currentUser,res);
    }

    

});




app.post('/joinChannelPost',(req,res) => {
    var fromCurrentUser = req.body.fromCurrentUser;

    var invitationCode = req.body.invitationCode;


    var isChannelAlreadyJoined = false;

   var prerd = linereader.createInterface( {
       input : fs.createReadStream("database/users/" + fromCurrentUser + ".txt","utf8"),

       output : process.stdout




   });

   prerd.on('line',(line) => {
       var channelCode = line.substring(line.indexOf("-",9)+1,line.indexOf("("));

       if(channelCode.valueOf() === invitationCode.valueOf()) {
       isChannelAlreadyJoined = true;

       renderChannelList(fromCurrentUser,res,true,"You are already in this channel");

       }

   }).on('close',() => {
       if(!isChannelAlreadyJoined)
       {


        var rd = linereader.createInterface( {
            input : fs.createReadStream("database/channels/channels.txt","utf8"),
    
            output : process.stdout
    
    
        });
    
    
        var isChannelFound = false;
    
    
    
        rd.on('line',(line) => {
    
            //Matching invitation code
    
            if(line.substring(line.lastIndexOf("-")+1,line.lastIndexOf(":")).valueOf() === invitationCode.valueOf())
            {
    
                isChannelFound = true;
    
                
                var channelName = line.substring(0,line.length-1);
    
                fs.appendFile("database/users/" + fromCurrentUser + ".txt","channel-" + channelName + "(user)",(err) => {
                    if(err)
                    throw err;
    
    
    
    
                    renderChannelList(fromCurrentUser,res,true,"Successfully joined channel:\n " + channelName);
    
    
                
    
    
    
                });
    
    
    
    
            }
    
        }).on('close',()=> {
    
            if(!isChannelFound)
            {
    
                renderChannelList(fromCurrentUser,res,true,"Could not find channel");
    
            }
    
        });







       }

     
       

   });


    
    
    







    


    

    





});

app.post("/logoutPost",(req,res) => {
    var fromCurrentUser = req.body.fromCurrentUser;



    onlineUsers[onlineUsers.indexOf(fromCurrentUser)] = "";


    res.render("home");



});






var PORT = process.env.PORT || 3000;
http.listen(PORT,() => {
    console.log("Web Server Running On port 3000");
});





