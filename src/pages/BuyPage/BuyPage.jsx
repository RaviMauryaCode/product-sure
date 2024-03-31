import React from "react";
import styles from "./BuyPage.module.css";
import { useCallback, useState, useEffect, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useSafeBuyContext } from "../../Context/SafeBuyContext";
import ProductCanvas from "../ProductPage/ProductCanvas";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import tick from "../../images/tick.svg";
import cross from "../../images/cross.svg";

const BuyPage = () => {
    const navigate = useNavigate();
    const { checkIfWalletConnected, currentAccount } = useAuth();
    const [product, setProduct] = useState({});
    const [state, setState] = useState(0);
    const [cidOfCard, setCidOfCard] = useState("");
    const [isBuyLoading, setIsBuyLoading] = useState(false);
    const [imageKey, setImageKey] = useState(0);

    useEffect(() => {
        checkIfWalletConnected();
        fetchProductItem();
    }, []);

    useEffect(() => {
        if (currentAccount !== "") {
            fetchUser();
        }
    }, [currentAccount]);

    const [user, setUser] = useState([]);

    const fetchUser = useCallback(async () => {
        try {
            const user = await fetchUserByAddress(currentAccount);
            setUser(user);
            console.log(user);
        } catch (err) {
            console.log(err);
        }
    });

    const {
        buyProduct,
        fetchProductItemById,
        fetchProductById,
        fetchCompanyByAddress,
        checkState,
        fetchUserByAddress,
        fetchProductItemByPrivateKey,
        uploadFilesToIPFS,
    } = useSafeBuyContext();

    const fetchProductItem = async () => {
        try {
            var companyAddress = window.location.pathname.split("/")[2];
            var priKey = window.location.pathname.split("/")[3];

            const productAllInfo = await fetchProductItemByPrivateKey(priKey);
            console.log(productAllInfo);
            const company = await fetchCompanyByAddress(companyAddress);

            if (productAllInfo === undefined) {
                setProduct(undefined);
            } else {
                const productMoreInfo = await fetchProductById(
                    parseInt(productAllInfo.productId)
                );
                var productItem = {
                    isPurchased: productAllInfo.isPurchased,
                    productName: productMoreInfo.name,
                    companyName: company.name,
                    cin: company.cin,
                    manDate: productAllInfo.man_date,
                    exDate: productAllInfo.ex_date,
                    cid: productAllInfo.cid,
                };
                setCidOfCard(productItem.cid);
                setProduct(productItem);
            }
        } catch (err) {
            console.log(err);
        }
    };

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    const checkProduct = async () => {
        try {
            setIsBuyLoading(true);
            var companyAddress = window.location.pathname.split("/")[2];
            var privateKey = window.location.pathname.split("/")[3];

            var canvases = document.getElementsByClassName("templateCanvas");
            console.log(canvases[0]);
            var url = canvases[0].toDataURL("image/png");

            let file = dataURLtoFile(url, "warranty.png");
            console.log(file);
            downloadFile(file);
            const cid = await uploadFilesToIPFS(file);
            console.log(cid);

            await buyProduct(privateKey, cid);

            toast.success("Product claimed!");
            navigate("/userDashboard");
        } catch (err) {
            console.log(err);
            toast.error("We ran into some error!");
        }
        setIsBuyLoading(false);
    };

    const downloadFile = (fileToDownload) => {
        // Create a Blob from the File object
        const blob = new Blob([fileToDownload], { type: fileToDownload.type });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Get the anchor tag element
        const downloadLink = document.getElementById("downloadLink");

        // Set the download link attributes
        downloadLink.href = url;
        downloadLink.download = "my-file.png";

        // Trigger a click event on the anchor tag to start the download
        downloadLink.click();
    };

    const draw = async (context, entry, height, width) => {
        var img = document.getElementById("templateImage");
        context.drawImage(img, 0, 0, width, height);
        context.font = "28px Arial";
        context.fillStyle = "red";
        context.fillText(user.name, 300, 598);

        context.font = "15px Arial";
        context.fillText(user.userAdd, 300, 555);
    };

    const renderOutput = () => {
        if (product === undefined) {
            return (
                <div className={styles.verifyPageContainer}>
                    <div className={styles.verifyContainer}>
                        <div className={styles.verifyContainer}>
                            <img className={styles.tickIcon} src={cross} />
                            The QR is invalid or the product might not be
                            authentic.
                        </div>
                    </div>
                </div>
            );
        } else if (product.isPurchased === undefined) {
            return (
                <div className={styles.verifyPageContainer}>
                    <div className={styles.verifyContainer}>
                        <BeatLoader color="#ac3fff" />
                    </div>
                </div>
            );
        } else if (product.isPurchased === true) {
            return (
                <div className={styles.verifyPageContainer}>
                    <div className={styles.verifyContainer}>
                        <div className={styles.verifyContainer}>
                            <img className={styles.tickIcon} src={cross} />
                            Product already purchased!
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={styles.verifyPageContainer}>
                    <div className={styles.verifyContainer}>
                        <img className={styles.tickIcon} src={tick} />
                        <span className={styles.verifyDetails}>
                            Product Name:{" "}
                            <span className={styles.detailsContent}>
                                {product.productName}
                            </span>
                        </span>
                        <span className={styles.verifyDetails}>
                            Company:{" "}
                            <span className={styles.detailsContent}>
                                {product.companyName}
                            </span>
                        </span>
                        <span className={styles.verifyDetails}>
                            Company Identification Number:{" "}
                            <span className={styles.detailsContent}>
                                {product.cin}
                            </span>
                        </span>
                        <span className={styles.verifyDetails}>
                            Manufacture Date:{" "}
                            <span className={styles.detailsContent}>
                                {product.manDate}
                            </span>
                        </span>
                        <span className={styles.verifyDetails}>
                            Expiry Date:{" "}
                            <span className={styles.detailsContent}>
                                {product.exDate}
                            </span>
                        </span>
                        <button
                            onClick={checkProduct}
                            className={styles.checkProductBtn}
                        >
                            {isBuyLoading ? (
                                <BeatLoader color="white" />
                            ) : (
                                "Redeem Product"
                            )}
                        </button>
                        <div
                            className={styles.canvasContainer}
                            style={{ display: "none" }}
                        >
                            <ProductCanvas
                                imageKey={imageKey}
                                entry={{
                                    product: product,
                                }}
                                draw={draw}
                                height={900}
                                width={700}
                            />
                        </div>

                        <img
                            onLoad={() => {
                                setImageKey((oldKey) => oldKey + 1);
                            }}
                            key={imageKey}
                            id="templateImage"
                            className={styles.templateImage}
                            height={900}
                            width={700}
                            crossorigin="anonymous"
                            src={`https://violet-sour-falcon-864.mypinata.cloud/ipfs/${product.cid}`}
                        />
                    </div>
                </div>
            );
        }
    };

    return (
        <>
            <a id="downloadLink" />
            {renderOutput()}
        </>
    );
};

export default BuyPage;
