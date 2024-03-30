import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Wenb3Model from "web3modal";
import {
  activeChainId,
  SafeBuyABI,
  SafeBuyAddress,
  CompanyNFTABI,
} from "./constants";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(SafeBuyAddress, SafeBuyABI, signerOrProvider);

const APIURL = "https://api.studio.thegraph.com/query/69527/temp_graph/0.0.7";
// https://api.studio.thegraph.com/query/69527/temp_graph/0.0.7

export const SafeBuyContext = React.createContext();

export const useSafeBuyContext = () => useContext(SafeBuyContext);

export const SafeBuyProvider = ({ children }) => {
  const { currentAccount } = useAuth();

  const connectingWithSmartContract = async () => {
    try {
      const web3Modal = new Wenb3Model();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = fetchContract(signer);
      console.log(contract);
      return contract;
    } catch (error) {
      console.log("Something went wrong while connecting with contract!");
    }
  };

  const registerUser = async (
    userAdd,
    name,
    emailId,
    mobileNo,
    gender,
    age
  ) => {
    const contract = await connectingWithSmartContract();
    if (currentAccount) {
      const data = await contract.registerUser(
        userAdd,
        name,
        emailId,
        mobileNo,
        gender,
        age
      );
      console.log(data);
    }
  };

  const registerCompany = async (comAdd, name, cin) => {
    const contract = await connectingWithSmartContract();
    if (currentAccount) {
      const company = await contract.registerCompany(comAdd, name, cin);
      console.log(company);
    }
  };

  const acceptCompany = async (comAdd) => {
    const contract = await connectingWithSmartContract();
    if (currentAccount) {
      await contract.acceptCompany(comAdd);
    }
  };

  const rejectCompany = async (comAdd) => {
    const contract = await connectingWithSmartContract();
    if (currentAccount) {
      await contract.rejectCompany(comAdd);
    }
  };

  const verifyUser = async (gender) => {
    console.log("Verify user context called")
    const contract = await connectingWithSmartContract();
    if (currentAccount) {
      console.log(currentAccount);
      const transaction = await contract.verifyUser(gender);
      const receipt = await transaction.wait();
      return receipt;
    }
    return "No account";
  };

  const getTokenURI = async (contractAddress, id) => {
    const contract = await connectingWithSmartContract();
    const data = await contract.tokenURI(id);
    return data;
  };

  const fetchUserByAddress = async (userAddress) => {
    const query = `
	query getUsersData {
		userEvents(orderBy: blockTimestamp
      orderDirection: desc
      where: {userAdd: "${userAddress}"}
      first: 1) {
		  age
		  blockNumber
		  blockTimestamp
		  email
		  gender
		  id
		  mobileNo
		  name
		  transactionHash
		  userAdd
		  userId
      isVerified
		}
	  }
			`;
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    console.log("Subgraph data: ", res.data);

    if (res.data.userEvents.length > 0) {
      return res.data.userEvents[0];
    } else {
      return { name: "" };
    }
    // return user;
  };

  const fetchCompanyByAddress = async (companyAddress) => {
    const query = `query MyQuery {
      companyEvents(where: {comAdd: "${companyAddress}", isApproved: ${true}}){
        blockNumber
        blockTimestamp
        cin
        comAdd
        companyId
        companyNFTAddress
        id
        isApproved
        isRejected
        name
        transactionHash
      }
    }`;
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    return res.data.companyEvents[0];
  };

  const fetchActiveRequests = async () => {
    const query = `query MyQuery {
      companyEvents {
        blockNumber
        blockTimestamp
        cin
        comAdd
        companyId
        companyNFTAddress
        id
        isApproved
        isRejected
        name
        transactionHash
      }
    }`;

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    console.log("Subgraph data: ", res.data);
    const logs = res.data.companyEvents;
    let latestLogs = {};

    logs.forEach((log) => {
      if (!log.isApproved && !log.isRejected) {
        if (
          !latestLogs[log.comAdd] ||
          parseInt(log.blockTimestamp) >
            parseInt(latestLogs[log.comAdd].blockTimestamp)
        ) {
          latestLogs[log.comAdd] = log;
        }
      } else {
        delete latestLogs[log.comAdd];
      }
    });

    return Object.values(latestLogs);
  };

  const fetchAllCompanies = async () => {
    const query = `query MyQuery {
      companyEvents(where: {isApproved: ${true}}){
        blockNumber
        blockTimestamp
        cin
        comAdd
        companyId
        companyNFTAddress
        id
        isApproved
        isRejected
        name
        transactionHash
      }
    }`;
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });

    if (res.data.companyEvents.length > 0) {
      return res.data.companyEvents;
    } else {
      return [];
    }
  };

  const fetchCompanyUsingCIN = async (cin) => {
    const query = `query MyQuery {
      companyEvents(where: {cin: ${cin}, isApproved: ${true}}){
        blockNumber
        blockTimestamp
        cin
        comAdd
        companyId
        companyNFTAddress
        id
        isApproved
        isRejected
        name
        transactionHash
      }
    }`;
    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });

    if (res.data.companyEvents.length > 0) {
      return res.data.companyEvents[0];
    } else {
      return null;
    }
  };

  const addProduct = async (name, price) => {
    const contract = await connectingWithSmartContract();
    await contract.addProduct(name, price);
  };

  const mint = async (
    contractAddress,
    productId,
    manDate,
    exDate,
    pubKey,
    privateKey,
    tokenURI,
    validity
  ) => {
    const contract = await connectingWithSmartContract();
    await contract.mint(
      productId,
      manDate,
      exDate,
      pubKey,
      privateKey,
      tokenURI,
      validity
    );
  };

  const addBulkProducts = async (
    productId,
    pubKeys,
    privateKeys,
    manDate,
    exDate,
    tokenURI,
    validity
  ) => {
    const contract = await connectingWithSmartContract();
    await contract.addBulkProducts(
      productId,
      pubKeys,
      privateKeys,
      manDate,
      exDate,
      tokenURI,
      validity
    );
  };

  const fetchProductById = async (productId) => {
    const query = `
    query MyQuery {
      productEvents(where: {productId: "${productId}"}) {
        id
        name
        price
        productId
        transactionHash
        blockNumber
        blockTimestamp
        company
      }
    }`;

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    return res.data.productEvents[0];
  };

  const fetchAllProductItemsByProductId = async (
    productId
  ) => {
    const query = `query MyQuery {
      productItemEvents(
        where: {productId: "${productId}"}
      ) {
        blockNumber
        blockTimestamp
        ex_date
        cid
        id
        isPurchased
        itemId
        man_date
        owner
        privateKey
        productId
        pubKey
        purchasedAt
        transactionHash
        validity
      }
    }`

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });

    const logs = res.data.productItemEvents;
    let latestLogs = {};

    logs.forEach((log) => {
      if ( !latestLogs[log.itemId] ||
        parseInt(log.blockTimestamp) >
          parseInt(latestLogs[log.itemId].blockTimestamp)
      ) {
        latestLogs[log.itemId] = log;
      }
    });

    return Object.values(latestLogs);
  };

  const fetchProductItemById = async (itemId) => {
    const query = `query MyQuery {
      productItemEvents(
        where: {itemId: "${itemId}"}
        orderBy: blockTimestamp
        orderDirection: desc
        first: 1
      ) {
        blockNumber
        blockTimestamp
        ex_date
        cid
        id
        isPurchased
        itemId
        man_date
        owner
        privateKey
        productId
        pubKey
        purchasedAt
        transactionHash
        validity
      }
    }`

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    return res.data.productItemEvents[0];
  };

  const fetchProductItemByPrivateKey = async (privateKey) => {
    const query = `query MyQuery {
      productItemEvents(
        where: {privateKey: "${privateKey}"}
        orderBy: blockTimestamp
        orderDirection: desc
        first: 1
      ) {
        blockNumber
        blockTimestamp
        ex_date
        cid
        id
        isPurchased
        itemId
        man_date
        owner
        privateKey
        productId
        pubKey
        purchasedAt
        transactionHash
        validity
      }
    }`

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    return res.data.productItemEvents[0].itemId;
  };

  const fetchProductItemByPublicKey = async (publicKey) => {
    const query = `query MyQuery {
      productItemEvents(
        where: {pubKey: "${publicKey}"}
        orderBy: blockTimestamp
        orderDirection: desc
        first: 1
      ) {
        blockNumber
        blockTimestamp
        ex_date
        cid
        id
        isPurchased
        itemId
        man_date
        owner
        privateKey
        productId
        pubKey
        purchasedAt
        transactionHash
        validity
      }
    }`

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    return res.data.productItemEvents[0].itemId;
  };

  const buyProduct = async (privateKey, tokenURI) => {
    const contract = await connectingWithSmartContract();
    await contract.buyProduct(privateKey, tokenURI);
  };

  const checkState = async (pubKey) => {
    const contract = await connectingWithSmartContract();
    const data = await contract.checkState(pubKey);
    return data;
  };

  const checkIfAlreadyPurchased = async (pubKey) => {
    const contract = await connectingWithSmartContract();
    const data = await contract.checkIfAlreadyPurchased(pubKey);
    return data;
  };

  const fetchUserItems = async () => {
    const contract = await connectingWithSmartContract();
    const data = await contract.fetchUserItems();
    return data;
  };

  const fetchAllItems = async (contractAddress) => {
    const contract = await connectingWithSmartContract();
    const data = await contract.fetchAllItems();
    console.log(data);
    return data;
  };

  const fetchAllProducts = async (companyAddress) => {
    console.log(companyAddress)
    const query = `
    query MyQuery {
      productEvents(where: {company: "${companyAddress}"}) {
        id
        name
        price
        productId
        transactionHash
        blockNumber
        blockTimestamp
        company
      }
    }`;

    const client = new ApolloClient({
      uri: APIURL,
      cache: new InMemoryCache(),
    });

    const res = await client.query({ query: gql(query) });
    return res.data.productEvents;


    const contract = await connectingWithSmartContract();
    const data = await contract.fetchAllProductsForCompany(companyAddress);
    return data;
  };

  const isOwnerAddress = async () => {
    const contract = await connectingWithSmartContract();
    const data = await contract.OwnerIs();
    console.log(data);
    return data;
  };

  const uploadFilesToIPFS = async (file) => {
    try {
      // console.log(file);

      const formData = new FormData();
      formData.append("file", file);

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: "725e80b25f3f5cfbadf0",
          pinata_secret_api_key:
            "093fe3d066643fd61d9d5ff2d9684fbe7280301d8cedb8c91d9684a4bc7ac8a5",
          "Content-Type": "multipart/form-data",
        },
      });

      return resFile.data.IpfsHash;
      // const cid = await web3Storage.put(file);
      // return cid;
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAllCompaniesNFT = async () => {
    const contract = await connectingWithSmartContract();
    const data = await contract.fetchAllCompaniesNFT();
    return data;
  };

  return (
    <SafeBuyContext.Provider
      value={{
        fetchAllCompaniesNFT,
        connectingWithSmartContract,
        fetchUserByAddress,
        registerUser,
        registerCompany,
        acceptCompany,
        rejectCompany,
        fetchCompanyByAddress,
        fetchActiveRequests,
        fetchAllCompanies,
        fetchCompanyUsingCIN,
        fetchUserItems,
        fetchAllItems,
        addProduct,
        mint,
        addBulkProducts,
        fetchProductById,
        fetchAllProductItemsByProductId,
        fetchProductItemById,
        buyProduct,
        checkState,
        checkIfAlreadyPurchased,
        fetchAllProducts,
        isOwnerAddress,
        fetchProductItemByPrivateKey,
        fetchProductItemByPublicKey,
        uploadFilesToIPFS,
        getTokenURI,
        verifyUser,
      }}
    >
      {children}
    </SafeBuyContext.Provider>
  );
};
