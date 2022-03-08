# media-library-azure

[![Build and Test](https://github.com/uraisg/media-library-azure/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/uraisg/media-library-azure/actions/workflows/build-and-test.yml)
[![CodeQL](https://github.com/uraisg/media-library-azure/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/uraisg/media-library-azure/actions/workflows/codeql-analysis.yml)

# What is it?
Media Library implements the capabilities of internet uploading and intranet retrieval. Any devices are given rights to upload images, in return, AI tools are used to scan through images and showcase taggings on images. URA staffs will be given the access rights to retrieve the images, search through image gallery (using search and filters), and retrieve details on image.

# Stucture
## Internet
- User will be logging in through GCC account.
- Image will be scan using [Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/).
- Image will be returned with taggings.
- Image is stored in blob/table storage.

## Intranet`
- User will be logging in through GCC account.
- Retrieval of images in blob storage.
- Search function using [Azure Cognitive Search](https://azure.microsoft.com/en-gb/services/search/?&ef_id=Cj0KCQiA95aRBhCsARIsAC2xvfzvQwS-ryM0INNBTTZWAWe89cpJcrKThlQAqPWsOJUvsN0Ex_26wUUaAlPoEALw_wcB:G:s&OCID=AID2200252_SEM_Cj0KCQiA95aRBhCsARIsAC2xvfzvQwS-ryM0INNBTTZWAWe89cpJcrKThlQAqPWsOJUvsN0Ex_26wUUaAlPoEALw_wcB:G:s&gclid=Cj0KCQiA95aRBhCsARIsAC2xvfzvQwS-ryM0INNBTTZWAWe89cpJcrKThlQAqPWsOJUvsN0Ex_26wUUaAlPoEALw_wcB#overview) to filter images accordingly - geospatial or indexing.
- Retrival of details using API.

# Installing
- [Microsoft Visual Studio 2019](https://my.visualstudio.com/Downloads?q=visual%20studio%202019&wt.mc_id=o~msft~vscom~older-downloads)
- [Node.js v14 required - with msi extension](https://nodejs.org/download/release/v14.19.0/)
- Github on "Master" Branch
- (Optional)[NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NPMTaskRunner)

# Local Deployment
- Copy new updated appsetings.json into project according to the names of project solution.
```
Run command "npm run watch" 
OR
NPM Task Runner by configuring watch script to run after build.
```
