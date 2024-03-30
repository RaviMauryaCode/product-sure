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
        if (latestProof) {
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
                    navigate("/userDashboard");
                }
                else {
                    alert("Please enter correct gender.")
                    console.log("Incorrect Gender")
                }
            }
            else {
                alert("Only users 18 or above are allowed")
                navigate("/register");
                console.log("PDF")
            }
        }
    }

    const fetchUser = useCallback(async () => {
        try {
            // toast.warn("")
            const user = await fetchUserByAddress(currentAccount);
            console.log(user);
            if (user.name === "" ) {
                navigate("/register");
            }
        } catch (err) {
            console.log(err)
            console.log("User cannot be fetched")
        }
    });

    const [userGender, setUserGender] = useState("")
    const handleGenderChange = (event) => {
        setUserGender(event.target.value);
        console.log(userGender, "gg") // Update the state with the new value
    };

    return (
        <div>
            {/* <input
        id="text-input"
        type="text"
        value={userGender} // Bind the input value to the state
        onChange={handleChange} // Call handleChange function on input change
      /> */}
            <select id="gender-select" onChange={handleGenderChange}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>

            </select>

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
        </div>
    )
}

export default AnonLogin