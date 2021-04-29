/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const timeFormat = "03:04 PM, 02 January, 2006"

var docCount int = 0
var userCount int = 0

type SmartContract struct {
	contractapi.Contract
}

//Document contains basic details and the hash of it
type Document struct {
	Name           string `json:"name"`
	Url            string `json:"url"`
	IssuedBy       string `json:"issuedBy"`
	DateOfIssuance string `json:"dateOfIssuance"`
	HashedDoc      string `json:"hashedDoc"`
	DocType        string `json:"docType"`
}

type User struct {
	UserName string `json:"userName"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	DocType  string `json:"docType"`
}

// DocumentQueryResult structure used for handling result of query for Document
type DocumentQueryResult struct {
	Key    string `json:"Key"`
	Record *Document
}

// DocumentQueryResult structure used for handling result of query for Document
type UserQueryResult struct {
	Key    string `json:"Key"`
	Record *User
}

// InitLedger adds a base set of documents to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {

	loc, err := time.LoadLocation("Asia/Dhaka")

	if err != nil {
		return fmt.Errorf("Failed to load location. %s", err.Error())
	}

	var user = User{
		UserName: "satoshi",
		Name:     "Satoshi Nakamoto",
		Email:    "satoshi@vistomail.com",
		Password: "f6d1015e17df348f2d84b3b603648ae4bd14011f4e5b82f885e45587bcad48947d37d64501dc965c0f201171c44b656ee28ed9a5060aea1f2a336025320683d6",
		DocType:  "USER",
	}

	var documents = []Document{

		Document{
			Name:           "Bitcoin: A Peer-to-Peer Electronic Cash System",
			Url:            "https://bitcoin.org/bitcoin.pdf",
			IssuedBy:       "satoshi",
			DateOfIssuance: time.Now().In(loc).Format(timeFormat),
			HashedDoc:      "dac729a8acf4b8a88f73f5bd84206c34e01e0992efa251b772f68696e2c2539c9ed0090e73ef6b87dc24e3177c6fd5341c3e9e24ef14267ce07ab9428aeed897",
			DocType:        "Whitepaper",
		},
	}

	for i, document := range documents {
		documentAsBytes, _ := json.Marshal(document)
		err := ctx.GetStub().PutState("DOCUMENT"+strconv.Itoa(i), documentAsBytes)

		if err != nil {
			return fmt.Errorf("Failed to put document to world state. %s", err.Error())
		}
	}

	userAsBytes, _ := json.Marshal(user)
	err = ctx.GetStub().PutState("USER0", userAsBytes)

	if err != nil {
		return fmt.Errorf("Failed to put user to world state. %s", err.Error())
	}

	return nil
}

// CreateDocument adds a new document to the world state with given details
func (s *SmartContract) CreateDocument(ctx contractapi.TransactionContextInterface, name string, url string, issuedBy string, hashedDoc string, docType string) error {

	loc, err := time.LoadLocation("Asia/Dhaka")

	if err != nil {
		return fmt.Errorf("Failed to load location. %s", err.Error())
	}

	document := Document{
		Name:           name,
		Url:            url,
		IssuedBy:       issuedBy,
		DateOfIssuance: time.Now().In(loc).Format(timeFormat),
		HashedDoc:      hashedDoc,
		DocType:        docType,
	}

	documentAsBytes, _ := json.Marshal(document)
	docCount++
	return ctx.GetStub().PutState("DOCUMENT"+strconv.Itoa(docCount), documentAsBytes)
}

func (s *SmartContract) CreateUser(ctx contractapi.TransactionContextInterface, userName string, name string, email string, password string) error {
	user := User{
		UserName: userName,
		Name:     name,
		Email:    email,
		Password: password,
		DocType:  "USER",
	}

	userAsBytes, _ := json.Marshal(user)

	userCount++
	return ctx.GetStub().PutState("USER"+strconv.Itoa(userCount), userAsBytes)
}

// QueryDocument returns the document stored in the world state with given id
func (s *SmartContract) QueryDocument(ctx contractapi.TransactionContextInterface, documentNumber string) (*Document, error) {
	documentAsBytes, err := ctx.GetStub().GetState(documentNumber)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if documentAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", documentNumber)
	}

	document := new(Document)
	_ = json.Unmarshal(documentAsBytes, document)

	return document, nil
}

// QueryAllRecords returns all records found in world state
func (s *SmartContract) QueryAllRecords(ctx contractapi.TransactionContextInterface) ([]DocumentQueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []DocumentQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		document := new(Document)
		err = json.Unmarshal(queryResponse.Value, document)

		if err != nil {
			continue
		}

		documentQueryResult := DocumentQueryResult{Key: queryResponse.Key, Record: document}
		results = append(results, documentQueryResult)
	}

	return results, nil
}

//Intermediary function to be used by other functions when needed (will never be invoked from outside of the chaincode body)
// func QueryByQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]DocumentQueryResult, error) {

// 	results, err := getQueryResultForQueryString(ctx, queryString)

// 	if err != nil {
// 		return nil, err
// 	}

// 	// var documents []Document
// 	// var result []*Document
// 	// // for _, documentAsByte := range documentAsBytes{
// 	// // 	var tempDocument Document
// 	// err = json.Unmarshal(documentAsBytes, documents)
// 	// // 	if err != nil {
// 	// // 		return nil, err
// 	// // 	}
// 	// // 	documents = append(documents, tempDocument)
// 	// // }
// 	// for _, document := range documents {
// 	// 	result = append(result, &document)
// 	// }

// 	return results, nil

// }

//Intermediary function to be used by other functions when needed (will never be invoked from outside of the chaincode body)
func getDocumentQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]DocumentQueryResult, error) {

	fmt.Printf("- getDocumentQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}

	defer resultsIterator.Close()

	results := []DocumentQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		document := new(Document)
		_ = json.Unmarshal(queryResponse.Value, document)

		documentQueryResult := DocumentQueryResult{Key: queryResponse.Key, Record: document}
		results = append(results, documentQueryResult)
	}

	return results, nil

	// // buffer is a JSON array containing QueryRecord
	// var buffer bytes.Buffer
	// buffer.WriteString("[")
	// bArrayMemberAlreadyWritten := false
	// for resultsIterator.HasNext() {
	// 	queryResponse, err := resultsIterator.Next()
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	// Add a comma before array members, suppress it for the first array member
	// 	if bArrayMemberAlreadyWritten == true {
	// 		buffer.WriteString(",")
	// 	}
	// 	buffer.WriteString("{\"Key\":")
	// 	buffer.WriteString("\"")
	// 	buffer.WriteString(queryResponse.Key)
	// 	buffer.WriteString("\"")
	// 	buffer.WriteString(", \"Record\":")
	// 	// Record is a JSON object, so we write as-is
	// 	buffer.WriteString(string(queryResponse.Value))
	// 	buffer.WriteString("}")
	// 	bArrayMemberAlreadyWritten = true
	// }
	// buffer.WriteString("]")
	// fmt.Printf("- getDocumentQueryResultForQueryString documentQueryResult:\n%s\n", buffer.String())
	// return buffer.Bytes(), nil

}

//Intermediary function to be used by other functions when needed (will never be invoked from outside of the chaincode body)
func getUserQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]UserQueryResult, error) {

	fmt.Printf("- getDocumentQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}

	defer resultsIterator.Close()

	results := []UserQueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		user := new(User)
		_ = json.Unmarshal(queryResponse.Value, user)

		userQueryResult := UserQueryResult{Key: queryResponse.Key, Record: user}
		results = append(results, userQueryResult)
	}

	return results, nil
}

func (s *SmartContract) QueryDocumentByHash(ctx contractapi.TransactionContextInterface, hashedDoc string) ([]DocumentQueryResult, error) {

	var queryString = "{\"selector\": { \"hashedDoc\" : \"" + hashedDoc + "\"}}"

	results, err := getDocumentQueryResultForQueryString(ctx, queryString)

	if err != nil {
		return nil, err
	}

	return results, nil
}

func (s *SmartContract) QueryDocumentByUrl(ctx contractapi.TransactionContextInterface, url string) ([]DocumentQueryResult, error) {

	var queryString = "{\"selector\": { \"url\" : \"" + url + "\"}}"

	results, err := getDocumentQueryResultForQueryString(ctx, queryString)

	if err != nil {
		return nil, err
	}

	return results, nil
}

func (s *SmartContract) QueryDocumentByUserName(ctx contractapi.TransactionContextInterface, userName string) ([]DocumentQueryResult, error) {

	var queryString = "{\"selector\": { \"issuedBy\" : \"" + userName + "\"}}"

	results, err := getDocumentQueryResultForQueryString(ctx, queryString)

	if err != nil || results == nil || len(results) == 0 {
		return nil, err
	}

	return results, nil
}

func (s *SmartContract) ChangePassword(ctx contractapi.TransactionContextInterface, userName string, newPassword string) error {

	queryString := "{\"selector\": { \"userName\" : \"" + userName + "\"}}"

	results, err := getUserQueryResultForQueryString(ctx, queryString)

	if err != nil {
		return err
	}

	user := results[0].Record

	user.Password = newPassword

	userAsBytes, _ := json.Marshal(user)

	return ctx.GetStub().PutState(results[0].Key, userAsBytes)
}

func (s *SmartContract) GetUser(ctx contractapi.TransactionContextInterface, username string, password string) ([]UserQueryResult, error) {

	queryString := "{\"selector\": { \"userName\" : \"" + username + "\"}}"

	results, err := getUserQueryResultForQueryString(ctx, queryString)

	if err != nil || results == nil || len(results) == 0 {
		return nil, err
	}

	if results[0].Record.Password == password {
		return results, nil
	}
	return nil, err
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create fabcar chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
	}
}
