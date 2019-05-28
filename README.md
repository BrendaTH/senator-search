# REPO Name: senator-search
## GITHUB Location: https://github.com/BrendaTH/senator-search

## Operation
This is a mock up of some logic for project 1 (weeks 8 and 9). I used the Giftastic repo as a starting point, but replaced the themed characters with senators in the buttons. Also it queries the propublica api (with AJAX) instead of the GIPHY api.

The first propublica API query if to get all senators. From there info on political party, senator/bioguide id for the senator, state represented, etc.. is available. This allows me to fetch a senator image, links to the senator's website and biography, and display them using flexbox.

Then two senator specific API queries (one each for 2016 and 2018) are done for the propublica campaign finance API. Some senators provide summary info on campaign finance. If it's available it is also displayed. 

Like the Giftastic repo users can click on one of the ready made buttons for senators or they can add a button for a senator of their choice.



 As this is only a mockup there are some bugs. Notably: 
* It only searches on last name. Senators with the same last name won't be found. There are none in the current senate though.
* Likewise senators with middle names won't be found
* I'm sure there are many others.

## Technology used:
* AJAX calls to the probublica API for summary info and two to the probulica campaign finance API
* If a user hits the buttons too fast the asynchronous nature of the the AJAX query will cause the response to write over, so I encapsulated each senator's data with the JavaScript class.
* Bootstrap 
* flexbox


## To get started go to:
 [https://brendath.github.io/senator-search](https://brendath.github.io/senator-search)


