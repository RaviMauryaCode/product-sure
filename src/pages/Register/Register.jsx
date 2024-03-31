import React, { useCallback, useEffect, useState } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useSafeBuyContext } from "../../Context/SafeBuyContext";
import { useAuth } from "../../Context/AuthContext";
import { BeatLoader, BounceLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";

const Register = () => {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [age, setAge] = useState(0);
	const [gender, setGender] = useState("");

	const [mobileNo, setMobileNo] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { checkIfWalletConnected, currentAccount } = useAuth();

	useEffect(() => {
		checkIfWalletConnected();
		if (currentAccount) fetchUser();
	}, [currentAccount]);

	const { registerUser, fetchUserByAddress, isOwnerAddress } = useSafeBuyContext();
	const fetchUser = useCallback(async () => {
		try {
			const user = await fetchUserByAddress(currentAccount);
			console.log(user,"user details");
			if (user.name !== "") {
				navigate("/userDashboard");
				return;
			} else if(user.isVerified === false){
				navigate("/anonVerify");
				return;
			}
			var isOwner = await isOwnerAddress();
			if(isOwner){
				navigate("/admin");
			}
		} catch (err) {
			console.log(err)
			console.log("User cannot be fetched")
		}
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if(name == "" || email == "" || mobileNo == ""){
				toast.error("Enter all details first");
				return;
			} else{
				setIsLoading(true);
				toast.warn("Please wait for a moment");
				await registerUser(
					currentAccount,
					name,
					email,
					mobileNo,
					true,
					age
				);
				toast.success("User registered successfully");
				navigate("/anonVerify");
			}

		} catch (err) {
			console.log(err);
			toast.error("User not registered");
		}
		setIsLoading(false);
		console.log("Register");
	};

	return (
		<>
		<ToastContainer />
			<div className={styles.registerPageContainer}>
				<form className={`${styles.formBox}`} onSubmit={handleSubmit}>
					<div className={`${styles.header}`}>
						Want to make your Product Purchases safer?
					</div>
					<h2 className={`${styles.heading}`}>Register</h2>
					<div className={`${styles.inputContainer}`}>
						<label className={`${styles.inputLabel}`}>
							Full Name
						</label>
						<input
							className={`${styles.input}`}
							type="text"
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
					</div>
					<div className={`${styles.inputContainer}`}>
						<label className={`${styles.inputLabel}`}>Email</label>
						<input
							className={`${styles.input}`}
							type="text"
							onChange={(e) => setEmail(e.target.value)}
							value={email}
						/>
					</div>
					<div className={`${styles.inputContainer}`}>
						<label className={`${styles.inputLabel}`}>
							Mobile No
						</label>
						<input
							className={`${styles.input}`}
							placeholder="+91"
							type="text"
							onChange={(e) => setMobileNo(e.target.value)}
							value={mobileNo}
						/>
					</div>

					<button
						className={styles.registerBtn}
						onClick={handleSubmit}
					>
						{isLoading ? <BeatLoader color={"white"} /> : <>Register
						<ArrowForwardIcon className={styles.arrowForwardIcon} />
						</>}
					</button>
				</form>
			</div>
		</>
	);
};

export default Register;
