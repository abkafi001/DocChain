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

        var match = true;
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // const result = await contract.evaluateTransaction('AuthorizeUser', 'satoshi', '');
        // console.log(result.toString());

        let user = null;
        const express = require('express');
        // const { readdirSync } = require('fs');
        const app = express();

        const port = process.env.port || 3000;

        app.use(express.static(path.join(__dirname, 'public')));
        app.use(express.urlencoded({extended: false}));
        app.use(express.json());

        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views/pages'));

        app.get('/', (req, res) => {
            res.render('index', {match: match});
            match = true;
        });

        const AuthorizeUserMiddleware = async (req, res, next) => {
            try{
                const {username, password} = req.body;
                match = true;
                const result = await contract.evaluateTransaction('AuthorizeUser', username, password);
                if(result.toString() != true){
                    match = false;
                }
                next();
            }
            catch (error) {
                next(error);
            }
        }

        app.post('/dashboard', AuthorizeUserMiddleware, (req, res) => {
            
            if(match){
                user = req.body;
                res.render('dashboard');
            }
            else{
                console.log(`User: ${username} Password: ${password}`)
                res.redirect('/')
            }
        });

        app.listen(port, (err)=> {
            if(err){
                console.log(err);
            }
            console.log(`App is listening on port ${port}`);
        });

        // Disconnect from the gateway.
        //await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
