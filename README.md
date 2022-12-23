# media-library-azure

[![Build and Test](https://github.com/uraisg/media-library-azure/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/uraisg/media-library-azure/actions/workflows/build-and-test.yml)
[![CodeQL](https://github.com/uraisg/media-library-azure/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/uraisg/media-library-azure/actions/workflows/codeql-analysis.yml)

# What is it?
Media Library implements the capabilities of internet uploading and intranet retrieval. Any devices are given rights to upload images, in return, AI tools are used to scan through images and showcase taggings on images. URA staff will be given the access rights to retrieve the images, search through image gallery (using search and filters), and retrieve details on image.

# Structure
## Internet
- User will be logging in through Azure AD.
- Image will be analysed using [Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/).
- Image will be returned with taggings.
- Image is stored in blob/table storage.

## Intranet
- User will be logging in through Azure AD.
- Retrieval of images in blob storage.
- Search function using [Azure Cognitive Search](https://azure.microsoft.com/en-us/products/search/) to filter images accordingly - geospatial or indexing.
- Retrival of details using API.

# Local development
## Prerequisites
- IDE: Choose between
  - [Visual Studio 2022](https://visualstudio.microsoft.com/vs/) and (optionally) [NPM Task Runner](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.NPMTaskRunner) extension
  - [Visual Studio Code](https://code.visualstudio.com/) and [C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)
- [.NET 6 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/6.0) (normally installed with VS2022, install separately if using VS Code)
- [Node.js](https://nodejs.org/) (minimum v16 required)

## Running locally
A few settings files need to be set up before the apps can properly function. Create `appsettings.json` files in each project folder using `appsettings.sample.json` as a reference template and updating variables with your own values.

When running locally, do note that the MSBuild build process *does not* automatically run the frontend assets bundling steps. THis has to be run separately with Node.js, either by using NPM Task Runner and configure `watch` script to run after build, or running `npm run watch` command manually in a separate shell.
