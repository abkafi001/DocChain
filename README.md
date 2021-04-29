# DocChain
This is a Blockchain-based Document Verification web application.


## Introduction
The project mainly focuses on a digital document verification system that enables us to store, maintain and verify Documents of all sorts (NID, Drving License, Academic Transcript, Deed) of digital formats (PDF, JPEG, PNG, TXT, XML, TIFF, SVG) that is underpinned by Blockchain Technology, namely Hyperledger Fabric framework. Since, Hyperledger Fabric is a private Blockchain it will serve to our purpose the best.

## Technologies
* Docker
* NodeJS
* EJS View Engine
* CSS and Bootstrap framework
* Express web framework
* Hyperledger Fabric framework
* Javascript
* Go

## Environment Setup
1) Make sure you have Linux-based Operating System running on your machine.
2) Install NodeJS, Docker, Docker-Compose and git.
3) Clone this repository to your preferred local directory using `git clone https://github.com/abkafi001/DocChain.git` command on Terminal.
4) Set $PATH variable by adding `export PATH=$PATH:/path/to/the/project/directory/DocChain/bin` and `export FABRIC_CFG_PATH=/path/to/the/project/directory/DocChain/config` these two lines at the end of your **.bashrc** file located in **$HOME** directory. To open and edit **.bashrc** on an Editor run `sudo <command to launch your editor> ~/.bashrc` command on the Terminal. For instance, if you have VSCode installed, run `sudo code ~/.bashrc`command. This should open the **~/.bashrc** file on VSCode. After having added those two line and saved run `source ~/.bashrc`command.
5) Go to `/path/to/the/project/directory/fabcar/javascript` and run `npm install` to install all the required dependencies.

## Running the application
* To start the application go to `/path/to/the/project/directory/DocChain/fabcar/javascript/` and then run `npm start`. The fabric network should be up and running soon and the application should be running on localhost at an existing port (if available) or at port 3000 (otherwise) which is at `localhost:3000/`.
* To stop the application run `npm stop` from the same directory.
