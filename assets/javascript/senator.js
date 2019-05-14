// app.js 
// US Senators by Brenda Thompson
// links of interest
// https://www.senate.gov/pagelayout/history/a_three_section_with_teasers/Explore_Senate_History.htm
//***************** */
// globals
//***************** */
var senatorInfoLocation = document.getElementById('senator-data');
var senatorsArray = [];
var senatorArrayIndex = 0;
var allMembersArray = [];
//***************** */
// functions
//***************** */

function allMembersQueryResponse(response) {
    // all members response
    console.log(response)
    // save off the senate members into an array
    allMembersArray = response.results[0].members;
    console.log("found all members array. The first name encountered is: " + allMembersArray[0].last_name);
}
function allMembersErrorResponse(error) {
    alert("An error was encountered when fetching the allMembers info: " + error);
}

// builds the all members query, sends it 
function queryAllMembersAPI() {
    var queryAllMembers = "https://api.propublica.org/congress/v1/115/senate/members.json";
    console.log("queryAllMembersURL: " + queryAllMembers);
    
    $.ajax({
        // all members query
        url: queryAllMembers,
        method: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('X-API-Key', '5bJZH4Np16Y8EZctNxL2tv9mCWirk0A1taulPeU8'); },
    })
    .then(allMembersQueryResponse)
    .catch(allMembersErrorResponse);
}
//***************** */
// objects and classes
//***************** */
class Member {
    constructor (nameStr) {
        var nameArray = nameStr.split(" ");
        this.lastName = nameArray[1];
        this.firstName = nameArray[0];

        // find our senator
        for (var i = 0; i < allMembersArray.length; i++) {
            // console.log( 'index is: ' + i);
            // console.log('last name is: ' + response.results[0].members[i].last_name + " id is: " + response.results[0].members[i].id); 
             var searchLastName = allMembersArray[i].last_name;

            // bjt need to handle case of two members with the same last name
            // need to search on first name and last name
            // and with middle names
            // and handle the case - its case sensitive right now
            if (searchLastName === this.lastName) {
                console.log( 'success');
                this.memberId = allMembersArray[i].id;
                this.state = allMembersArray[i].state;
                var party = allMembersArray[i].party;
                this.party = party === 'R' ? 'Republican' : party === 'D' ? 'Democrat' : 'Independent';
                this.fecId = allMembersArray[i].fec_candidate_id;
    
                console.log( 'member id is: ' + this.memberId);
                break;
            } 
        }
    } // end constructor

    buildCardForMember() {
        // this needs to be cleaned up desperately
        var titleHtml = '<b>Name: </b>' +  this.firstName + ' ' + this.lastName;
        var brk = document.createElement('br');
        var stateHtml = '<b>State Elected: </b>' + this.state;
        var aBrk = document.createElement('br');
        var partyHtml = '<b>Party Affiliation: </b>' + this.party;
        var anotherBrk = document.createElement('br');
        var infoHtml = '<a href="https://www.' + this.lastName + '.senate.gov" target="_blank">Web Site</a>';
        var bioHtml = '<a href="http://bioguide.congress.gov/scripts/biodisplay.pl?index=' + this.memberId + '" target="_blank">Biography</a>';
        // var brk3 = document.createElement('br');
        var brk2 = document.createElement('br');
        // var brk4 = document.createElement('br');

        // console.log("disbursements (2018): " + disbursements);

        var headerPara = document.createElement('p');
        headerPara.setAttribute('id', this.lastName.toUpperCase());

        $(headerPara).append(titleHtml, brk, stateHtml, aBrk, partyHtml, anotherBrk, infoHtml, brk2, bioHtml);

        var senBlock = document.createElement('div');
        senBlock.className = 'card-block';
        senBlock.append(headerPara);

        var themeImage = document.createElement('img');
        themeImage.setAttribute('src', 'https://theunitedstates.io/images/congress/225x275/' + this.memberId + '.jpg');
        themeImage.setAttribute('alt', 'Senator ' + this.firstName  + ' ' + this.lastName);
        themeImage.className = 'card-image-top img-fluid';

        var senColumn = document.createElement('div');
        senColumn.append(themeImage);
        senColumn.append(senBlock);

        $("#senators-appear-here").prepend(senColumn);
    }
    static getCampaignFinanceQuery(response) {
        console.log(response.results);
        var disbursements = response.results[0].total_disbursements;
        if (disbursements === 0) {
            // nothing reported
            return;
        }
        var contributions = response.results[0].total_contributions;
        var individuals = response.results[0].total_from_individuals;
        var pacs = response.results[0].total_from_pacs;
        
        // find the year for the response
        var dateArray = response.results[0].date_coverage_to.split('-');
        var year = dateArray[0];
        var disbursementHtml = '<br><b>Disbursements (' + year + '): </b>' + disbursements;
        var contributionsHtml = '<br><b>Contributions (' + year + '): </b>' + contributions;
        var individualsHtml = '<br><b>From Individuals (' + year + '): </b>' + individuals;
        var pacsHtml = '<br><b>From PACs (' + year + '): </b>' + pacs;
        // find the last name of this senator so you can find the id in the html
        var nameStr = response.results[0].name;
        var nameArray = nameStr.split(',');
        var idName = "#" + nameArray[0].toUpperCase();
        $(idName).append(contributionsHtml);
        $(idName).append(disbursementHtml);
        $(idName).append(individualsHtml);
        $(idName).append(pacsHtml);
    }
    // fec.gov api query response handling
    fecQueryResponse(response) {
        // because we are in a callback there is no 'this', and no way to tell which senator had the error
        console.log('fec query response');
        console.log(response);
        if (response.status !== 'OK') {
            console.log('An error in campaign Finance Query Response');
            console.log(response);
            return;
        }
    }


    // propublica api query response handling
    campaignFinanceQueryResponse(response) {
        // because we are in a callback there is no 'this', and no way to tell which senator had the error
        if (response.status !== 'OK') {
            console.log('An error in campaign Finance Query Response');
            console.log(response);
            return;
        }
        Member.getCampaignFinanceQuery(response);
    }

    campaignFinanceQueryError(error) {
        // because we are in a callback there is no 'this', and no way to tell which senator had the error
        console.log('campaign finance query hit an error: ' + error);
    }

    // builds the campaign finance query for 2016 and 2018, sends it, processes and displays the results
    queryCampaignFinancesAPI() {
        var campaingFinanceApiKey = 'nSWxGCi8m5TJ7ma1XtjxUyj5lkenTTrYnUM947va';
        var query2016FinanceData =  "https://api.propublica.org/campaign-finance/v1/2016/candidates/" + this.fecId + ".json";

        console.log("query2016FinanceData: " + query2016FinanceData);

        $.ajax({
            // campaign finance query 2016
            url: query2016FinanceData,
            method: "GET",
            beforeSend: function (xhr) { xhr.setRequestHeader('X-API-Key', campaingFinanceApiKey); },
        })
        .then(this.campaignFinanceQueryResponse)
        .catch(this.campaignFinanceQueryError);

        // now do the 2018 api call
        var query2018FinanceData =  "https://api.propublica.org/campaign-finance/v1/2018/candidates/" + this.fecId + ".json";
        $.ajax({
            // campaign finance query 2018
            url: query2018FinanceData,
            method: "GET",
            beforeSend: function (xhr) { xhr.setRequestHeader('X-API-Key', campaingFinanceApiKey); },
        })
        .then(this.campaignFinanceQueryResponse)
        .catch(this.campaignFinanceQueryError);
/*
        // http://api.open.fec.gov/v1/candidate/{candidate_id}/history
        // warren committee for president C00693234 warren P00009621
        // https://www.fec.gov/data/candidate/P00009621/?cycle=2020&election_full=false
        // obama P80003338
        var fecAPIKey = 'i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';
        // curl -X GET "https://api.open.fec.gov/v1/candidates/search/?office=P&page=1&sort=name&sort_nulls_last=false&per_page=20&candidate_status=C&cycle=2020&sort_null_only=false&api_key=" + fecAPIKey + "&sort_hide_null=true" -H "accept: application/json"
        //var fecQuery = 'http://api.open.fec.gov/v1/candidate/P00009621/?cycle=2020&election_full=false&api_key=i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';
        // president 2020var fecQuery = 'http://api.open.fec.gov/v1/candidates/?cycle=2020&office=P&candidate_status=C&api_key=' + fecAPIKey;
        var fecQuery = 'http://api.open.fec.gov/v1/candidates/?cycle=2018&office=S&per_page=65&candidate_status=C&api_key=' + fecAPIKey;



        // history of candidate'http://api.open.fec.gov/v1/candidate/P00009621/history?api_key=i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';

        $.ajax({
            // fec.gov query
            url: fecQuery,
            method: "GET",
        })
        .then(this.fecQueryResponse)
        .catch(this.campaignFinanceQueryError);
    
        var fecQueryPage2 = 'http://api.open.fec.gov/v1/candidates/?cycle=2018&office=S&per_page=65&page=2&candidate_status=C&api_key=' + fecAPIKey;
        $.ajax({
            // fec.gov query
            url: fecQueryPage2,
            method: "GET",
            //beforeSend: function (xhr) { xhr.setRequestHeader('X-API-Key', campaingFinanceApiKey); },
        })
        .then(this.fecQueryResponse)
        .catch(this.campaignFinanceQueryError);
*/
    }

    // define all getters and setters here
    get memberLastName() {return this.lastName;}
    set memberLastName(name) {this.lastName = name;}
    get memberFirstName() {return this.firstName;}
    set memberFirstName(name) {this.firstName = name;}
    get memberIdentifier() {return this.memberId;}
    set memberIdentifier(id) {this.memberId = id;}

} // close Member class

var senateInfo = {
    topics: ['Lamar Alexander', 'Jeannne Shaheen', 'Maggie Hassan', 'Susan Collins', 'Angus King', 'Elizabeth Warren', 'Ed Markey', 'Mitch McConnell', 'Chuck Schumer'],
    newInputValue: 'enter a senator here',
    initButtons: function() {
        // create instructions for buttons and form
        var instructionNode = document.createElement('p');
        instructionNode.className = 'text-primary';
        instructionNode.textContent = 'Click on a conveniently, already made button, ' 
                + 'or create your own button with your favorite senator!';
        senatorInfoLocation.appendChild(instructionNode);

        // hang the parent button off of the body
        // prepend to ensure the buttons are at the top of the page
        var divNode = document.createElement('div');
        divNode.setAttribute('id', 'button-parent');
        senatorInfoLocation.appendChild(divNode);
        this.renderButtons();
    },

    initForm: function() {
        // <form id='new-button-form'>
        var newButtonForm = document.createElement('form');
        newButtonForm.setAttribute('id', 'new-button-form');
        senatorInfoLocation.appendChild(newButtonForm);

        // <div class='form-group'>
        var divGroup = document.createElement('div');
        divGroup.className = 'form-group';
        newButtonForm.appendChild(divGroup);

        // <label for='new-button-input'>More characters: 
        var newLabel = document.createElement('label');
        newLabel.setAttribute('for', 'new-button-input');
        newLabel.className = 'text-primary';
        newLabel.textContent = 'Enter Senator first name and last name: ';
        divGroup.appendChild(newLabel);

        // <input type='text' id='new-button-input' class='form-control'/>
        var newInput = document.createElement('input');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('id', 'new-button-input');
        newInput.className = 'form-control bg-primary text-light input-fields';

        newInput.setAttribute('onfocus', "this.value=''");
        newInput.setAttribute('value', this.newInputValue);
        newInput.setAttribute('data-toggle', 'tooltip');
        newInput.setAttribute('data-placement', 'top');
        newInput.setAttribute('title', 'Input your own favorite character here');
        divGroup.appendChild(newInput);

        // <input type='submit' class='form-control' id='add-new-button' value='Submit here, Doh!/>
        var newInputButton = document.createElement('input');
        newInputButton.setAttribute('type', 'submit');
        newInputButton.className = 'form-control bg-primary text-light input-fields';
        newInputButton.setAttribute('id', 'add-new-button');
        newInputButton.setAttribute('value', 'Submit here');
        divGroup.appendChild(newInputButton);
    },

    initSenatorArea: function() {
        // create the parent div for the senator area
        var parentDivSen = document.createElement('div');
        parentDivSen.className = 'container text-muted';
        
        // create the row div for the senators
        var rowDivSen = document.createElement('div');
        rowDivSen.setAttribute('id', 'senators-appear-here');
        rowDivSen.setAttribute('class', 'flex-row');
        // append the row to the parent
        parentDivSen.appendChild(rowDivSen);
        // append the parent to the senator area
        senatorInfoLocation.appendChild(parentDivSen);

    },

    createAndAppendNewButton: function(newButtonName) {
        // create a button
        var newButton = document.createElement('button');
        newButton.setAttribute('type', 'button');
        newButton.className = 'button btn btn-primary';
        
        newButton.setAttribute('data-name', newButtonName);
        newButton.textContent = newButtonName;
        document.getElementById('button-parent').appendChild(newButton);
    },

    // Function for displaying buttons
    renderButtons: function() {
        this.topics.forEach(function(buttonName) {
            senateInfo.createAndAppendNewButton(buttonName);
        });
    
    },

    addNewButton: function(newButtonName) {
        // add this name to button array
        this.topics.push(newButtonName);
        // remove old buttons
        var btnParent = document.getElementById('button-parent');
        while (btnParent.firstChild) {
            btnParent.removeChild(btnParent.firstChild);
        }
        // create new buttons
        this.renderButtons();
    },
}; // end senateInfo object literal

//***************** */
// run this code when we load the page
//***************** */
$(document).ready(function() {
    // get the initial member info
    queryAllMembersAPI();
    // initialize the page
    senateInfo.initButtons();
    senateInfo.initForm();
    senateInfo.initSenatorArea();

    // Add a new button 
    $('#new-button-form').on("click", '#add-new-button', function(event) {
        // Using a submit button/input  instead of a regular button/input allows the user to hit
        // "Enter" instead of clicking the button if desired
        // the prevent default line prevents the form reload/action when this happens
        event.preventDefault();
        console.log("in click event.");

        // grab the text and clear the input field
        var inputButtonName = $('#new-button-input').val();
        // add the new button to the list
        if (inputButtonName && inputButtonName !== senateInfo.newInputValue) {
            senateInfo.addNewButton(inputButtonName);
            $('#new-button-input').val("");
        }
    });

    // One of the buttons has been clicked - perform button's action
    $("#button-parent").on("click", '.button', function() {
        console.log('button clicked: ' + $(this).attr('data-name'));
        // create a Member class, save it in the senators array
        // this gives each senator it's own data and queries 
        // so that there will be no overwriting of info between senators
        senatorsArray[senatorArrayIndex] = new Member($(this).attr('data-name'));
        // display the intial senator info 
        // - all of this data comes from the all members search done on startup
        senatorsArray[senatorArrayIndex].buildCardForMember();
        // now query for campaign data for the years in question
        senatorsArray[senatorArrayIndex].queryCampaignFinancesAPI();
        senatorArrayIndex++; 
    });
});