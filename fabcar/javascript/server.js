/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        ///////////////////////// Boiler plate code ////////////////////////////////////////

        ///////////////////////// Express starts from here /////////////////////////////////

        //const path = require('path');
        var renderObject = {};
        var user = null;
        renderObject.match = true;
        const hash = require('./hash');
        const express = require('express');
        // const { readdirSync } = require('fs');
        const app = express();

        const port = process.env.port || 3000;

        app.use(express.static(path.join(__dirname, 'public')));
        app.use(express.urlencoded({extended: true}));
        app.use(express.json());
        app.use((req, res, next) => {
            res.set('Cache-Control', 'no-store')
            next()
        })


        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views/pages/'));

        
        
        //////////////////////// Root end-point ////////////////////////

        app
        .route('/')
        .get((req, res) => {
            if(user != null){
                res.redirect('/dashboard');
            }
            else{
                res.render('index', renderObject);
                renderObject.match = true;
            }
            delete renderObject.submissionDone;
            delete renderObject.errorMessage;
        });
        

        /////////////////////////// Finish ///////////////////////
        


        ///////////////////////////// Sign up /////////////////////////////
        
        app
        .route('/Confirmation')
        .post( async (req, res) => {
            
            try{
                
                const username = req.body.username;
                const name = req.body.name;
                const email = req.body.email;
                const password = req.body.password;
                
                const hashedPassword = await hash.hashPassword(password);
                
                await contract.submitTransaction('CreateUser', username, name, email, hashedPassword);
                renderObject.submissionDone = true;
                throw Error('demo error');
                res.redirect('/');
            }
            catch (err) {
                renderObject.errorMessage = err;
                renderObject.submissionDone = false;
                console.log(err)
                res.redirect('/');
            }
        });
        
        ///////////////////////////// Finish //////////////////////////////
        


        /////////////////// Middleware Function begins ////////////////////

        const AuthorizeUserMiddleware = async (req, res, next) => {
            try{
                const username = req.body.username;
                const password = await hash.hashPassword(req.body.password);
                renderObject.match = true;
                console.log(username+' '+password)
                const result = await contract.evaluateTransaction('GetUser', username, password);
                console.log(result.toString());
                if(result.toString() == ''){
                    renderObject.match = false;
                }
                else{
                    const userJsonArray = JSON.parse(result);
                    user = userJsonArray[0].Record;
                    delete req.body.username;
                    delete req.body.password;
                    req.documents = await contract.evaluateTransaction('QueryDocumentByUserName', username);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        }

        ///////////////////////////// Middleware Function ends ////////////////////////




        ///////////////////////////// Dashboard end-point ///////////////////////////

        app
        .route('/dashboard')
        .get( async (req, res) => {
            console.log('second');
            try{
                if(user != null){
                    
                    renderObject.username = user.userName;
                    renderObject.password = user.password;
                    renderObject.documents = await contract.evaluateTransaction('QueryDocumentByUserName', user.userName);

                    res.render('dashboard', renderObject);
                }
                else{
                    // console.log('2');
                    res.redirect('/');
                }
                // console.log(user);
            }
            catch(err){
                console.log(err);
                user = null;
                res.redirect('/');
                console.log('third')
            }

            delete renderObject.submissionDone;
            delete renderObject.errorMessage;
            console.log('fourth')
        })
        .post(AuthorizeUserMiddleware, (req, res) => {
            
            if(renderObject.match){

                renderObject.username = user.userName;
                renderObject.password = user.password;
                renderObject.documents = req.documents;

                res.render('dashboard', renderObject);
            }
            else{
                res.redirect('/')
            }

        });

        ////////////////////////////// Finish ///////////////////////////////



        ////////////////////////////// Verify Document /////////////////////////////

        app
        .route('/verify-document')
        .get((req, res) => {
            try{
                if(user != null){
                    res.render('verify-document', renderObject);
                    delete renderObject.documentFound;
                    delete renderObject.queryResult;
                }
                else{
                    res.redirect('/');
                }
            }
            catch{
                res.redirect('/');
            }
        })

        ////////////////////////////// Finish /////////////////////////////////////



        ////////////////////////////// Verify ////////////////////////////////////

        app
        .route('/verify')
        .post( async (req, res) => {

            try{
                const selected = req.body.selected;
                console.log(selected);
                if(selected == '2') {

                    const hashedDocument = await hash.hashDocument(req.body.url);
                    console.log(req.body.url)
                    console.log('hash: ' + hashedDocument);
                    const result = await contract.evaluateTransaction('QueryDocumentByHash', hashedDocument);

                    if(result == '') {
                        consolelo.log(url)
                        renderObject.documentFound = false;
                    }
                    else {
                        console.log(result+ ' '+typeof result);
                        const resultJsonArray = JSON.parse(result);
                        console.log(resultJsonArray);
                        renderObject.documentFound = true;
                        renderObject.queryResult = resultJsonArray[0].Record;
                        res.redirect('/verify-document');
                    }
                }
                else {
                    try {
                        const result = await contract.evaluateTransaction('QueryDocument', req.body.id);
                        renderObject.queryResult = JSON.parse(result);
                        renderObject.documentFound = true;
                        console.log(renderObject.queryResult + '' +typeof renderObject.queryResult);
                        res.redirect('verify-document');
                    }
                    catch(err){
                        renderObject.documentFound = false;
                        res.redirect('back');
                        console.log('reached')
                    }
                }
            }
            catch(err) {
                console.log(err);
                res.redirect('back');
            }

        });
        


        ///////////////////////////// Logout end-point ////////////////////////////

        app
        .route('/logout')
        // .get((req, res) => {})
        .post((req, res) => {
            if(user != null){
                user = null;
                res.redirect('/');
            }
            else{
                res.redirect('/');
            }
            
            delete renderObject.submissionDone;
            delete renderObject.errorMessage;
        });

        ////////////////////////////// Finish ///////////////////////////////



        ///////////////////////////// Upload end-point ///////////////////////////

        app
        .route('/upload')
        .get((req, res) => {})
        .post( async (req, res) => {
            
            if(user != null){
                
                const name = req.body.docName;
                const url = req.body.url;
                const docType = req.body.docType;
                
                try{

                    const hashedDocument = await hash.hashDocument(url);
                    const result = await contract.evaluateTransaction('QueryDocumentByHash', hashedDocument);
                    
                    if(result.toString() == ''){
                        await contract.submitTransaction('CreateDocument', name, url, user.userName, hashedDocument, docType);
    
                        renderObject.submissionDone = true;
                        res.redirect('/dashboard');
                        console.log('first');
                    }
                    else{
                        throw Error('Document already exists in the Database.');
                    }
                }
                catch (err){
                    renderObject.submissionDone = false;
                    renderObject.errorMessage = err;
                    res.redirect('/dashboard');
                }
            }
            else{
                res.redirect('/')
            }
        });

        ////////////////////////////// Finish //////////////////////////////////


        /////////////////////////////.../////////////////////////////////

        app.post('/verification', (req, res) => {
            res.send("anon verification to be developped");
            console.log(JSON.stringify(req.body));
        });

        ///////////////////////////.../////////////////////////////



        ////////////////////// Routing ends and server starts running /////////////////////

        app.listen(port, (err)=> {
            if(err){
                console.log(err);
            }
            console.log(`App is listening on port ${port}`);
        });

        // Disconnect from the gateway.
        // await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
