# senator search
### 

This is a mock up of some logic for project 1.
It queries the propublica api for all senators. Then searches for a particular senator to get the id/memberId/BioGuide Id (whatever you want to call it). With this id it queries the propublica api again for a specific senator. 

It then displays an image of the senator (found at https://theunitedstates.io/images/congress/(size)/memberID.jpg), their name, party affiliation, and a link to thier senate.gov website (last two items were pulled from the propublicas website).

The code is based on the giftastic hw done in week 6. As this is only a mockup there are some bugs. Notably: 
* It only searches on last name. Senators with the same last name won't be found
* Likewise senators with middle names won't be found
* I'm sure there are many others.


To get started go [here:](https://brendath.github.io/senator-search)


