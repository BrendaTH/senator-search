// app.js 
// US Senators by Brenda Thompson
// links of interest
// https://www.senate.gov/pagelayout/history/a_three_section_with_teasers/Explore_Senate_History.htm
//***************** */
// globals
//***************** */
var senatorInfoLocation = document.getElementById('senator-data');

// storage for each senator as they are clicked on for info
var senatorsArray = [];
var senatorArrayIndex = 0;

// storage for propublica query response on 'all members'
// we do this on startup
var allMembersArray = [];

// storage for fec query response for info on all senatorial 
// candidates in the 2016 and 2018 elections
var fec2018SenatorCandidates =[];
var fec2016SenatorCandidates = [];
//***************** */
// functions
//***************** */
// allMembersQueryResponse - handles the asynch response from the queryAllMembersAPI
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

// fec.gov api query response handling
// stores the response in the fec[year]SenatorCandidates array (global)
function fecQueryResponse(response) {
    // because we are in a callback there is no 'this', and no way to tell which senator had the error
    console.log('fec query response');
    if (!response.results) {
        console.log('error in fec query responseresults');
        console.log(response);
        return;
    }
    console.log(response.results);
    // the results come back in two pages, so we have to concat the array
    fec2018SenatorCandidates = fec2018SenatorCandidates.concat(response.results);
    console.log("FEC 2018 Senator Candidates");
    console.log(fec2018SenatorCandidates);

    // bjt bjt bjt
    if (fec2018SenatorCandidates.length > 100) {
        for (var i = 0; i < fec2018SenatorCandidates.length; i++) {
            var cidArray = fec2018SenatorCandidates[i].candidate_id.split('');
            if (cidArray[2] === 'M' && cidArray[3] === 'A') {
                console.log("name is: " + fec2018SenatorCandidates[i].name + "candidate id = " + fec2018SenatorCandidates[i].candidate_id);
                console.log('cycles: ' + fec2018SenatorCandidates[i].cycles);
            }
        }
    }

}

function fecQueryResponseError(error) {
    console.log('fec query hit an error: ' + error);
}

function queryFec2018SenateCandidates() {
    //**************************************************** */
    // fec api query
    // http://api.open.fec.gov/v1/candidate/{candidate_id}/history
    // warren committee for president C00693234 warren P00009621
    // https://www.fec.gov/data/candidate/P00009621/?cycle=2020&election_full=false
    // obama P80003338
    var fecAPIKey = 'i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';
    // curl -X GET "https://api.open.fec.gov/v1/candidates/search/?office=P&page=1&sort=name&sort_nulls_last=false&per_page=20&candidate_status=C&cycle=2020&sort_null_only=false&api_key=" + fecAPIKey + "&sort_hide_null=true" -H "accept: application/json"
    //var fecQuery = 'http://api.open.fec.gov/v1/candidate/P00009621/?cycle=2020&election_full=false&api_key=i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';
    // president 2020var fecQuery = 'http://api.open.fec.gov/v1/candidates/?cycle=2020&office=P&candidate_status=C&api_key=' + fecAPIKey;
    // history of candidate'http://api.open.fec.gov/v1/candidate/P00009621/history?api_key=i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';

    // searches for senators involved in the 2018 race (there are 121 repsonses max is 100 per page)
    // we request two pages 65 on this one and 65 on the next 
    var fecQuery = 'http://api.open.fec.gov/v1/candidates/?cycle=2018&office=S&per_page=65&candidate_status=C&api_key=' + fecAPIKey
        
    $.ajax({
        // fec.gov query for senators involved in the 2018 race
        url: fecQuery,
        method: "GET",
    })
    .then(this.fecQueryResponse)
    .catch(this.fecQueryResponseError);
    
    // page 2 search
    var fecQueryPage2 = 'http://api.open.fec.gov/v1/candidates/?cycle=2018&office=S&per_page=65&page=2&candidate_status=C&api_key=' + fecAPIKey;
    $.ajax({
        // fec.gov query
        url: fecQueryPage2,
        method: "GET",
    })
    .then(this.fecQueryResponse)
    .catch(this.fecQueryResponseError);
}

//***************** */
// objects and classes
//***************** */
class Member {
    constructor (nameStr) {
        var nameArray = nameStr.split(" ");
        this.lastName = nameArray[1];
        this.firstName = nameArray[0];
        this.authorizedCommittees = [];
        // you need to declare your var properties here to make it clear bjt

        if (this.lastName === 'Warren') {
            // such a hack. for whatever reason warren's name doesn't show up in the fec senate candidate id search
            // this is her fec senate id so it should do
            this.fecCandidateId = 'S2MA00170';
        }
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
        var infoHtml = '<a href="https://www.' + this.lastName +      '.senate.gov" target="_blank">Web Site</a>';
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

    // propublica api query response handling
    campaignFinanceQueryResponse(response) {
        // because we are in a callback there is no 'this', and no way to tell which senator had the error
        if (response.status !== 'OK') {
            console.log('An error in campaign Finance Query Response');
            console.log(response);
            return;
        }
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

    }
    // passed this in the ajax context setting so we have it
    responseFecForCommiteesPerCandidate(response) {
        console.log("fecCommitteeQueryResponse ");
        console.log(this.lastName);

        if (!response.results) {
            console.log('error in fec committee query response results');
            console.log(response);
            return;
        }
        console.log(response.results);
        var resp = response.results;
        var authorizedCommittees = [];
        var candidateId;

        // go thru the response and look for the committees of interest
        // we are only interested in those that are A-authorized or P-primary
        for (var i = 0; i < resp.length; i++) {
            var name = resp[i].name;
            var candIdCount = resp[i].candidate_ids.length;
            var designation = resp[i].designation;
            designation = designation === 'J' ? 'Joint' : designation === 'A' ? 'Authorized' : designation === 'U' ? 'Unauthorized' : designation === 'P' ? 'Principle' : designation;
            console.log(i + " Committee Name is: " + name + " candidateId count " + candIdCount + ' designation is: ' + designation);
            if (designation === 'Authorized' || designation === 'Principle') {
                this.memberAuthorizedCommittees.push(resp[i].committee_id);
            }
        }
        console.log("authorized and principle committed ids are " + this.memberAuthorizedCommittees);

        // now append a clickable item to this card to allow the user to gather more detailed info on campaign finance
        var clickableItem = '<div class="pbj">click for campaign finance details</div>';
        // find the last name of this senator so you can find the id in the html
        var nameStr = response.results[0].name;
        var nameArray = nameStr.split(',');
        var idName = "#" + this.lastName.toUpperCase();
        $(idName).append(clickableItem);
    }

    errorFecForCommiteesPerCandidate(error) {
        console.log("fecCommittteeQueryError processing " + error + ' ' + this.firstName + ' ' + this.lastName) ;
    }

    queryFecForCommiteesPerCandidate() {
        // find the candidate id for this member by searching through names in fec2018SenatorCandidates 
        // candidate id changes when the office changes
        // senator warren has a candidate_id but presidential candidate warren has a different candidate_id
        // but we are only dealing with senate members here so if we already have it lets not search again
        // bjt break this up into it's own method
        if (!this.fecCandidateId) {
            // this member doesn't already have the candidateId, lets search for it
            for (var i = 0; i < fec2018SenatorCandidates.length; i++) {
                var nameArray = fec2018SenatorCandidates[i].name.split(",");
                if (this.lastName.toUpperCase() === nameArray[0]) {
                    this.fecCandidateId = fec2018SenatorCandidates[i].candidate_id;
                    break;
                }
            }
            // if we didn't find it return
            if (!this.fecCandidateId) { return; }
            console.log('fec candidate id for ' + this.lastName + ' is: ' + this.fecCandidateId);
        }

        // now lets search for the committees
        var fecAPIKey = 'i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';
        // /candidate/{candidate_id}/committees/
        var fecQuery = 'http://api.open.fec.gov/v1/candidate/' + this.fecCandidateId + '/committees/?&api_key=' + fecAPIKey
        $.ajax({
            // fec.gov query for senators involved in the 2018 race
            url: fecQuery,
            method: "GET",
            context: this,
        })
        .then(this.responseFecForCommiteesPerCandidate)
        .catch(this.errorqueryFecForCommiteesPerCandidate);
    }

    getCampaignFinanceDetails() {
        alert("Mmm... Peanut Butter Jelly Time." + this.lastName);
        // now lets take each committee id and search for some info
        var fecAPIKey = 'i24dHGikX6D7nn8ilW0yct1WdE67QI6udYyNJ8J8';
        // /candidate/{candidate_id}/committees/
        var fecQuery = 'http://api.open.fec.gov/v1/candidate/' + this.fecCandidateId + '/committees/?&api_key=' + fecAPIKey
        $.ajax({
            // fec.gov query for senators involved in the 2018 race
            url: fecQuery,
            method: "GET",
            context: this,
        })
        .then(this.responseFecForCommiteesPerCandidate)
        .catch(this.errorqueryFecForCommiteesPerCandidate);
    }

    // define all getters and setters here
    get memberLastName() {return this.lastName;}
    set memberLastName(name) {this.lastName = name;}
    get memberFirstName() {return this.firstName;}
    set memberFirstName(name) {this.firstName = name;}
    get memberIdentifier() {return this.memberId;}
    set memberIdentifier(id) {this.memberId = id;}
    get memberAuthorizedCommittees() { return this.authorizedCommittees;}
    set memberAuthorizedCommittees(authCommitteeArray) {this.authorizedCommittees = authCommitteeArray}

} // close Member class

var senateInfo = {
    topics: ['Lamar Alexander', 'Jeannne Shaheen', 'Maggie Hassan', 'Susan Collins', 'Angus King', 'Elizabeth Warren', 'Ed Markey', 'Mitch McConnell', 'Chuck Schumer'],
    newInputValue: 'enter a senator here for new button',
    initButtons: function() {

        // hang the parent button off of the body
        // prepend to ensure the buttons are at the top of the page
        var divNode = document.createElement('div');
        divNode.setAttribute('id', 'button-parent');
        senatorInfoLocation.prepend(divNode);
        this.renderButtons();

        // create instructions for buttons and form
        var instructionNode = document.createElement('p');
        instructionNode.className = 'text-light bigger-font';
        instructionNode.textContent = 'Click on a button to find info on the senator';
        senatorInfoLocation.prepend(instructionNode);
        
    },

    initForm: function() {
        // <form id='new-button-form'>
        var newButtonForm = document.createElement('form');
        newButtonForm.setAttribute('id', 'new-button-form');
        senatorInfoLocation.prepend(newButtonForm);

        // <div class='form-group'>
        var divGroup = document.createElement('div');
        divGroup.className = 'form-group';
        newButtonForm.appendChild(divGroup);

        // <label for='new-button-input'>More characters: 
        var newLabel = document.createElement('label');
        newLabel.setAttribute('for', 'new-button-input');
        newLabel.className = 'text-light bigger-font';
        newLabel.textContent = 'To add button enter senator first and last name';
        divGroup.appendChild(newLabel);

        // <input type='text' id='new-button-input' class='form-control'/>
        var newInput = document.createElement('input');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('id', 'new-button-input');
        newInput.className = 'form-control form-control-lg bg-danger text-light input-fields';

        // newInput.setAttribute('placeholder', this.newInputValue);
        // newInput.setAttribute('data-toggle', 'tooltip');
        // newInput.setAttribute('data-placement', 'top');
        // newInput.setAttribute('title', 'Input senator first name and last name here');
        divGroup.appendChild(newInput);

        // <input type='submit' class='form-control' id='add-new-button' value='Submit here, Doh!/>
        var newInputButton = document.createElement('input');
        newInputButton.setAttribute('type', 'submit');
        newInputButton.className = 'form-control bg-danger btn-lg text-light input-fields';
        newInputButton.setAttribute('id', 'add-new-button');
        newInputButton.setAttribute('value', 'Submit here');
        divGroup.appendChild(newInputButton);
    },

    createAndAppendNewButton: function(newButtonName) {
        // create a button
        var newButton = document.createElement('button');
        newButton.setAttribute('type', 'button');
        newButton.className = 'button btn btn-danger btn-lg';
        
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
    queryFec2018SenateCandidates();
    // queryFec2016SenateCandidates();
    // initialize the page
    senateInfo.initForm();
    senateInfo.initButtons();
    // bjt senateInfo.initSenatorArea();

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
        // put the fec query on hold for now
        // senatorsArray[senatorArrayIndex].queryFecForCommiteesPerCandidate();

        senatorArrayIndex++; 
    });

    $("#senators-appear-here").on("click", ".pbj", function(event) {
        var lastName = event.target.parentNode.id;
        var senate = senatorsArray;
        for (var i = 0; i < senate.length; i++) {
            if (senate[i].memberLastName.toUpperCase() === lastName) {
                senate[i].getCampaignFinanceDetails();
                break;
            }
        }

    });
});