import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from "../../Context/AuthContext";
import { useSafeBuyContext } from "../../Context/SafeBuyContext";
import { toast } from "react-toastify";
import {
    AnonAadhaarProof,
    LogInWithAnonAadhaar,
    useAnonAadhaar,
    useProver,
} from "@anon-aadhaar/react";
import { useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import styled from 'styled-components';


const AnonLogin = () => {

    const [anonAadhaar] = useAnonAadhaar();
    const [, latestProof] = useProver();
    const navigate = useNavigate();
    const { checkIfWalletConnected, currentAccount } = useAuth();
    const { verifyUser, fetchUserByAddress } = useSafeBuyContext();
    useEffect(() => {
        checkIfWalletConnected();
        if (currentAccount) fetchUser();
    }, [currentAccount]);

    useEffect(() => {
        handleAnon();
    }, [latestProof])

    const handleAnon = async () => {
        if (latestProof && userGender !== "") {
            const anonData = JSON.parse(latestProof);
            // console.log(anonData)
            if (anonData?.proof.ageAbove18) {
                // console.log(anonData.proof.ageAbove18);
                if (anonData.proof.gender === "77" && userGender === "M" || anonData?.proof.gender === "70" && userGender === "F") {
                    console.log("Verify User...")
                    const receipt = await verifyUser(
                        anonData.proof.gender === "77"
                    );
                    console.log(receipt);
                    console.log("user verified.")
                    toast.success("User verified successfully");
                    fetchUser();
                }
                else {
                    toast.error("Please enter correct gender.")
                    console.log("Incorrect Gender")
                }
            }
            else {
                toast.error("Only users 18 or above are allowed")
            }
        }
    }

    const fetchUser = useCallback(async () => {
        try {
            const user = await fetchUserByAddress(currentAccount);
            console.log(user);
            if (user.name === "") {
                navigate("/register");
            }else if(user.isVerified){
                navigate("/userDashboard");
            }
        } catch (err) {
            console.log(err)
            console.log("User cannot be fetched")
        }
    });

    const [userGender, setUserGender] = useState("")

    useEffect(() => {
        console.log(userGender)
    }, [userGender]);

    const handleGenderChange = (event) => {
        setUserGender(event.target.value);
        console.log(userGender, "gg") // Update the state with the new value
    };

    return (
        <AnonFullPage>
            <PageHeader>
				Almost there...<br/>Just your Gender and Age verification
			</PageHeader>
            <GenderPicker>
                <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-filled-label">Gender</InputLabel>
                    <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={userGender}
                    onChange={handleGenderChange}
                    >
                    <MenuItem value={""}>Select</MenuItem>
                    <MenuItem value={"M"}>Male</MenuItem>
                    <MenuItem value={"F"}>Female</MenuItem>
                    </Select>
                </FormControl>
            </GenderPicker>
            

            <LogInWithAnonAadhaar nullifierSeed={1234} fieldsToReveal={["revealAgeAbove18", "revealGender"]} />

            <div className="flex flex-col items-center gap-4 rounded-2xl max-w-screen-sm mx-auto p-8">
                {/* Render the proof if generated and valid */}
                {anonAadhaar.status === "logged-in" && (
                    <>
                        {latestProof && (
                            <AnonAadhaarProof
                                code={JSON.stringify(JSON.parse(latestProof), null, 2)}
                            />
                        )}
                    </>
                )}
            </div>
        </AnonFullPage>
    )
}

const AnonFullPage = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    justify-content: center;
`;

const PageHeader = styled.div`
    font-size: 25px;
	font-weight: 700;
	text-align: center;
	width: 100%;
	color: #981EF8;
	margin-bottom: 20px;
`;

const GenderPicker = styled.div`
    margin-bottom: 2rem;
`;

export default AnonLogin