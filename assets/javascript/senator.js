// app.js 
// US Senators by Brenda Thompson

//***************** */
// globals
//***************** */
var senatorInfoLocation = document.getElementById('senator-data');
//***************** */
// objects
//***************** */
var senateInfo = {
    topics: ['Jeannne Shaheen', 'Maggie Hassan', 'Susan Collins', 'Angus King', 'Elizabeth Warren', 'Ed Markey', 'Mitch McConnell', 'Chuck Schumer'],
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


    // builds the query, sends it, processes and displays the results
    queryAPI: function(memberName) {
        var nameArray = memberName.split(" ");
        var lastname = nameArray[1];
        var firstname = nameArray[0];
        console.log("member name is: " + firstname + " " + lastname);
        var member_id;


        var queryAllMembers = "https://api.propublica.org/congress/v1/115/senate/members.json";
        console.log("queryAllMembersURL: " + queryAllMembers);

        $.ajax({
        url: queryAllMembers,
        method: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('X-API-Key', '5bJZH4Np16Y8EZctNxL2tv9mCWirk0A1taulPeU8'); },
        })
        .then(function(response) {
            console.log(response)
            member = response.results[0];
            console.log('response results members: ' + response.results[0].members[0].last_name);
            for (var i = 0; i < response.results[0].members.length; i++) {
                // console.log( 'index is: ' + i);
                // console.log('last name is: ' + response.results[0].members[i].last_name + " id is: " + response.results[0].members[i].id); 
                 var searchLastName = response.results[0].members[i].last_name;
                 var searchMemberId = response.results[0].members[i].id;
// bjt need to handle case of two members with the same last name
// and with middle names
                if (searchLastName === lastname) {
                    console.log( 'success');
                    member_id = searchMemberId;
                    console.log( 'member id is: ' + member_id);
                    break;
                }
            }
            if (member_id) {
                var queryMember = "https://api.propublica.org/congress/v1/members/"+member_id+".json";
                console.log("querMemberURL: " + queryMember);

                $.ajax({
                    url: queryMember,
                    method: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('X-API-Key', '5bJZH4Np16Y8EZctNxL2tv9mCWirk0A1taulPeU8'); },
                })
                .then (function(memberData) {
                    console.log('members data is: ' + memberData.results[0].url);
                    var currentParty = "";
                    switch(memberData.results[0].current_party) {
                        case 'R':
                            currentParty = 'Republican';
                            break;

                        case 'D':
                            currentParty = 'Democrat';
                            break;

                        case 'ID':
                            currentParty = 'Indepenendent';
                            break;
                    }


                    var titleHtml = '<b>Name: </b>' +  memberName;
                    var brk = document.createElement('br');
                    var partyHtml = '<b>Party Affiliation: </b>' + currentParty;
                    var anotherBrk = document.createElement('br');
                    var infoHtml = '<b>More Information at: </b>' + memberData.results[0].url;
                    var headerPara = document.createElement('p');
                    $(headerPara).append(titleHtml, brk, partyHtml, anotherBrk, infoHtml);
                

                    var senBlock = document.createElement('div');
                    senBlock.className = 'card-block';
                    // senBlock.append(headerTitle);
                    senBlock.append(headerPara);

                    var themeImage = document.createElement('img');
                    themeImage.setAttribute('src', 'https://theunitedstates.io/images/congress/225x275/' + member_id + '.jpg');
                    themeImage.className = 'card-image-top img-fluid';

                    var senColumn = document.createElement('div');
                    senColumn.append(themeImage);
                    senColumn.append(senBlock);

                    $("#senators-appear-here").prepend(senColumn);
                })
            }
        })

    },

};

//***************** */
// run this code when we load the page
//***************** */
$(document).ready(function() {
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
        senateInfo.queryAPI($(this).attr('data-name'));
    });
});