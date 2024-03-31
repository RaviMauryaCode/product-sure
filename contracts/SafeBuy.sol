// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SafeBuy is ERC721URIStorage {
    address payable owner;

    struct User {
        address userAdd;
        string name;
        uint256 age;
        bool gender;
        string email;
        string mobileNo;
        bool isVerified;
    }

    struct Company {
        address comAdd;
        string name;
        string cin;
    }

    using Counters for Counters.Counter;

    Counters.Counter private productItemIds;

    mapping(uint256 => uint256) id_to_currentURI;
    mapping(uint256 => string[]) id_to_ipfsUri;

    struct Product {
        uint256 productId;
        string name;
        uint256 price;
        address company;
    }

    struct ProductItem {
        uint256 productId;
        uint256 itemId;
        string man_date;
        string ex_date;
        address owner;
        string pubKey;
        string privateKey;
        uint256 purchasedAt;
        uint256 validity;
        bool isPurchased;
        string cid;
    }

    event UserEvent(
        uint256 userId,
        address indexed userAdd,
        string name,
        uint256 age,
        bool gender,
        string email,
        string mobileNo,
        bool isVerified
    );

    event CompanyEvent(
        uint256 companyId,
        address indexed comAdd,
        string name,
        string cin,
        address companyNFTAddress,
        bool isApproved,
        bool isRejected
    );

    event ProductEvent(
        uint256 productId,
        string name,
        uint256 price,
        address company
    );

    event ProductItemEvent(
        uint256 productId,
        uint256 itemId,
        string man_date,
        string ex_date,
        address owner,
        string pubKey,
        string privateKey,
        uint256 purchasedAt,
        uint256 validity,
        bool isPurchased,
        string cid
    );

    uint256 userCount;
    uint256 companyRequestCount;
    uint256 companyCount;
    uint256 itemCount;

    mapping(uint256 => User) userMapping;
    mapping(uint256 => Company) companyMapping;
    mapping(uint256 => Company) companyRequestMapping;

    mapping(address => uint256) userAddressToIdMapping;
    mapping(address => uint256) companyAddressToIdMapping;
    mapping(address => uint256) companyAddressToIdRequestMapping;

    address private company;
    string companyName;
    string cin;

    address[] private products;
    uint256 private _totalSupply;
    uint256 private productCount;

    mapping(uint256 => ProductItem) private productItemsMapping;
    mapping(uint256 => Product) private productsMapping;
    mapping(string => uint256) privateKeyToProductItemMapping;
    mapping(string => string) pubKeyToPrivateKeyMapping;

    receive() external payable {}

    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }

    function registerUser(
        address userAdd,
        string memory name,
        string memory emailId,
        string memory mobileNo,
        bool gender,
        uint256 age
    ) public {
        userMapping[userCount] = User(
            userAdd,
            name,
            age,
            false,
            emailId,
            mobileNo,
            false
        );

        emit UserEvent(
            userCount,
            userAdd,
            name,
            age,
            false,
            emailId,
            mobileNo,
            false
        );

        userAddressToIdMapping[msg.sender] = userCount++;
    }

    function verifyUser(bool gender) public {
        uint256 userId = userAddressToIdMapping[msg.sender];
        userMapping[userId].gender = gender;
        userMapping[userId].isVerified = true;

        emit UserEvent(
            userId,
            msg.sender,
            userMapping[userId].name,
            userMapping[userId].age,
            gender,
            userMapping[userId].email,
            userMapping[userId].mobileNo,
            true
        );
    }

    function registerCompany(
        address comAdd,
        string memory name,
        string memory cin
    ) public {
        companyRequestMapping[companyRequestCount] = Company(comAdd, name, cin);
        emit CompanyEvent(
            companyRequestCount,
            comAdd,
            name,
            cin,
            address(0),
            false,
            false
        );
        companyAddressToIdRequestMapping[msg.sender] = companyRequestCount++;
    }

    function acceptCompany(address companyAdd) public isOwner {
        companyMapping[companyCount] = companyRequestMapping[
            companyAddressToIdRequestMapping[companyAdd]
        ];

        companyAddressToIdMapping[companyAdd] = companyCount;

        emit CompanyEvent(
            companyCount,
            companyAdd,
            companyMapping[companyCount].name,
            companyMapping[companyCount].cin,
            address(0),
            true,
            false
        );

        companyCount += 1;

        companyRequestMapping[
            companyAddressToIdRequestMapping[companyAdd]
        ] = companyRequestMapping[companyRequestCount - 1];
        companyAddressToIdRequestMapping[
            companyRequestMapping[companyRequestCount - 1].comAdd
        ] = companyAddressToIdRequestMapping[companyAdd];

        delete companyRequestMapping[companyRequestCount - 1];
        companyRequestCount -= 1;
    }

    function rejectCompany(address companyAdd) public isOwner {
        companyRequestMapping[
            companyAddressToIdRequestMapping[companyAdd]
        ] = companyRequestMapping[companyRequestCount - 1];
        companyAddressToIdRequestMapping[
            companyRequestMapping[companyRequestCount - 1].comAdd
        ] = companyAddressToIdRequestMapping[companyAdd];

        emit CompanyEvent(
            companyAddressToIdRequestMapping[companyAdd],
            companyRequestMapping[companyAddressToIdRequestMapping[companyAdd]]
                .comAdd,
            companyRequestMapping[companyAddressToIdRequestMapping[companyAdd]]
                .name,
            companyRequestMapping[companyAddressToIdRequestMapping[companyAdd]]
                .cin,
            address(0),
            false,
            true
        );

        delete companyRequestMapping[companyRequestCount - 1];

        companyRequestCount -= 1;
    }

    constructor() ERC721("SafeBuy", "SBY") {
        owner = payable(msg.sender);
    }

    function addProduct(string memory name, uint256 price) public {
        productsMapping[productCount++] = Product(
            productCount,
            name,
            price,
            msg.sender
        );
        emit ProductEvent(productCount - 1, name, price, msg.sender);
    }

    function mint(
        uint256 productId,
        string memory man_date,
        string memory ex_date,
        string memory pubKey,
        string memory privateKey,
        string memory tokenURI,
        uint256 validity
    ) public {
        productItemIds.increment();
        uint256 newItemId = productItemIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        id_to_currentURI[newItemId] = 0;

        productItemsMapping[newItemId] = ProductItem({
            productId: productId,
            itemId: newItemId,
            man_date: man_date,
            ex_date: ex_date,
            owner: address(0),
            isPurchased: false,
            pubKey: pubKey,
            privateKey: privateKey,
            purchasedAt: 0,
            validity: validity,
            cid: tokenURI
        });

        emit ProductItemEvent(
            productId,
            newItemId,
            man_date,
            ex_date,
            address(0),
            pubKey,
            privateKey,
            0,
            validity,
            false,
            tokenURI
        );

        privateKeyToProductItemMapping[privateKey] = newItemId;
        pubKeyToPrivateKeyMapping[pubKey] = privateKey;
    }

    function addBulkProducts(
        uint256 productId,
        string[] memory pubKeys,
        string[] memory privateKeys,
        string memory man_date,
        string memory ex_date,
        string[] memory tokenURI,
        uint256 validity
    ) public {
        for (uint256 i = 0; i < pubKeys.length; i++) {
            mint(
                productId,
                man_date,
                ex_date,
                pubKeys[i],
                privateKeys[i],
                tokenURI[i],
                validity
            );
        }
    }

    function fetchProductById(
        uint256 productId
    ) public view returns (Product memory) {
        return productsMapping[productId];
    }

    function fetchAllProductsForCompany(
        address companyAdd
    ) public view returns (Product[] memory) {
        uint256 proCount;
        for (uint256 i = 0; i < productCount; i++) {
            if (productsMapping[i].company == companyAdd) {
                proCount += 1;
            }
        }

        Product[] memory result = new Product[](proCount);
        proCount = 0;

        for (uint256 i = 0; i < proCount; i++) {
            if (productsMapping[i].company == companyAdd) {
                Product storage cur = productsMapping[i];
                result[proCount++] = cur;
            }
        }

        return result;
    }

    function fetchAllProductItemsByProductId(
        uint256 productId
    ) public view returns (ProductItem[] memory) {
        uint256 totalCount = productItemIds.current();

        uint256 proCount;
        for (uint256 i = 0; i < totalCount; i++) {
            if (productItemsMapping[i].productId == productId) {
                proCount += 1;
            }
        }

        ProductItem[] memory result = new ProductItem[](proCount);
        proCount = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            if (productItemsMapping[i].productId == productId) {
                ProductItem storage cur = productItemsMapping[i];
                result[proCount++] = cur;
            }
        }

        return result;
    }

    function fetchProductItemById(
        uint256 itemId
    ) public view returns (ProductItem memory) {
        return productItemsMapping[itemId];
    }

    function fetchProductItemByPrivateKey(
        string memory privateKey
    ) public view returns (uint256 id) {
        return privateKeyToProductItemMapping[privateKey];
    }

    function fetchProductItemByPublicKey(
        string memory publicKey
    ) public view returns (uint256 id) {
        return
            privateKeyToProductItemMapping[
                pubKeyToPrivateKeyMapping[publicKey]
            ];
    }

    function growNFT(uint256 tokenId, string memory tokenURI) private {
        require(id_to_currentURI[tokenId] < 1, "It id impossible to grow more");

        _setTokenURI(tokenId, tokenURI);

        productItemsMapping[tokenId].cid = tokenURI;
        id_to_currentURI[tokenId] += 1;
    }

    function buyProduct(
        string memory privateKey,
        string memory tokenURI
    ) public {
        productItemsMapping[privateKeyToProductItemMapping[privateKey]]
            .isPurchased = true;
        productItemsMapping[privateKeyToProductItemMapping[privateKey]]
            .owner = _msgSender();
        productItemsMapping[privateKeyToProductItemMapping[privateKey]]
            .purchasedAt = block.timestamp;

        emit ProductItemEvent(
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].productId,
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].itemId,
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].man_date,
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].ex_date,
            _msgSender(),
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].pubKey,
            privateKey,
            block.timestamp,
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].validity,
            true,
            productItemsMapping[privateKeyToProductItemMapping[privateKey]].cid
        );

        growNFT(privateKeyToProductItemMapping[privateKey], tokenURI);
    }

    function checkState(string memory pubKey) public view returns (uint256) {
        return
            id_to_currentURI[
                privateKeyToProductItemMapping[
                    pubKeyToPrivateKeyMapping[pubKey]
                ]
            ];
    }

    function checkIfAlreadyPurchased(
        string memory pubKey
    ) public view returns (bool) {
        return
            id_to_currentURI[
                privateKeyToProductItemMapping[
                    pubKeyToPrivateKeyMapping[pubKey]
                ]
            ] > 0;
    }

    // Get all tickets owned by a customer
    function fetchUserItems() public view returns (ProductItem[] memory) {
        uint256 totalItemCount = productItemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (productItemsMapping[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        ProductItem[] memory items = new ProductItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (productItemsMapping[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                ProductItem storage currentItem = productItemsMapping[
                    currentId
                ];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchAllItems() public view returns (ProductItem[] memory) {
        uint256 count = productItemIds.current();

        ProductItem[] memory items = new ProductItem[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 currentId = i + 1;
            ProductItem storage currentItem = productItemsMapping[currentId];
            items[currentId - 1] = currentItem;
            currentId += 1;
        }
        return items;
    }

    function OwnerIs() public view returns (bool) {
        return owner == msg.sender;
    }
}
