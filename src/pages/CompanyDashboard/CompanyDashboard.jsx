import React from "react";
import styles from "./CompanyDashboard.module.css";
import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";
import { useSafeBuyContext } from "../../Context/SafeBuyContext";
import { useAuth } from "../../Context/AuthContext";
import CloseIcon from '@mui/icons-material/Close';
import { BeatLoader } from "react-spinners";

const customStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(71, 71, 71, 0.75)'
	},
	content: {
		top: "50%",
		left: "50%",
		right: "auto",
		bottom: "auto",
		marginRight: "-50%",
		transform: "translate(-50%, -50%)",
		borderRadius: '0.6rem'
	},
};

const CompanyDashboard = () => {
	const navigate = useNavigate();
	const [compData, setCompData] = useState([]);

	const { checkIfWalletConnected, currentAccount } = useAuth();
	const [setIsAddProductLoading, setIsProductLoading] = useState(false);

	useEffect(() => {
		checkIfWalletConnected();
	}, [currentAccount]);

	const {
		fetchCompanyByAddress,
		fetchAllProductItemsByProductId,
		fetchAllProducts,
		addProduct,
	} = useSafeBuyContext();

	const fetchUser = useCallback(async () => {
		try {
			const company = await fetchCompanyByAddress(currentAccount);
			if(company === undefined) {
				navigate("/registerCompany");
			}
			setCompData(company);
			console.log("comp", company);
		} catch (err) {
			// navigate("/registerCompany");
			console.log(err);
		}
	});

	useEffect(() => {
		if (currentAccount) fetchUser();
	}, [currentAccount]);

	const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
	const [productNameInModal, setProductNameInModal] = useState("");
	const [productPriceInModal, setProductPriceInModal] = useState("");

	const fetchProducts = useCallback(async () => {
		const result = await fetchAllProducts(currentAccount);
		console.log(result);
		var res = [];
		for (let i = 0; i < result.length; i++) {
			const data = await fetchAllProductItemsByProductId(
				result[i].productId
			);

			console.log(data);

			res.push({
				name: result[i].name,
				count: data.length,
				productId: result[i].productId,
				price: result[i].price,
			});
		}
		setProducts(res);
		console.log(res);
	});

	useEffect(() => {
		if (currentAccount) {
			fetchUser();
			fetchProducts();
		}
	}, [currentAccount]);

	const [products, setProducts] = useState([
		
	]);

	const closeAddProductModal = () => {
		setIsAddProductModalOpen(false);
	};

	const openAddProductModal = () => {
		setIsAddProductModalOpen(true);
	};

	const handleAddProduct = async (e) => {
		e.preventDefault();
		try {
			setIsProductLoading(true);
			await addProduct(
				productNameInModal,
				productPriceInModal
			);
			toast.success("Product Added!");
			setIsAddProductModalOpen(false);
			fetchProducts();
		} catch (err) {
			console.log(err);
		}
		setIsProductLoading(false);
	};

	return (
		<>
			<ToastContainer />
			<Modal
				isOpen={isAddProductModalOpen}
				onRequestClose={closeAddProductModal}
				style={customStyles}
				contentLabel="Example Modal"
			>
				<div className={styles.addProductModalContainer}>
					<button className={styles.modalCloseBtn} onClick={closeAddProductModal}><CloseIcon /></button>

					<div className={`${styles.inputContainer}`}>
						<label className={`${styles.inputLabel}`}>
							Product Name
						</label>
						<input
							className={`${styles.input}`}
							type="text"
							onChange={(e) => setProductNameInModal(e.target.value)}
							value={productNameInModal}
						/>
					</div>
					<div className={`${styles.inputContainer}`}>
						<label className={`${styles.inputLabel}`}>
							Product Price (MRP in ₹)
						</label>
						<input
							className={`${styles.input}`}
							type="text"
							onChange={(e) =>
								setProductPriceInModal(e.target.value)
							}
							value={productPriceInModal}
						/>
					</div>
					

					<button className={styles.addProductModalBtn} onClick={handleAddProduct}>
						{setIsAddProductLoading ? <BeatLoader color="white" /> : "Add Product"}
					</button>
				</div>
			</Modal>
			<div className={styles.companyDashboardContainer}>
				<div className={styles.dashboardBox}>
					<div className={styles.heading}>
						Welcome <span className={styles.accountName}>{compData.name}</span>
					</div>
					<div className={styles.detailsBox}>
						<span className={styles.detailsHeading}>
							Company Details
						</span>
						<div className={styles.detailsBoxContent}>
							<span className={styles.key}>Public Address: </span>
							<span className={styles.name}>
								{compData.comAdd}
							</span>
							<span className={styles.key}>Company Name: </span>
							<span className={styles.name}>{compData.name}</span>
							<span className={styles.key}>
								Corporate Identification Number:{" "}
							</span>
							<span className={styles.name}>{compData.cin}</span>
							<span className={styles.key}>Email ID: </span>
							<span className={styles.name}>
								{compData.email}
							</span>
						</div>
					</div>

					<div className={styles.detailsBox}>
						<div className={styles.detailsHeading}>
							<span>Products</span>
							<div>
								<button className={styles.viewAllBtn}>
									View All
								</button>
								<button
									onClick={openAddProductModal}
									className={styles.addProductBtn}
								>
									Add Product
								</button>
							</div>
						</div>
						{products.length > 0 ? (
							<>
								<div className={styles.docCardHeader}>
									<span className={styles.docCardContent}>
										Product Name
									</span>
									<span className={styles.docCardContent}>
										Codes Generated
									</span>
								</div>
								{products.map((item, index) => {
									return (
										<div
											className={
												index % 2 === 0
													? `${styles.docCard} ${styles.evenDocCard}`
													: `${styles.docCard} ${styles.oddDocCard}`
											}
											onClick={() => {
												navigate(
													`/product/${item.productId}`
												);
												//   openDocPage(item.file.cid, item.file.fileName);
											}}
										>
											<span
												className={
													styles.docCardContent
												}
											>
												{item.name}
											</span>
											<span
												className={
													styles.docCardContent
												}
											>
												{item.count}
											</span>
										</div>
									);
								})}
							</>
						) : (
							<span className={styles.emptyListMessage}>
								No products found
							</span>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default CompanyDashboard;
