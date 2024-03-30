import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from '../../images/bg.png';
import styles from './HomePage.module.css';
import logo from '../../images/logo.svg';
import PersonIcon from '@mui/icons-material/Person';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import one from '../../images/one.png';
import two from '../../images/two.png';
import three from '../../images/three.png';

const HomePage = () => {

    const navigate = useNavigate();

    const navigateToUserRegisterPage = () => {
        navigate("/register");
    }
    const navigateToCompanyRegisterPage = () => {
        navigate("/registerCompany");
    }

    const [fileImg, setFileImg] = useState(null);

    const uploadToPinata = async () => {
        console.log(fileImg);
        const formData = new FormData();
        formData.append("file", fileImg);

        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
                'pinata_api_key': "725e80b25f3f5cfbadf0",
                'pinata_secret_api_key': "093fe3d066643fd61d9d5ff2d9684fbe7280301d8cedb8c91d9684a4bc7ac8a5",
                "Content-Type": "multipart/form-data"
            },
        });

        const ImgHash = `https://violet-sour-falcon-864.mypinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        console.log(ImgHash); // Check your Pinata Pinned section to see the new file added.
    }

    return (
        <div className={styles.homePageContainer}>
            <input type="file" onChange={(e) => setFileImg(e.target.files[0])} />
            <button onClick={() => {
                uploadToPinata();
            }}>Upload to IPFS</button>
            <div
                style={{ backgroundImage: `url(${bg})` }}
                className={styles.heroSection}
            >
                <div className={styles.logoSection}>
                    <img className={styles.logoImg} src={logo} alt="" />
                </div>
                <div className={styles.descSection}>
                    <span>Building a secure & efficient solution<br />
                        for Product Verification</span>
                    <div className={styles.heroBtnContainer}>
                        <button onClick={navigateToUserRegisterPage} className={`${styles.registerBtn} ${styles.userBtn}`}>
                            <PersonIcon className={styles.btnIcon} />
                            User
                        </button>
                        <button onClick={navigateToCompanyRegisterPage} className={styles.registerBtn}>
                            <CorporateFareIcon className={styles.btnIcon} />
                            Company
                        </button>
                    </div>
                </div>
            </div>

            <span className={styles.sectionHeader}>Special Features</span>
            <div className={styles.infoContainer}>
                <div className={styles.infoCard}>
                    <img className={styles.infoImage} src={one} alt="" />
                    <span>Secured by Blockchain</span>
                </div>

                <div className={styles.infoCard}>
                    <img className={styles.infoImage} src={two} alt="" />
                    <span>Easy Product Verification</span>
                </div>
                
                <div className={styles.infoCard}>
                    <img className={styles.infoImage} src={three} alt="" />
                    <span>Gasless Transactions</span>
                </div>
            </div>
        </div>
    );
}

export default HomePage;