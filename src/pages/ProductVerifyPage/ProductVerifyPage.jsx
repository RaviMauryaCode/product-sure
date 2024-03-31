import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../Context/AuthContext";
import { useSafeBuyContext } from "../../Context/SafeBuyContext";
import styles from "./ProductVerifyPage.module.css";
import tick from "../../images/tick.svg";
import cross from "../../images/cross.svg";
import { BeatLoader } from "react-spinners";

const ProductVerifyPage = () => {
    const { checkIfWalletConnected, currentAccount } = useAuth();
    const [product, setProduct] = useState({});
    const [state, setState] = useState(0);

    useEffect(() => {
        checkIfWalletConnected();
        fetchProductItem();
        // checkStateOfProductItem();
    }, [currentAccount]);

    const {
        fetchProductItemById,
        fetchProductById,
        fetchCompanyByAddress,
        checkState,
        fetchProductItemByPublicKey,
    } = useSafeBuyContext();

    const fetchProductItem = useCallback(async () => {
        try {
            var companyAddress = window.location.pathname.split("/")[2];
            var pubKey = window.location.pathname.split("/")[3];

            const productAllInfo = await fetchProductItemByPublicKey(pubKey);
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
                };
                setProduct(productItem);
            }
        } catch (err) {
            console.log(err);
        }
    });

    const renderOutput = () => {
        if (product === undefined) {
            return (
                <div className={styles.verifyPageContainer}>
                    <div className={styles.verifyContainer}>
                        <div className={styles.verifyContainer}>
                            <img className={styles.tickIcon} src={cross} />
                            The QR is invalid or the product might not be authentic.
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
            return (<div className={styles.verifyPageContainer}>
                <div className={styles.verifyContainer}>
                    <div className={styles.verifyContainer}>
                        <img className={styles.tickIcon} src={cross} />
                        Product already purchased!
                    </div>
                </div>
            </div>)
        } else {
            return (
                <div className={styles.verifyPageContainer}>
                    <div className={styles.verifyContainer}>
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
                        </div>
                    </div>
                </div>
            );
        }
    };

    return <>{renderOutput()}</>;
};

export default ProductVerifyPage;
