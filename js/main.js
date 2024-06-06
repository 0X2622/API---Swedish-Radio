"use strict";

//API URL that is used to fetch Data  from server
const baseUrl = "https://api.sr.se"

//Audio object that is used to fetch audio from Server
var myAudio = new Audio;

//Function that sets up the start screen with proper navigation list and functions
// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function start(){ 

    //The URL that is used for the API - CAll
    var mainnavlist = baseUrl+"/v2/channels"+"?format=json";
  
    //Use the URL (mainnavlist) in the xmlHTTP - function to make a proper API CALL, 
    //Saves the result/output in the Variable jsonData -> and then start the function Print (with the given data) 
    var jsonData = xmlHTTP(mainnavlist).then(function print(jsonData){

        //Fills the sections "mainnavlist" and "searchlan" with correct data 
        for(var i=0; i < jsonData.channels.length; i++){
            document.getElementById("mainnavlist").innerHTML += "<li id='"+jsonData.channels[i].id+"'>"+jsonData.channels[i].name+"</li>";    
            document.getElementById("searchProgram").innerHTML += "<option value='"+jsonData.channels[i].id+"'>"+jsonData.channels[i].name+"</option>";      
        } 
    }); 
});

//A function that sets up - and makes an API call to the server
//where the parameter "e" is the passed in URL that is used to make the request
//This function creates a new promise and if resolved -> the recieved data is parsed to JSON and returned
function xmlHTTP(e){

    //If promise == success -> resolve, else -> reject
    return new Promise (function(resolve, reject){
        
        //Creates XMLHTTP Object
        let myRequest = new XMLHttpRequest(); 
          
        //load handler -> processing of what we recieve from the send - request.
        myRequest.onload = function(){
            if(myRequest.status == 200){
                //If the promise is fulfilled -> resolve and Parse the data
                resolve(JSON.parse(myRequest.responseText));              
            }      
            else{
                //If the promise is not fulfilled -> Reject and make an call errorcheck
                reject(errorCheck(myRequest));
            };
        };
        //sets the method the be GET, the parameter to be e and to operate asynchronously
        //sends the request to the server  
        myRequest.open("GET",e, true);                                          
        myRequest.send();
    });
};
    
//Function that does an errorcheck
function errorCheck(e){
    if (e.status == 400) {
        alert('Error 404: Bad Request');}
    else if(e.status == 404){
        alert('Error 404: The data you requested is not available')}
    else if(e.status == 429){
        alert('Error 429: You have sent too many requests in a given amount of time')}
    else if(e.status == 500){
        alert('Error 500: Something wrong on the server side')}    
    else {alert('an error as occured');}
};

//Eventlistener - triggers the function "navigation" on click
document.getElementById('mainnavlist').addEventListener("click", function(e){
  
    //This makes sure that the dropdown-list "searchprogram" automatically always changes it's value accordingly when a new channel is clicked/chosen
    document.getElementById("searchProgram").value = e.target.id; 
    
    //The ID-value of the chosen channel will be passed in as argument to the navigation function
    let ID = e.target.id;
    navigation(ID);
});

//Makes sure that a change of value in the dropdown list also changes radio channel
//this will trigger the naviation function with "e.value" as passing argument
document.getElementById("searchProgram").addEventListener("change", function(e){

    //makes sure that the ID-value of the channel is passed in as argument to the Navigation function
    let value = e.target.value;
    navigation(value);
});

//EVentlistenet for click on the "Tablå button"
//The Input is the current set value of "searchprogram" (which always holds the ID of current chosen channel),
//That value/ID is the input to the Tablå function which then prints out the correct tablå content to the screen 
document.getElementById('searchbutton').addEventListener("click", function tablåStart(e){
    let value = document.getElementById("searchProgram").value;
    tablå(value);
});


//function that handles a change in Radio Channel
//this function will display proper information of the chosen radio channel,
//and also call the Audio & Playlist functions that handles the audio and song descriptions
function navigation(e){

    //clears the list from previous elemnts
    document.getElementById("info").innerHTML = "";

    //sets the URL to the right value for the API Call
    let URL = baseUrl+"/v2/channels/" +e+"?format=json";

    //calls for the xmlHTTP function with "URL" as passing argument -> and  then starts then print function
    //with the returned jsonData
    var jsonData = xmlHTTP(URL).then(function print(jsonData){

        //Displays information of the chosen radio channel on the info section
        document.getElementById("info").innerHTML += "<h3>" + jsonData.channel.name + "</h3>";
        document.getElementById("info").innerHTML += "<p>" + jsonData.channel.tagline + "</p>";
        document.getElementById("info").innerHTML += "<hr>";

        //passes the JSON object to the Audio-function to start the Audio
        playAudio(jsonData);

        //starts the function that is used to show the previous, current and next radio - song
        playlist(jsonData);
    });
}

//Function that prints out the Tablå-information to the screen
//It sends a request to the server that holds the Schedule-episodes for the radio channel,
//the argument e is the ID of the channel and makes it possible to find the right tablå for the right channel
function tablå(e){

    //clear previous data
    document.getElementById("info").innerHTML = "";
    
    //sets the correct URL for the API Call
    let URL = baseUrl + "/v2/scheduledepisodes?channelid="+e+"&format=json";

    //Passes in the URL to the xmlTTP function and then starts a function to display the returned data
    let jsonData = xmlHTTP(URL).then(function tablååPrint(jsonData){

        //a for loop that uses "i" to iterate through all the JSON objects and
        //prints out the proper schedule & information for the chosen channel
        for(let i = 0; i<jsonData.schedule.length; i++){
            
            //to set the correct date & time for each program - we create a variable "string",
            //this variable will hold a string that represents the start-date of the progoram (in milliseconds)
            let string = jsonData.schedule[i].starttimeutc;

            //to be able to convert the date from milliseconds to "a standard readable form" 
            //all non numbers are erased from the string
            string = string.slice(6); //takes away "/Date(" 
            string = string.slice(0, -2); //takes away  ")/"

            string = Number(string); //Converts the objects value to numbers

            var date = new Date(string); //creates a new variable "date" that will represent the correct readable date & time for each program

            document.getElementById("info").innerHTML += "<h2>" +jsonData.schedule[i].program.name + "</h2>";
            document.getElementById("info").innerHTML += "<h4>" +jsonData.schedule[i].description  + "</h4>";
            document.getElementById("info").innerHTML += date;
            document.getElementById("info").innerHTML += "<hr>";           
        }
    }); 
}

//Function that checks if an audio is played
//if an audio is played -> it will be paused and the object will be overwritten
//with a new URL (from the new JSON object) and the new audio will then start to play
function playAudio(e){

    //if an audio is currently played -> It needs to be paused
    if(myAudio.currentTime != 0){
        myAudio.pause();
        myAudio.currentTime = 0;
    }
    myAudio.src = e.channel.liveaudio.url; //sets the source for the audio that needs to be played
    myAudio.play(); //plays the audio
};

//function that display information of the previous and next song for the chosen radio channel
function playlist(e){
    
    //sets the correct URL
    var URL = baseUrl + "/playlists/rightnow?channelid="+e.channel.id+"&format=json";

    //Passes in the URL to the xmlHTTP function -> and then prints out the correct data
    var jsonData = xmlHTTP(URL).then(function print(jsonData){
        document.getElementById("info").innerHTML += "<strong>" + "<p>"+ "Previous song: " + "</strong>" +jsonData.playlist.previoussong.title + " - " + jsonData.playlist.previoussong.artist + "</p>";
        document.getElementById("info").innerHTML +=  "<strong>" + "<p>"+ "Next song: " + "</strong>" +jsonData.playlist.nextsong.title + " - " + jsonData.playlist.nextsong.artist + "</p>";
        document.getElementById("info").innerHTML += "<hr>";
    });
}

